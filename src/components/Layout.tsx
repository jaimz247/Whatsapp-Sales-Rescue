import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquareText, 
  CheckSquare, 
  Clock, 
  ListTodo, 
  Gift, 
  Menu, 
  X,
  HelpCircle,
  UserCircle,
  LogOut,
  Activity,
  Target,
  MessageCircle,
  Filter,
  CreditCard,
  ShieldCheck,
  Thermometer,
  Smartphone,
  Mic,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    title: "Start Here",
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, mobile: true },
      { name: 'Sales Leak Audit', path: '/audit', icon: Activity, mobile: false },
      { name: '7-Day Sprint', path: '/sprint', icon: Target, mobile: false },
    ]
  },
  {
    title: "Core Systems",
    items: [
      { name: 'Setup Checklist', path: '/checklist', icon: CheckSquare, mobile: false },
      { name: 'Script Bank', path: '/scripts', icon: MessageSquareText, mobile: true },
      { name: 'Lead Tracker', path: '/tracker', icon: ListTodo, mobile: true },
    ]
  },
  {
    title: "Strategy Modules",
    items: [
      { name: 'Chat Examples', path: '/chat-examples', icon: MessageCircle, mobile: false },
      { name: 'Qualification Flow', path: '/qualification', icon: Filter, mobile: false },
      { name: 'Payment Protocol', path: '/payment-protocol', icon: CreditCard, mobile: false },
      { name: 'Trust & Proof', path: '/trust', icon: ShieldCheck, mobile: false },
      { name: 'Lead Temperature', path: '/lead-temperature', icon: Thermometer, mobile: false },
      { name: 'Status Selling', path: '/status-selling', icon: Smartphone, mobile: false },
      { name: 'Voice Notes', path: '/voice-notes', icon: Mic, mobile: false },
    ]
  },
  {
    title: "Resources",
    items: [
      { name: 'Quick Replies', path: '/quick-replies', icon: Zap, mobile: false },
      { name: 'Bonuses', path: '/bonuses', icon: Gift, mobile: false },
      { name: 'Business Profile', path: '/profile', icon: UserCircle, mobile: true },
      { name: 'Help / Read Me', path: '/help', icon: HelpCircle, mobile: true },
    ]
  }
];

// Flatten for mobile bottom nav
const allNavItems = navGroups.flatMap(group => group.items);

export default function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedScriptsCount, setSavedScriptsCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/access', { state: { loggedOut: true } });
  };

  useEffect(() => {
    if (location.pathname !== '/') {
      localStorage.setItem('rescueKit_lastVisited', location.pathname);
      if (user) {
        const docRef = doc(db, 'progress', user.uid);
        setDoc(docRef, {
          userId: user.uid,
          lastVisitedSection: location.pathname,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => console.error("Error saving lastVisitedSection:", err));
      }
    }
  }, [location.pathname, user]);

  useEffect(() => {
    const updateSavedCount = () => {
      const saved = localStorage.getItem('rescueKit_savedScripts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedScriptsCount(parsed.length);
        } catch (e) {
          // ignore
        }
      }
    };

    updateSavedCount();
    window.addEventListener('storage', updateSavedCount);
    // Custom event to trigger update from within the same window
    window.addEventListener('rescueKit_savedScripts_updated', updateSavedCount);

    return () => {
      window.removeEventListener('storage', updateSavedCount);
      window.removeEventListener('rescueKit_savedScripts_updated', updateSavedCount);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans text-neutral-900 pb-20 md:pb-0">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 p-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
            W
          </div>
          <span className="font-bold text-neutral-900 tracking-tight text-base">Sales Rescue Kit</span>
        </div>
        <div className="flex items-center gap-1">
          <NavLink 
            to="/help"
            className={cn(
              "p-2.5 rounded-xl transition-colors",
              location.pathname === '/help' ? "text-emerald-600 bg-emerald-50" : "text-neutral-400"
            )}
          >
            <HelpCircle size={22} />
          </NavLink>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation - One-handed thumb access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-neutral-200/60 px-2 py-2 z-50 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {allNavItems.filter(i => i.path === '/' || i.path === '/scripts' || i.path === '/tracker' || i.path === '/checklist').map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const shortName = item.name === 'Setup Checklist' ? 'Setup' : item.name === 'Script Bank' ? 'Scripts' : item.name;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[72px]",
                isActive ? "text-emerald-600" : "text-neutral-400"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive ? "bg-emerald-50 scale-110" : ""
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{shortName}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[72px]",
            isMobileMenuOpen ? "text-emerald-600" : "text-neutral-400"
          )}
        >
          <div className={cn(
            "p-1 rounded-xl transition-all",
            isMobileMenuOpen ? "bg-emerald-50 scale-110" : ""
          )}>
            <Menu size={22} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 right-0 z-[70] w-[85%] bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-lg">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-neutral-100 text-neutral-600 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="flex flex-col gap-6">
                  {navGroups.map((group, groupIdx) => (
                    <div key={groupIdx}>
                      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-5">{group.title}</h3>
                      <div className="flex flex-col gap-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-200 font-bold text-[15px]",
                                isActive 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : "text-neutral-600 hover:bg-neutral-50"
                              )}
                            >
                              <Icon size={18} className={isActive ? "text-emerald-600" : "text-neutral-400"} />
                              <span className="flex-1">{item.name}</span>
                              {item.path === '/scripts' && savedScriptsCount > 0 && (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  {savedScriptsCount}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {user?.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mb-1">Active Buyer</p>
                    <p className="text-sm font-bold text-neutral-900 truncate">{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-5 py-4 bg-white border border-neutral-200 rounded-2xl text-red-600 font-bold text-sm shadow-sm active:bg-red-50 transition-all"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-neutral-200 sticky top-0 h-screen overflow-y-auto shrink-0 custom-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
              W
            </div>
            <div>
              <h1 className="font-bold text-neutral-900 leading-tight text-[16px] tracking-tight">Sales Rescue Kit</h1>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Profit-Lock™ Method</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-8">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-4">{group.title}</h3>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-[13px]",
                          isActive 
                            ? "bg-neutral-900 text-white shadow-md" 
                            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                        )}
                      >
                        <Icon size={16} className={isActive ? "text-emerald-400" : "text-neutral-400"} />
                        <span className="flex-1">{item.name}</span>
                        {item.path === '/scripts' && savedScriptsCount > 0 && (
                          <span className={cn(
                            "inline-flex items-center justify-center text-[10px] px-2 py-0.5 rounded-full font-bold",
                            isActive ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
                          )}>
                            {savedScriptsCount}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 space-y-4">
          <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mb-0.5">Buyer Access</p>
                <p className="text-[12px] font-bold text-neutral-900 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:text-red-700 font-bold text-xs transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-2">Need help?</p>
            <p className="text-[13px] text-neutral-600 font-medium leading-relaxed">Check the <NavLink to="/help" className="text-emerald-600 hover:text-emerald-700 font-bold">Read Me First</NavLink> guide.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-scroll-container" className="flex-1 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
