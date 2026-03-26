import { Calendar, CheckCircle2, ArrowRight, Trophy, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const sprintDays = [
  {
    day: 1,
    title: "Profile & Labels",
    focus: "Set up the foundation for trust and organization.",
    tasks: [
      "Update WhatsApp Business profile picture and description.",
      "Add operating hours and website link.",
      "Create labels: New Inquiry, Follow Up, Pending Payment, VIP."
    ]
  },
  {
    day: 2,
    title: "Quick Replies Install",
    focus: "Save hours of typing and ensure consistent messaging.",
    tasks: [
      "Complete the Quick Replies Install Worksheet.",
      "Add your top 5 scripts to WhatsApp Business.",
      "Test them in a chat with yourself."
    ]
  },
  {
    day: 3,
    title: "Catalog & Offer Presentation",
    focus: "Make it easy for buyers to see what you sell.",
    tasks: [
      "Add your top 3 best-selling items to the WhatsApp Catalog.",
      "Write clear, benefit-driven descriptions for each.",
      "Ensure pricing is transparent (if applicable)."
    ]
  },
  {
    day: 4,
    title: "Tracking Leads",
    focus: "Stop letting potential sales slip through the cracks.",
    tasks: [
      "Set up your Daily 10-Minute Close-Out Routine.",
      "Log all current active conversations in the Tracker.",
      "Assign appropriate labels to all active chats."
    ]
  },
  {
    day: 5,
    title: "Pricing & Qualification Flow",
    focus: "Stop answering 'How much?' with just a number.",
    tasks: [
      "Review the Qualification Flow module.",
      "Write out your 2-3 question qualification sequence.",
      "Practice pivoting from price to value."
    ]
  },
  {
    day: 6,
    title: "Old Lead Follow-Up",
    focus: "Reactivate ghosted buyers and recover lost revenue.",
    tasks: [
      "Identify 10 leads who ghosted you in the last month.",
      "Send the 'Calm Follow-Up' script from the Script Bank.",
      "Log the results in your Tracker."
    ]
  },
  {
    day: 7,
    title: "Reviews, Referrals & Repeat Sales",
    focus: "Turn one-time buyers into loyal advocates.",
    tasks: [
      "Send a post-purchase check-in to 5 recent buyers.",
      "Ask for a review or testimonial.",
      "Offer a small incentive for their next purchase."
    ]
  }
];

export default function RescueSprint() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'progress', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Convert string IDs back to numbers for the UI
          const days = (data.rescueSprintCompletion?.completedSteps || []).map((s: string) => parseInt(s, 10));
          setCompletedDays(days);
        }
      } catch (error) {
        console.error("Error fetching sprint progress:", error);
        toast.error("Failed to load sprint progress");
      }
    };
    fetchProgress();
  }, [user]);

  const toggleDay = async (day: number) => {
    if (!user) return;
    
    let newCompletedDays: number[];
    if (completedDays.includes(day)) {
      newCompletedDays = completedDays.filter(d => d !== day);
    } else {
      newCompletedDays = [...completedDays, day];
    }
    
    setCompletedDays(newCompletedDays);

    try {
      const docRef = doc(db, 'progress', user.uid);
      await setDoc(docRef, {
        userId: user.uid,
        rescueSprintCompletion: {
          completedSteps: newCompletedDays.map(String)
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving sprint progress:", error);
      toast.error("Failed to save sprint progress");
      // Revert optimistic update on error
      setCompletedDays(completedDays);
    }
  };

  const progress = Math.round((completedDays.length / sprintDays.length) * 100);
  const isFullyComplete = progress === 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-emerald-100 shadow-sm">
          <Calendar size={14} /> Action & Tracking
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          7-Day Rescue Sprint
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          Don't try to fix everything at once. Follow this guided 7-day plan to install the Profit-Lock™ Method step-by-step and start recovering lost sales immediately.
        </p>
      </header>

      {/* Progress Bar */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-neutral-200 mb-12 relative overflow-hidden">
        {isFullyComplete && (
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
              {isFullyComplete ? <Trophy className="text-emerald-500" /> : <Target className="text-neutral-400" />}
              Sprint Progress
            </h2>
            <p className="text-[15px] text-neutral-500 mt-1">
              {isFullyComplete ? "Incredible work! You've installed the core system." : "Complete one day at a time to build momentum."}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black tracking-tighter ${isFullyComplete ? 'text-emerald-500' : 'text-neutral-900'}`}>
              {progress}%
            </span>
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Complete</span>
          </div>
        </div>
        
        <div className="w-full bg-neutral-100 h-4 rounded-full overflow-hidden relative z-10 shadow-inner">
          <motion.div 
            className="h-full bg-emerald-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
          </motion.div>
        </div>
      </div>

      {/* Sprint Days */}
      <div className="space-y-6 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute left-[3.5rem] top-12 bottom-12 w-0.5 bg-neutral-200 z-0"></div>

        {sprintDays.map((sprint, index) => {
          const isCompleted = completedDays.includes(sprint.day);
          const isNext = !isCompleted && (index === 0 || completedDays.includes(sprintDays[index - 1].day));
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`relative z-10 bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border transition-all duration-300 ${
                isCompleted 
                  ? 'border-emerald-200 bg-emerald-50/30 shadow-emerald-500/5' 
                  : isNext
                    ? 'border-indigo-200 shadow-md ring-1 ring-indigo-500/10'
                    : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:items-start">
                <div className="shrink-0 flex justify-center">
                  <button 
                    onClick={() => toggleDay(sprint.day)}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                        : isNext
                          ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-100 hover:scale-105'
                          : 'bg-neutral-50 text-neutral-400 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={32} /> : <span className="text-2xl font-black">{sprint.day}</span>}
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700' : isNext ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      Day {sprint.day}
                    </span>
                    {isNext && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                        <Zap size={12} /> Up Next
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold tracking-tight mb-2 ${isCompleted ? 'text-emerald-900' : 'text-neutral-900'}`}>
                    {sprint.title}
                  </h3>
                  
                  <p className={`text-[15px] mb-6 leading-relaxed ${isCompleted ? 'text-emerald-700/80' : 'text-neutral-500'}`}>
                    {sprint.focus}
                  </p>
                  
                  <div className={`rounded-2xl p-6 border transition-colors ${
                    isCompleted ? 'bg-white/50 border-emerald-100' : 'bg-neutral-50 border-neutral-100'
                  }`}>
                    <h4 className="text-[11px] font-bold text-neutral-400 mb-4 uppercase tracking-widest">Action Items</h4>
                    <ul className="space-y-4">
                      {sprint.tasks.map((task, tIndex) => (
                        <li key={tIndex} className="flex items-start gap-3">
                          <ArrowRight size={18} className={`mt-0.5 shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-neutral-300'}`} />
                          <span className={`text-[15px] leading-relaxed transition-all ${
                            isCompleted ? 'text-emerald-800 line-through opacity-60' : 'text-neutral-700'
                          }`}>
                            {task}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
