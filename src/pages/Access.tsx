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

type AccessState = 'landing' | 'signin' | 'check-email' | 'welcome' | 'success' | 'error' | 'expired-link' | 'logged-out' | 'verifying';

export default function Access() {
  const [state, setState] = useState<AccessState>('landing');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { signIn, user, confirmAccess, signOut, completeSignIn } = useAuth();
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
        } catch (err) {
          console.error("Magic link error:", err);
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid buyer email address.');
      setState('error');
      return;
    }

    setIsProcessing(true);
    
    try {
      await signIn(email);
      setState('check-email');
      setResendTimer(60);
    } catch (err) {
      console.error("Sign in error:", err);
      setError('Access denied. Please check your email or contact support.');
      setState('error');
    } finally {
      setIsProcessing(false);
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
            <button 
              onClick={() => setState('signin')}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium text-[16px] hover:bg-neutral-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            >
              Access your dashboard
            </button>
          </motion.div>
        );

      case 'signin':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-neutral-900 mb-3 tracking-tight">Private Access Portal</h2>
              <p className="text-neutral-500 font-light text-[16px]">Enter your email to receive a secure access link.</p>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-5">
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
                    Sending...
                  </>
                ) : (
                  'Send access link'
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
