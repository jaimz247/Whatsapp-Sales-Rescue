import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth, sendMagicLink, completeMagicLinkSignIn, signInWithGoogle, logout, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  isFirstTime: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  confirmAccess: () => Promise<void>;
  completeSignIn: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let isFirstTime = true;
          let isAdmin = false;
          
          // Check if user is one of the hardcoded admins or has the admin role
          if (firebaseUser.email === 'elevatemensah@gmail.com' || firebaseUser.email === 'jaxx700@gmail.com') {
            isAdmin = true;
          }

          if (userDoc.exists()) {
             const userData = userDoc.data();
             if (userData.accessStatus === 'revoked') {
               await logout();
               setUser(null);
               setIsLoading(false);
               return;
             }
             isFirstTime = !userData.onboardingCompleted;
             if (userData.role === 'admin') {
               isAdmin = true;
             }
             // Update last login
             await setDoc(userDocRef, {
               lastLoginAt: serverTimestamp()
             }, { merge: true });
          } else {
             // Fallback if doc wasn't created during sign in
             await setDoc(userDocRef, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                accessStatus: 'active',
                upgradeStatus: 'free',
                onboardingCompleted: false,
                role: isAdmin ? 'admin' : 'user'
             });
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isFirstTime,
            isAdmin
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load user profile");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      // In development/preview, we might need to use the current origin
      const redirectUrl = `${window.location.origin}/access`;
      await sendMagicLink(email, redirectUrl);
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      toast.error(error.message || "Failed to send magic link");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignIn = async (url: string) => {
    setIsLoading(true);
    try {
      await completeMagicLinkSignIn(url);
    } catch (error: any) {
      console.error("Error completing sign in:", error);
      toast.error(error.message || "Failed to complete sign in");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAccess = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { onboardingCompleted: true }, { merge: true });
        setUser({ ...user, isFirstTime: false });
      } catch (error: any) {
        console.error("Error updating onboarding status:", error);
        toast.error("Failed to update onboarding status");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error(error.message || "Failed to sign in with Google");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInWithGoogle: handleGoogleSignIn, signOut: handleSignOut, confirmAccess, completeSignIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
