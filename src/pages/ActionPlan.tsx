import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, ArrowRight, MessageSquareText, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { actionPlanData } from '../data/actionPlan';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ActionPlan() {
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'progress', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().actionPlanCompletion) {
          setCompletedBlocks(new Set(docSnap.data().actionPlanCompletion));
        } else {
          // Fallback to local storage
          const saved = localStorage.getItem('rescueKit_actionPlan');
          if (saved) {
            setCompletedBlocks(new Set(JSON.parse(saved)));
          }
        }
      } catch (error) {
        console.error("Error fetching action plan progress:", error);
        toast.error("Failed to load action plan progress");
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProgress();
  }, [user]);

  const toggleBlock = async (id: string) => {
    if (!user) return;
    const newCompleted = new Set(completedBlocks);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedBlocks(newCompleted);

    try {
      const docRef = doc(db, 'progress', user.uid);
      await setDoc(docRef, {
        userId: user.uid,
        actionPlanCompletion: Array.from(newCompleted),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Keep local storage in sync
      localStorage.setItem('rescueKit_actionPlan', JSON.stringify(Array.from(newCompleted)));
    } catch (error) {
      console.error("Error saving action plan progress:", error);
      toast.error("Failed to save action plan progress");
      // Revert optimistic update
      setCompletedBlocks(completedBlocks);
    }
  };

  if (!isLoaded) return null;

  const allCompleted = completedBlocks.size === actionPlanData.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-16 max-w-4xl mx-auto"
    >
      <header className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm border border-emerald-100">
          <Clock size={14} />
          <span>Fast Implementation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          60-Minute Action Plan
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-2xl leading-relaxed">
          Install the most important parts of your WhatsApp sales system in about one hour. Done is better than delayed.
        </p>
      </header>

      <div className="relative mt-12">
        {/* Vertical line connecting steps */}
        <div className="absolute left-[39px] top-12 bottom-12 w-1 bg-neutral-100 hidden md:block rounded-full"></div>

        <div className="space-y-8 md:space-y-12">
          {actionPlanData.map((block, index) => {
            const isCompleted = completedBlocks.has(block.id);
            
            return (
              <div key={block.id} className="relative flex flex-col md:flex-row gap-6 md:gap-10">
                {/* Step indicator */}
                <div className="shrink-0 flex items-center md:items-start pt-2">
                  <button 
                    onClick={() => toggleBlock(block.id)}
                    className={clsx(
                      "w-20 h-20 rounded-3xl flex items-center justify-center border-4 transition-all duration-300 z-10 bg-white shadow-sm hover:scale-105",
                      isCompleted 
                        ? "border-emerald-500 text-emerald-500 shadow-emerald-500/20" 
                        : "border-neutral-200 text-neutral-400 hover:border-emerald-300 hover:text-emerald-500"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 size={40} className="drop-shadow-sm" /> : <span className="font-bold text-2xl">{index + 1}</span>}
                  </button>
                  <h2 className="text-2xl font-bold text-neutral-900 ml-6 md:hidden">{block.title}</h2>
                </div>

                {/* Content Card */}
                <div className={clsx(
                  "flex-1 bg-white border rounded-3xl p-8 md:p-10 transition-all duration-500",
                  isCompleted ? "border-emerald-200 bg-emerald-50/20 shadow-sm" : "border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300"
                )}>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4 hidden md:block tracking-tight">{block.title}</h2>
                  <p className="text-[15px] text-neutral-500 mb-8 leading-relaxed font-light">{block.description}</p>
                  
                  <ul className="space-y-5">
                    {block.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-4 group">
                        <div className={clsx(
                          "mt-2 w-2 h-2 rounded-full shrink-0 transition-colors",
                          isCompleted ? "bg-emerald-400" : "bg-neutral-300 group-hover:bg-neutral-400"
                        )}></div>
                        <span className={clsx(
                          "text-[15px] leading-relaxed transition-all duration-300",
                          isCompleted ? "text-neutral-400 line-through" : "text-neutral-800 font-medium"
                        )}>{task}</span>
                      </li>
                    ))}
                  </ul>

                  {block.id === 'block-2' && !isCompleted && (
                    <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <MessageSquareText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-[15px]">Need Quick Replies?</h4>
                          <p className="text-[13px] text-neutral-600">Find the best ones in the Script Bank.</p>
                        </div>
                      </div>
                      <Link to="/scripts?filter=Top 15" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-sm transition-colors">
                        Open Scripts
                      </Link>
                    </div>
                  )}

                  {block.id === 'block-4' && !isCompleted && (
                    <div className="mt-8 bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                          <ListTodo size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-[15px]">Ready to track?</h4>
                          <p className="text-[13px] text-neutral-600">Add your active leads to the Tracker.</p>
                        </div>
                      </div>
                      <Link to="/tracker" className="text-[13px] font-bold text-orange-600 hover:text-orange-700 bg-white px-4 py-2 rounded-xl border border-orange-200 shadow-sm transition-colors">
                        Open Tracker
                      </Link>
                    </div>
                  )}

                  <div className="mt-10 pt-6 border-t border-neutral-100 flex justify-end">
                    <button
                      onClick={() => toggleBlock(block.id)}
                      className={clsx(
                        "px-6 py-3.5 rounded-2xl font-bold text-[13px] transition-all duration-300 flex items-center gap-2",
                        isCompleted 
                          ? "bg-neutral-100 text-neutral-500 hover:bg-neutral-200" 
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-sm hover:-translate-y-0.5"
                      )}
                    >
                      {isCompleted ? "Mark as Incomplete" : "Mark Block as Done"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {allCompleted && (
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-neutral-900 text-white rounded-[2rem] p-10 md:p-16 text-center shadow-2xl mt-16 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">You've installed the system!</h2>
            <p className="text-[17px] text-neutral-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              You do not need to be perfect before using this. The goal is to improve your conversations right away.
            </p>
            <Link 
              to="/tracker" 
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-[14px] transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1"
            >
              Open Your Tracker <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
