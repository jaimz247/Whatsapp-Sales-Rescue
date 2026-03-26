import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { checklistData } from '../data/checklist';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SetupChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'progress', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().checklistCompletion) {
          setCheckedItems(new Set(docSnap.data().checklistCompletion));
        } else {
          // Fallback to local storage if no firestore data
          const saved = localStorage.getItem('rescueKit_checklist');
          if (saved) {
            setCheckedItems(new Set(JSON.parse(saved)));
          }
        }
      } catch (error) {
        console.error("Error fetching checklist progress:", error);
        toast.error("Failed to load checklist progress");
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProgress();
  }, [user]);

  const toggleItem = async (id: string, groupId: string) => {
    if (!user) return;
    const newChecked = new Set(checkedItems);
    const wasChecked = newChecked.has(id);
    
    if (wasChecked) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
      
      // Check if this action completes a group
      const group = checklistData.find(g => g.id === groupId);
      if (group) {
        const otherItemsInGroup = group.items.filter(item => item.id !== id);
        const allOthersChecked = otherItemsInGroup.every(item => newChecked.has(item.id));
        
        if (allOthersChecked) {
          // Group completed!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#059669']
          });
        }
      }
    }
    setCheckedItems(newChecked);
    
    // Save to Firestore
    try {
      const docRef = doc(db, 'progress', user.uid);
      await setDoc(docRef, {
        userId: user.uid,
        checklistCompletion: Array.from(newChecked),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Also save to local storage for quick access elsewhere
      localStorage.setItem('rescueKit_checklist', JSON.stringify(Array.from(newChecked)));
      localStorage.setItem('rescueKit_checklist_count', newChecked.size.toString());
    } catch (error) {
      console.error("Error saving checklist progress:", error);
      toast.error("Failed to save checklist progress");
      // Revert optimistic update
      setCheckedItems(checkedItems);
    }
  };

  const totalItems = checklistData.reduce((acc, group) => acc + group.items.length, 0);
  const progress = Math.round((checkedItems.size / totalItems) * 100) || 0;

  if (!isLoaded) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-16 max-w-4xl mx-auto"
    >
      <header className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          Setup Checklist
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-2xl leading-relaxed">
          Turn your WhatsApp Business account into a cleaner, more professional sales environment.
        </p>
      </header>

      {/* Sticky Progress Pill */}
      <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-xl border border-neutral-200/50 rounded-full p-4 shadow-lg shadow-neutral-200/20 flex items-center justify-between gap-6 max-w-2xl mx-auto">
        <div className="flex-1 px-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-neutral-900 text-[10px] tracking-widest uppercase">Overall Progress</h3>
            <span className="text-[13px] font-bold text-emerald-600">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="hidden sm:block shrink-0 pr-4">
          <p className="text-[12px] font-medium text-neutral-500">{checkedItems.size} of {totalItems} tasks</p>
        </div>
      </div>

      <div className="space-y-10">
        {checklistData.map((group, index) => {
          const completedInGroup = group.items.filter(item => checkedItems.has(item.id)).length;
          const groupCompleted = completedInGroup === group.items.length;
          
          return (
            <div key={group.id} className="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={clsx(
                "p-6 sm:p-8 md:p-10 border-b transition-colors",
                groupCompleted ? "bg-emerald-50/30 border-emerald-100" : "border-neutral-100"
              )}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={clsx(
                    "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-bold text-base md:text-lg shadow-sm transition-all duration-500",
                    groupCompleted ? "bg-emerald-500 text-white rotate-[360deg]" : "bg-neutral-900 text-white"
                  )}>
                    {groupCompleted ? <CheckCircle2 size={20} className="md:w-6 md:h-6" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">{group.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                          groupCompleted ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                        )}>
                          {completedInGroup}/{group.items.length}
                        </span>
                        {groupCompleted && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[13px] md:text-[14px] text-neutral-500 leading-relaxed md:ml-16 font-light">{group.description}</p>
              </div>
              
              <div className="divide-y divide-neutral-100">
                {group.items.map((item) => {
                  const isChecked = checkedItems.has(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleItem(item.id, group.id)}
                      className={clsx(
                        "p-5 sm:p-6 md:p-8 md:pl-16 flex gap-4 sm:gap-6 cursor-pointer transition-all group active:bg-neutral-100",
                        isChecked ? "bg-neutral-50/80" : "hover:bg-neutral-50"
                      )}
                    >
                      <button className="shrink-0 mt-0.5 focus:outline-none">
                        {isChecked ? (
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="text-emerald-500 drop-shadow-sm" size={28} />
                          </motion.div>
                        ) : (
                          <Circle className="text-neutral-300 group-hover:text-emerald-400 transition-colors" size={28} />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={clsx(
                          "font-bold text-[14px] transition-all duration-300 leading-snug",
                          isChecked ? "text-neutral-400 line-through" : "text-neutral-900 group-hover:text-emerald-800"
                        )}>
                          {item.text}
                        </h4>
                        {item.description && (
                          <p className={clsx(
                            "text-[12px] md:text-[13px] mt-1 sm:mt-2 leading-relaxed transition-colors duration-300 font-light",
                            isChecked ? "text-neutral-400/70" : "text-neutral-500"
                          )}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {progress === 100 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-emerald-600 text-white rounded-[2rem] p-10 md:p-16 text-center shadow-xl shadow-emerald-500/20"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Installation Complete!</h2>
          <p className="text-[17px] text-emerald-100 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            You are no longer working from a random chat process. You now have a more intentional, professional WhatsApp sales system.
          </p>
          <Link 
            to="/tracker"
            className="inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-2xl font-bold text-[14px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Start Tracking Leads <ArrowRight size={20} />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
