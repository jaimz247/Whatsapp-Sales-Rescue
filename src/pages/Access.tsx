import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  LogOut,
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';

type AccessState = 'landing' | 'signin-email' | 'password-entry' | 'check-email' | 'welcome' | 'success' | 'error' | 'expired-link' | 'logged-out' | 'verifying' | 'confirm-email';

export default function Access() {
  const [state, setState] = useState<AccessState>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { signInWithGoogle, user, confirmAccess, signOut, completeSignIn, verifyEmailAccess, logInEmailPass, signUpEmailPass, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [lastVisited, setLastVisited] = useState<string | null>(null);

  // Handle logout state if coming from logout action
  useEffect(() => {
    if (location.state?.loggedOut) {
      setState('logged-out');
    }
    setLastVisited(localStorage.getItem('rescueKit_lastVisited'));
  }, [location]);

  // Check for magic link on mount
  useEffect(() => {
    const checkMagicLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setState('verifying');
        try {
          await completeSignIn(window.location.href);
          // The onAuthStateChanged listener in AuthContext will handle the redirect
        } catch (err: any) {
          console.error("Magic link error:", err);
          if (err.message === 'MISSING_EMAIL_FOR_SIGN_IN') {
            setState('confirm-email');
            return;
          }
          setError('Invalid or expired sign-in link. Please request a new one.');
          setState('expired-link');
        }
      }
    };
    checkMagicLink();
  }, [completeSignIn]);

  // Handle resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid buyer email address.');
      setState('error');
      return;
    }

    setIsProcessing(true);
    
    try {
      const hasAccess = await verifyEmailAccess(email);
      if (!hasAccess) {
        setError("Your email hasn't been approved for access yet. Please purchase access first or use the correct email.");
        setState('error');
        return;
      }
      
      setState('password-entry');
    } catch (err) {
      console.error("Check email error:", err);
      setError('Access denied. Please check your email or contact support.');
      setState('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      if (authMode === 'signup') {
        try {
          await signUpEmailPass(email, password);
        } catch (signupErr: any) {
          if (signupErr.message.includes('auth/email-already-in-use')) {
            setError('Account already exists. Please switch to Sign In.');
          } else {
            throw signupErr;
          }
        }
      } else {
        try {
          await logInEmailPass(email, password);
        } catch (loginErr: any) {
          if (loginErr.message.includes('auth/invalid-credential') || loginErr.message.includes('auth/user-not-found') || loginErr.message.includes('Firebase: Error')) {
            setError('Invalid email or password. If this is your first time, please switch to Create Account.');
          } else {
            throw loginErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (!error) setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    try {
      await sendPasswordReset(email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      // Ignored
    }
  };

  // Watch for user changes to transition states
  useEffect(() => {
    if (user) {
      if (user.isFirstTime) {
        setState('welcome');
      } else {
        setState('success');
        setTimeout(() => navigate('/'), 2000);
      }
    }
  }, [user, navigate]);

  const handleStart = () => {
    setState('success');
    setTimeout(() => navigate('/'), 1500);
  };

  const handleConfirmEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsProcessing(true);
    // Temporarily set it so completeSignIn can use it
    window.localStorage.setItem('emailForSignIn', email);
    
    try {
      await completeSignIn(window.location.href);
    } catch (err: any) {
      console.error("Confirm email error:", err);
      setError('Invalid email or expired sign-in link. Please request a new one.');
      setState('expired-link');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'verifying':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium text-neutral-900 mb-2 tracking-tight">Verifying link...</h2>
            <p className="text-neutral-500 font-light text-[15px]">
              Please wait a moment.
            </p>
          </motion.div>
        );

      case 'confirm-email':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Mail size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-3 tracking-tight">Confirm your email</h2>
              <p className="text-neutral-500 font-light text-[15px]">Please enter the email address you used to request this link.</p>
            </div>
            
            <form onSubmit={handleConfirmEmailSubmit} className="space-y-4">
              <div>
                <input 
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl py-4 px-5 text-[16px] focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400 shadow-sm"
                  required
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[16px] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  'Complete Sign In'
                )}
              </button>
            </form>
          </motion.div>
        );

      case 'landing':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Lock size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">
              Private Access Portal
            </h1>
            <p className="text-[16px] text-neutral-500 font-light mb-10 max-w-xs mx-auto">
              Secure entry for verified members.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  try {
                    setIsProcessing(true);
                    await signInWithGoogle();
                  } catch (err) {
                    setError('Access denied. Please check your email or contact support.');
                    setState('error');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="w-full bg-white text-neutral-900 border border-neutral-200 py-4 rounded-xl font-medium text-[16px] hover:bg-neutral-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              <button 
                onClick={() => setState('signin-email')}
                disabled={isProcessing}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[16px] hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
              >
                <Mail size={18} />
                Continue with Email
              </button>
            </div>
          </motion.div>
        );

      case 'signin-email':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">Private Access Portal</h2>
              <p className="text-neutral-500 font-light text-[16px]">Enter your email address to continue.</p>
            </div>
            
            <form onSubmit={handleEmailCheck} className="space-y-5">
              <div>
                <input 
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl py-4 px-5 text-[16px] focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400 shadow-sm"
                  required
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[16px] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
            
            <button 
              onClick={() => setState('landing')}
              className="w-full mt-6 text-neutral-400 font-medium text-[14px] hover:text-neutral-600 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        );

      case 'password-entry':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">
                {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-neutral-500 font-light text-[16px]">Accessing as <strong className="text-neutral-900 font-medium">{email}</strong></p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => { setAuthMode('signin'); setError(''); }}
                className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all ${authMode === 'signin' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Create Account
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div>
                <input 
                  type="password"
                  placeholder={authMode === 'signup' ? "Create a Password" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl py-4 px-5 text-[16px] focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400 shadow-sm"
                  required
                  autoFocus
                />
              </div>

              {authMode === 'signup' && (
                <div className="text-[14px] text-neutral-600 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100">
                  <strong className="flex items-center gap-1"><CheckCircle2 size={16} /> Welcome to the family!</strong>
                  Your email is approved for Premium Access. Create a password to secure your account.
                </div>
              )}

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[16px] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  authMode === 'signup' ? 'Create Account & Sign In' : 'Sign In'
                )}
              </button>
            </form>
            
            <div className="flex justify-between items-center mt-6 px-2">
              <button 
                onClick={() => { setState('signin-email'); setPassword(''); }}
                className="text-neutral-400 font-medium text-[14px] hover:text-neutral-600 transition-colors"
              >
                ← Back
              </button>

              {authMode === 'signin' && (
                <button 
                  onClick={handleForgotPassword}
                  className="text-neutral-500 font-medium text-[14px] hover:text-neutral-900 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </motion.div>
        );

      case 'check-email':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Mail size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">Check your email</h2>
            <p className="text-neutral-500 mb-10 font-light text-[16px]">
              Check your email for your secure access link. We sent it to <span className="font-medium text-neutral-900">{email}</span>.
            </p>
            
            <div className="pt-6 border-t border-neutral-100">
              {resendTimer > 0 ? (
                <p className="text-[14px] text-neutral-400">
                  Resend available in {resendTimer}s
                </p>
              ) : (
                <button 
                  onClick={() => setState('signin')}
                  className="text-[14px] text-neutral-900 font-medium hover:text-neutral-600 transition-colors"
                >
                  Didn't receive it? Try again
                </button>
              )}
            </div>
          </motion.div>
        );

      case 'welcome':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <Sparkles size={24} className="text-neutral-900" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-neutral-900 mb-3 tracking-tight">Your access is confirmed</h2>
            <p className="text-[15px] text-neutral-500 font-light mb-10">
              Welcome to your private portal.
            </p>
            
            <button 
              onClick={handleStart}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[15px] hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Continue to portal <ArrowRight size={18} />
            </button>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <CheckCircle2 size={24} className="text-neutral-900" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-neutral-900 mb-3 tracking-tight">Your access is confirmed</h2>
            <p className="text-[15px] text-neutral-500 font-light mb-10">
              Welcome back to your private portal.
            </p>
            
            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden mb-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-neutral-900"
              />
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-200 py-4 rounded-xl font-medium text-[15px] hover:bg-neutral-100 transition-all active:scale-[0.98]"
            >
              Continue to portal
            </button>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <AlertCircle size={24} className="text-neutral-900" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-neutral-900 mb-3 tracking-tight">Access Restricted</h2>
            <p className="text-neutral-500 mb-10 font-light text-[15px]">
              {error || "We couldn't verify this email address."}
            </p>
            <button 
              onClick={() => setState('signin')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[15px] hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              Try another email
            </button>
          </motion.div>
        );

      case 'expired-link':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <Clock size={24} className="text-neutral-900" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-neutral-900 mb-3 tracking-tight">Link Expired</h2>
            <p className="text-neutral-500 mb-10 font-light text-[15px]">
              For your security, access links expire after 15 minutes. Please request a new one.
            </p>
            <button 
              onClick={() => setState('signin')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[15px] hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              Request new link
            </button>
          </motion.div>
        );
        
      case 'logged-out':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <LogOut size={24} className="text-neutral-900" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-medium text-neutral-900 mb-3 tracking-tight">Securely Signed Out</h2>
            <p className="text-neutral-500 mb-10 font-light text-[15px]">
              Your session has ended.
            </p>
            <button 
              onClick={() => setState('signin')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[15px] hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              Sign back in
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-neutral-400 text-[13px]">
          <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-neutral-900 transition-colors">Support</a>
        </div>
      </div>
    </div>
  );
}
