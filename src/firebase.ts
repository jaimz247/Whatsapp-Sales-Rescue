import { initializeApp } from 'firebase/app';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, sendSignInLinkToEmail, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Auth Helpers
export const sendMagicLink = async (email: string, redirectUrl: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Always allow hardcoded admins
  const isHardcodedAdmin = normalizedEmail === 'elevatemensah@gmail.com' || normalizedEmail === 'jaxx700@gmail.com';
  
  if (!isHardcodedAdmin) {
    // Check if email is in allowed_users collection
    const allowedUserDoc = await getDocFromServer(doc(db, 'allowed_users', normalizedEmail));
    
    if (!allowedUserDoc.exists()) {
      throw new Error('Unauthorized email address. Access denied. Please purchase access first.');
    }
  }

  const actionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

export const completeMagicLinkSignIn = async (url: string) => {
  if (isSignInWithEmailLink(auth, url)) {
    let email = window.localStorage.getItem('emailForSignIn');
    
    if (!email) {
      try {
        const urlObj = new URL(url);
        email = urlObj.searchParams.get('email');
      } catch (e) {
        // ignore
      }
    }
    
    if (!email) {
      throw new Error('MISSING_EMAIL_FOR_SIGN_IN');
    }

    if (email) {
      const result = await signInWithEmailLink(auth, email, url);
      window.localStorage.removeItem('emailForSignIn');
      
      // Create user profile if it doesn't exist
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDocFromServer(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: result.user.email,
          createdAt: serverTimestamp(),
          onboardingCompleted: false
        });
      }
      return result.user;
    }
  }
  throw new Error('Invalid or expired sign-in link.');
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const normalizedEmail = result.user.email?.toLowerCase().trim();
  
  if (!normalizedEmail) {
    await signOut(auth);
    throw new Error('Could not get email from Google account.');
  }

  // Always allow hardcoded admins
  const isHardcodedAdmin = normalizedEmail === 'elevatemensah@gmail.com' || normalizedEmail === 'jaxx700@gmail.com';
  
  if (!isHardcodedAdmin) {
    // Check if email is in allowed_users collection
    const allowedUserDoc = await getDocFromServer(doc(db, 'allowed_users', normalizedEmail));
    
    if (!allowedUserDoc.exists()) {
      await signOut(auth);
      throw new Error('Unauthorized email address. Access denied. Please purchase access first.');
    }
  }

  // Create user profile if it doesn't exist
  const userDocRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDocFromServer(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      email: result.user.email,
      displayName: result.user.displayName || '',
      photoURL: result.user.photoURL || '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      accessStatus: 'active',
      upgradeStatus: 'free',
      onboardingCompleted: false,
      role: isHardcodedAdmin ? 'admin' : 'user'
    });
  } else {
    // Update last login
    await setDoc(userDocRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  }
  
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};

// Error Handling Helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
