import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import Stripe from "stripe";

dotenv.config();

import fs from "fs";

// Read Firebase config to get the database ID
let firestoreDatabaseId = "(default)";
try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (configData.firestoreDatabaseId) {
      firestoreDatabaseId = configData.firestoreDatabaseId;
    }
  }
} catch (error) {
  console.warn("⚠️ Could not read firebase-applet-config.json, defaulting to '(default)' database.");
}

// Extend Express Request to include rawBody for Stripe and Paystack verification
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

// Initialize Firebase Admin
let firebaseApp: App | null = null;
function getFirebaseAdmin() {
  if (!firebaseApp) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Webhooks requiring DB access will fail.");
      return null;
    }
    try {
      firebaseApp = initializeApp({
        credential: cert(JSON.parse(serviceAccountJson))
      });
      console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin:", error);
      return null;
    }
  }
  return firebaseApp;
}

// Attempt to initialize on startup
getFirebaseAdmin();

async function verifyPayPalWebhook(req: express.Request) {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_MODE } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_WEBHOOK_ID) {
    console.warn("⚠️ Missing PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET). Skipping strict verification.");
    // Fail securely if credentials are not configured
    throw new Error("Missing PayPal credentials for verification.");
  }

  const baseUrl = PAYPAL_MODE === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com';

  // 1. Get Access Token
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  if (!tokenRes.ok) throw new Error("Failed to get PayPal access token");
  const { access_token } = await tokenRes.json() as any;

  // 2. Verify Webhook Signature
  const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth_algo: req.headers['paypal-auth-algo'],
      cert_url: req.headers['paypal-cert-url'],
      transmission_id: req.headers['paypal-transmission-id'],
      transmission_sig: req.headers['paypal-transmission-sig'],
      transmission_time: req.headers['paypal-transmission-time'],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: req.body
    })
  });
  
  if (!verifyRes.ok) throw new Error("Failed to verify PayPal webhook signature");
  const verifyData = await verifyRes.json() as any;
  
  return verifyData.verification_status === 'SUCCESS';
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Global request logger to see exactly what is hitting the server
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Extremely permissive CORS for webhooks
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*' // Allow all headers to prevent any CORS blocks
  }));
  
  // Explicitly handle preflight OPTIONS requests for all routes
  app.options('*', cors());
  
  // Use JSON parser and capture raw body for signature verification
  app.use(express.json({
    verify: (req, res, buf) => {
      (req as express.Request).rawBody = buf;
    }
  }));

  // Parse URL-encoded bodies (for form data)
  app.use(express.urlencoded({ extended: true }));

  // --- WEBHOOK ENDPOINTS ---

  // Generic function to grant access
  async function grantAccess(email: string, provider: string) {
    const adminApp = getFirebaseAdmin();
    if (!adminApp) throw new Error("Firebase Admin not configured. Cannot grant access.");
    
    const db = getFirestore(adminApp, firestoreDatabaseId);
    const normalizedEmail = email.toLowerCase().trim();
    
    await db.collection('allowed_users').doc(normalizedEmail).set({
      addedAt: FieldValue.serverTimestamp(),
      addedBy: `webhook:${provider}`
    });
    console.log(`🎉 Granted access to ${normalizedEmail} via ${provider}`);
  }

  // 1. PayPal Webhook
  app.post("/api/webhooks/paypal", async (req, res) => {
    try {
      // Verify PayPal signature
      const isValid = await verifyPayPalWebhook(req);
      if (!isValid) {
        console.error("❌ Invalid PayPal signature");
        return res.status(401).send("Invalid signature");
      }

      const event = req.body;
      console.log("✅ Verified PayPal Webhook:", event.event_type);
      
      if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'CHECKOUT.ORDER.APPROVED') {
        const email = event.resource?.payer?.email_address || event.resource?.subscriber?.email_address;
        if (email) {
          await grantAccess(email, 'paypal');
        }
      }
      res.status(200).send('Webhook received');
    } catch (error: any) {
      console.error('❌ PayPal Webhook Error:', error.message);
      res.status(500).send('Webhook Error');
    }
  });

  // 2. Paystack Webhook
  app.post("/api/webhooks/paystack", async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set");

      // Verify Paystack signature
      const hash = crypto.createHmac('sha512', secret).update(req.rawBody as Buffer).digest('hex');
      if (hash !== req.headers['x-paystack-signature']) {
        console.error("❌ Invalid Paystack signature");
        return res.status(401).send("Invalid signature");
      }

      const event = req.body;
      console.log("✅ Verified Paystack Webhook:", event.event);
      
      if (event.event === 'charge.success') {
        const email = event.data?.customer?.email;
        if (email) {
          await grantAccess(email, 'paystack');
        }
      }
      res.status(200).send('Webhook received');
    } catch (error: any) {
      console.error('❌ Paystack Webhook Error:', error.message);
      res.status(500).send('Webhook Error');
    }
  });

  // 3. Flutterwave Webhook
  app.post("/api/webhooks/flutterwave", async (req, res) => {
    try {
      const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
      if (!secretHash) throw new Error("FLUTTERWAVE_SECRET_HASH is not set");

      // Verify Flutterwave signature
      const signature = req.headers['verif-hash'];
      if (signature !== secretHash) {
        console.error("❌ Invalid Flutterwave signature");
        return res.status(401).send("Invalid signature");
      }

      const event = req.body;
      console.log("✅ Verified Flutterwave Webhook:", event.event);
      
      if (event.event === 'charge.completed' && event.data?.status === 'successful') {
        const email = event.data?.customer?.email;
        if (email) {
          await grantAccess(email, 'flutterwave');
        }
      }
      res.status(200).send('Webhook received');
    } catch (error: any) {
      console.error('❌ Flutterwave Webhook Error:', error.message);
      res.status(500).send('Webhook Error');
    }
  });

  // 4. Free Access Webhook (Coupon Bypass)
  // We use two routes here in case ad-blockers block URLs containing "webhook"
  const freeAccessHandler = async (req: express.Request, res: express.Response) => {
    console.log(`📥 Received Free Access request on ${req.url}`);
    console.log("Headers:", { ...req.headers, authorization: '***' });
    console.log("Body:", req.body);
    
    try {
      const secret = process.env.FREE_ACCESS_SECRET;
      if (!secret) {
        console.error("❌ FREE_ACCESS_SECRET is not set in environment variables");
        return res.status(500).send("Server configuration error");
      }

      // Check for the secret in headers or body
      const providedSecret = req.headers['x-free-access-secret'] || req.body?.secret;
      
      if (providedSecret !== secret) {
        console.error(`❌ Invalid free-access secret. Expected: ${secret}, Got: ${providedSecret}`);
        return res.status(401).send("Unauthorized: Invalid secret");
      }

      const email = req.body?.email;
      if (!email || typeof email !== 'string') {
        console.error("❌ Missing or invalid email in payload:", req.body);
        return res.status(400).send("Valid email is required in the payload");
      }

      await grantAccess(email, 'free-coupon');
      console.log(`✅ Successfully granted free access to ${email}`);
      res.status(200).send('Webhook received and access granted');
    } catch (error: any) {
      console.error('❌ Free Access Webhook Error:', error.message);
      res.status(500).send('Webhook Error: ' + error.message);
    }
  };

  app.post("/api/webhooks/free-access", freeAccessHandler);
  app.post("/api/access/grant-free", freeAccessHandler);

  // 5. Stripe Webhook
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!stripeSecret || !webhookSecret) {
        throw new Error("Stripe keys not configured");
      }

      const stripe = new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' });
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).send('Missing stripe-signature header');
      }
      
      const sigString = Array.isArray(signature) ? signature[0] : signature;

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.rawBody as Buffer, sigString, webhookSecret);
      } catch (err: any) {
        console.error(`❌ Stripe signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log("✅ Verified Stripe Webhook:", event.type);

      if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const dataObject = event.data.object as any;
        const email = dataObject.customer_details?.email || dataObject.receipt_email;
        
        if (email) {
          await grantAccess(email, 'stripe');
        }
      }

      res.status(200).send('Webhook received');
    } catch (error: any) {
      console.error('❌ Stripe Webhook Error:', error.message);
      res.status(500).send('Webhook Error');
    }
  });

  // 6. Selar Webhook
  app.post("/api/webhooks/selar", async (req, res) => {
    try {
      const event = req.body;
      console.log("✅ Received Selar Webhook", JSON.stringify(event));
      
      const adminApp = getFirebaseAdmin();
      if (adminApp) {
        const db = getFirestore(adminApp, firestoreDatabaseId);
        await db.collection('webhook_logs').add({
          provider: 'selar',
          payload: event,
          createdAt: FieldValue.serverTimestamp()
        });
      }
      
      // Selar payload variations
      let email = null;
      if (typeof event === 'string') {
        try {
          const parsed = JSON.parse(event);
          email = parsed.data?.customer?.email || parsed.customer?.email || parsed.email || parsed.data?.email;
        } catch (e) {}
      } else {
        email = event.data?.customer?.email || event.customer?.email || event.email || event.data?.email;
      }
      
      if (email) {
        await grantAccess(email, 'selar');
      }

      res.status(200).send('Webhook received');
    } catch (error: any) {
      console.error('❌ Selar Webhook Error:', error.message);
      res.status(500).send('Webhook Error');
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
