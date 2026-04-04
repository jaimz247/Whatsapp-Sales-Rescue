import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareText, BookOpen, ListTodo, CheckCircle2, PlayCircle, Sparkles, ChevronRight, Clock, Star, AlertCircle, PlusCircle, X, UserCircle, Zap, Target, Activity, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { isToday, isBefore, startOfToday } from 'date-fns';
import { scripts } from '../data/scripts';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

export default function Dashboard() {
  const [completedChecklistItems, setCompletedChecklistItems] = useState(0);
  const [lastVisited, setLastVisited] = useState<string | null>(null);
  const [followUpsDue, setFollowUpsDue] = useState(0);
  const [recentScripts, setRecentScripts] = useState<any[]>([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [auditTaken, setAuditTaken] = useState(false);
  const [savedScriptsCount, setSavedScriptsCount] = useState(0);
  const [stats, setStats] = useState({ potential: 0, closed: 0, totalLeads: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Check profile
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          const p = profileDoc.data();
          if (p.businessProfile?.businessName && p.businessProfile?.productName) {
            setProfileComplete(true);
          }
        }

        // Check audit
        const auditDoc = await getDoc(doc(db, 'audit_results', user.uid));
        if (auditDoc.exists()) {
          setAuditTaken(true);
        }

        // Check saved scripts
        const savedScriptsQuery = query(collection(db, 'saved_scripts'), where('userId', '==', user.uid));
        const savedScriptsSnap = await getDocs(savedScriptsQuery);
        let count = savedScriptsSnap.size;
        setSavedScriptsCount(count);

        // Load checklist progress
        const progressDoc = await getDoc(doc(db, 'progress', user.uid));
        if (progressDoc.exists()) {
          const data = progressDoc.data();
          if (data.checklistCompletion) {
            setCompletedChecklistItems(data.checklistCompletion.length);
          }
          if (data.lastVisitedSection && data.lastVisitedSection !== '/') {
            setLastVisited(data.lastVisitedSection);
          }
        }

        // Load tracker data
        const trackerQuery = query(collection(db, 'tracker_items'), where('userId', '==', user.uid));
        const trackerSnap = await getDocs(trackerQuery);
        let dueCount = 0;
        let potential = 0;
        let closed = 0;
        let totalLeads = 0;
        const today = startOfToday();

        trackerSnap.forEach(doc => {
          const data = doc.data();
          totalLeads++;
          
          if (data.followUpDate && data.stage !== 'Paid' && data.stage !== 'Delivered') {
            const followUpDate = new Date(data.followUpDate);
            if (isToday(followUpDate) || isBefore(followUpDate, today)) {
              dueCount++;
            }
          }

          if (data.stage !== 'Paid' && data.stage !== 'Delivered') {
            potential += (Number(data.value) || 0);
          } else if (data.stage === 'Paid' || data.stage === 'Delivered') {
            closed += (Number(data.value) || 0);
          }
        });
        
        setFollowUpsDue(dueCount);
        setStats({ potential, closed, totalLeads });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();

    // Load last visited page (fallback)
    const lastPage = localStorage.getItem('rescueKit_lastVisited');
    if (lastPage && lastPage !== '/') {
      setLastVisited(prev => prev || lastPage);
    }

    // Load recent scripts (still local)
    const storedRecent = localStorage.getItem('rescueKit_recentScripts');
    if (storedRecent) {
      try {
        const recentIds = JSON.parse(storedRecent);
        const recent = recentIds.map((id: string) => scripts.find(s => s.id === id)).filter(Boolean).slice(0, 3);
        setRecentScripts(recent);
      } catch (e) {
        console.error('Failed to parse recent scripts');
      }
    }
  }, [user]);

  const totalChecklistItems = 25; // Hardcoded for now based on data
  const progress = Math.round((completedChecklistItems / totalChecklistItems) * 100) || 0;

  const getNextStep = () => {
    if (!profileComplete) {
      return {
        title: "Complete Your Profile",
        desc: "Add your business details to unlock script personalization.",
        link: "/profile",
        cta: "Setup Profile",
        icon: <UserCircle className="text-emerald-600" size={24} />
      };
    }
    if (!auditTaken) {
      return {
        title: "Take Your Sales Leak Audit",
        desc: "Find out exactly where you are losing money in your WhatsApp chats.",
        link: "/audit",
        cta: "Start Audit",
        icon: <Activity className="text-indigo-600" size={24} />
      };
    }
    if (progress < 20) {
      return {
        title: "Start Your Setup",
        desc: "Optimize your WhatsApp profile for professional selling.",
        link: "/checklist",
        cta: "Start Checklist",
        icon: <ListTodo className="text-emerald-600" size={24} />
      };
    }
    if (savedScriptsCount < 5) {
      return {
        title: "Save Your First 5 Scripts",
        desc: "Pick the 5 scripts you need most and save them to your Quick Replies.",
        link: "/scripts",
        cta: "Go to Script Bank",
        icon: <MessageSquareText className="text-blue-600" size={24} />
      };
    }
    return {
      title: "Continue 7-Day Sprint",
      desc: "Keep up the momentum and finish your rescue implementation.",
      link: "/sprint",
      cta: "View Sprint",
      icon: <Target className="text-amber-500" size={24} />
    };
  };

  const nextStep = getNextStep();

  const tips = [
    "Always ask for the customer's name early to build rapport.",
    "Use voice notes for complex explanations; it builds trust.",
    "The 'Price Defense' script is your best friend for high-ticket items.",
    "Follow up with 'Awaiting Payment' leads every 24 hours.",
    "Update your WhatsApp Status with customer testimonials daily."
  ];
  const [currentTip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  const getPageName = (path: string) => {
    switch (path) {
      case '/guide': return 'Main Guide';
      case '/scripts': return 'Script Bank';
      case '/checklist': return 'Setup Checklist';
      case '/sprint': return '7-Day Sprint';
      case '/tracker': return 'Lead Tracker';
      case '/audit': return 'Sales Leak Audit';
      case '/bonuses': return 'Bonuses';
      case '/help': return 'Help / Read Me';
      default: return 'Previous Page';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-6xl mx-auto"
    >
      {/* Premium Hero Section */}
      <div className="bg-neutral-900 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden border border-neutral-800">
        <div className="relative z-10 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-6 md:mb-8 text-emerald-300 backdrop-blur-md shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Profit-Lock™ System
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-[1.1]">
            Welcome to your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Sales Hub.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-8 md:mb-10 font-light leading-relaxed max-w-2xl">
            Everything you need to stop buyer ghosting, protect your prices, and turn more WhatsApp chats into paid orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Link 
              to="/sprint" 
              className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-[15px] transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95"
            >
              <PlayCircle size={20} />
              Start 7-Day Sprint
            </Link>
            <Link 
              to="/audit" 
              className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-[15px] transition-all active:scale-95 backdrop-blur-sm"
            >
              <Activity size={20} />
              Take Sales Audit
            </Link>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-500/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Quick Tip Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] p-5 sm:p-6 md:p-8 text-white shadow-lg shadow-emerald-500/20 flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
          <Sparkles size={24} className="text-emerald-100" />
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-100 mb-1 md:mb-2">Pro Tip of the Day</p>
          <p className="text-base md:text-xl font-medium leading-relaxed">
            "{currentTip}"
          </p>
        </div>
        <div className="shrink-0 relative z-10 w-full md:w-auto">
          <Link 
            to="/guide" 
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 w-full md:w-auto"
          >
            Read Strategy <ChevronRight size={16} />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Next Recommended Step & Stats (Left Column) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Sales Pulse Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Potential</p>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">₦{stats.potential.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 shadow-sm">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Closed</p>
              <p className="text-2xl font-bold text-emerald-700 tracking-tight">₦{stats.closed.toLocaleString()}</p>
            </div>
          </div>

          {/* Today's Focus */}
          {followUpsDue > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-orange-500" size={20} />
                <h2 className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">Today's Focus</h2>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">{followUpsDue} Follow-up{followUpsDue !== 1 ? 's' : ''} Due</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed text-[15px] font-light">You have leads waiting for a response. Don't let them go cold.</p>
              <Link 
                to="/tracker"
                className="inline-flex items-center justify-between w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-[14px] transition-all shadow-md shadow-orange-500/20"
              >
                Go to Tracker <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}

          {/* Continue Where You Left Off */}
          {lastVisited && (
            <Link 
              to={lastVisited}
              className="bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex items-center justify-between"
            >
              <div>
                <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Resume</h2>
                <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight">{getPageName(lastVisited)}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors shadow-sm">
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          )}

          <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group flex flex-col hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            <div className="flex items-center gap-3 mb-5">
              <Sparkles className="text-emerald-500" size={20} />
              <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Next Recommended Step</h2>
            </div>
            
            <h3 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">{nextStep.title}</h3>
            <p className="text-[15px] text-neutral-500 mb-8 leading-relaxed flex-1 font-light">{nextStep.desc}</p>
            
            <Link 
              to={nextStep.link}
              className="inline-flex items-center justify-between w-full bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-4 rounded-2xl font-bold text-[14px] transition-all shadow-sm hover:shadow-md"
            >
              {nextStep.cta} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Progress Card */}
          <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[14px] font-bold text-neutral-900">Setup Progress</h3>
              <span className="text-xl font-bold text-emerald-600 tracking-tight">{progress}%</span>
            </div>
            
            <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden mb-5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </motion.div>
            </div>
            <p className="text-[12px] text-neutral-500 font-medium">{completedChecklistItems} of {totalChecklistItems} tasks completed</p>
          </div>
        </div>

        {/* Quick Access Cards & Recent Scripts (Right Column) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/scripts" className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm hover:shadow-md hover:shadow-blue-500/5 hover:border-blue-200 hover:-translate-y-0.5 transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <MessageSquareText size={24} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Script Bank</h3>
              <p className="text-[14px] text-neutral-500 leading-relaxed flex-1 font-light">Access 85+ ready-to-use replies for every situation. Copy, paste, and close.</p>
              <div className="mt-6 flex items-center text-[13px] font-bold text-blue-600 bg-blue-50/50 p-3 rounded-xl group-hover:bg-blue-50 transition-colors">
                Open Scripts <ChevronRight size={16} className="ml-auto transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            
            <Link to="/tracker" className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm hover:shadow-md hover:shadow-orange-500/5 hover:border-orange-200 hover:-translate-y-0.5 transition-all group flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                <ListTodo size={24} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Lead Tracker</h3>
              <p className="text-[14px] text-neutral-500 leading-relaxed flex-1 font-light">Manage your hot leads and follow-ups in one place. Never forget a prospect.</p>
              <div className="mt-6 flex items-center text-[13px] font-bold text-orange-600 bg-orange-50/50 p-3 rounded-xl group-hover:bg-orange-50 transition-colors">
                Open Tracker <ChevronRight size={16} className="ml-auto transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          {/* Recently Copied Scripts */}
          {recentScripts.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Clock className="text-emerald-500" size={20} />
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Recently Copied Scripts</h3>
                </div>
                <Link to="/scripts?filter=Recent" className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-2.5">
                {recentScripts.map((script, index) => (
                  <Link 
                    key={index}
                    to={`/scripts?search=${encodeURIComponent(script.title)}`}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="pr-4">
                      <h4 className="font-bold text-neutral-900 text-[14px] mb-0.5 tracking-tight">{script.title}</h4>
                      <p className="text-[12px] text-neutral-500 line-clamp-1">{script.scenario}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors shrink-0">
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* What's Next / Upgrades (Soft Upsell Staging) */}
          <div className="bg-neutral-900 rounded-3xl p-8 shadow-sm text-white relative overflow-hidden mt-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest mb-4 border border-white/10">
                <Star size={14} className="text-amber-400" /> Next Level
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Scale Your WhatsApp Revenue</h3>
              <p className="text-neutral-400 text-[15px] leading-relaxed mb-6 font-light max-w-md">
                You've plugged the leaks. Now it's time to pour more high-quality leads into your optimized sales machine.
              </p>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div>
                    <h4 className="font-bold text-white text-[15px] mb-1">The Traffic Injection Playbook</h4>
                    <p className="text-neutral-400 text-[13px]">Get 100+ new targeted leads into your DMs this week.</p>
                  </div>
                  <ArrowUpRight size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
                </a>
                <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div>
                    <h4 className="font-bold text-white text-[15px] mb-1">Done-For-You Script Customization</h4>
                    <p className="text-neutral-400 text-[13px]">We write your exact scripts for your specific niche.</p>
                  </div>
                  <ArrowUpRight size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
                </a>
                <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div>
                    <h4 className="font-bold text-white text-[15px] mb-1">VIP 1-on-1 Chat Audit</h4>
                    <p className="text-neutral-400 text-[13px]">I'll personally review your chats and tell you why they aren't buying.</p>
                  </div>
                  <ArrowUpRight size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Link 
        to="/tracker"
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <PlusCircle size={28} />
      </Link>
    </motion.div>
  );
}
