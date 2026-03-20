import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

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
  const PORT = 3000;

  app.use(cors());
  
  // Use JSON parser and capture raw body for signature verification
  app.use(express.json({
    verify: (req, res, buf) => {
      (req as express.Request).rawBody = buf;
    }
  }));

  // --- WEBHOOK ENDPOINTS ---

  // Generic function to grant access
  async function grantAccess(email: string, provider: string) {
    const adminApp = getFirebaseAdmin();
    if (!adminApp) throw new Error("Firebase Admin not configured. Cannot grant access.");
    
    const db = getFirestore(adminApp);
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
