import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, sendMagicLink, completeMagicLinkSignIn, logout, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  isFirstTime: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
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
          if (userDoc.exists()) {
             isFirstTime = !userDoc.data().onboardingCompleted;
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
                onboardingCompleted: false
             });
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isFirstTime
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
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
    } catch (error) {
      console.error("Error sending magic link:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignIn = async (url: string) => {
    setIsLoading(true);
    try {
      await completeMagicLinkSignIn(url);
    } catch (error) {
      console.error("Error completing sign in:", error);
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
      } catch (error) {
        console.error("Error updating onboarding status:", error);
      }
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut: handleSignOut, confirmAccess, completeSignIn }}>
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
