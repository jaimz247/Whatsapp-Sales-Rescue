import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MessageSquareText, ListTodo, ShieldCheck, ChevronRight, X } from 'lucide-react';

const steps = [
  {
    title: "Welcome to Sales Rescue Kit",
    description: "Your complete system for recovering lost sales and closing more deals. Let's take a quick tour of your new tools.",
    icon: LayoutDashboard,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    title: "The Script Bank",
    description: "Access proven, copy-paste scripts for every sales scenario. Save your favorites for quick access during live chats.",
    icon: MessageSquareText,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    title: "Lead Tracker",
    description: "Never let a lead slip through the cracks. Track conversations, set follow-up reminders, and monitor your pipeline.",
    icon: ListTodo,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    title: "Strategy Modules",
    description: "Dive deep into advanced sales psychology, qualification frameworks, and objection handling techniques.",
    icon: ShieldCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  }
];

export default function OnboardingTour() {
  const { user, confirmAccess } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    if (user?.isFirstTime) {
      setIsVisible(true);
    }
  }, [user?.isFirstTime]);

  if (!isVisible) return null;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsVisible(false);
    await confirmAccess();
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          onClick={handleComplete}
        />
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
        >
          <button 
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={20} />
          </button>

          <div className="p-8 sm:p-10 text-center">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 ${steps[currentStep].bgColor}`}>
              <StepIcon size={40} className={steps[currentStep].color} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
              {steps[currentStep].title}
            </h2>
            
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10">
              {steps[currentStep].description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep 
                        ? 'w-6 bg-emerald-600' 
                        : 'w-2 bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all active:scale-95"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
