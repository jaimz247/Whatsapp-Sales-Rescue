import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const questions = [
  {
    id: 'speed',
    question: 'How quickly do you typically respond to new WhatsApp inquiries?',
    options: [
      { text: 'Within 5 minutes', score: 3 },
      { text: 'Within 1 hour', score: 2 },
      { text: 'Within 24 hours', score: 1 },
      { text: 'Longer than 24 hours', score: 0 },
    ]
  },
  {
    id: 'price',
    question: 'When a buyer asks "How much?", what is your immediate response?',
    options: [
      { text: 'I ask a qualifying question first to build value', score: 3 },
      { text: 'I give the price and ask a question', score: 2 },
      { text: 'I just give the price', score: 0 },
      { text: 'I send a long catalog or PDF', score: 1 },
    ]
  },
  {
    id: 'followup',
    question: 'If a buyer ghosts you after seeing the price, what do you do?',
    options: [
      { text: 'I have a structured follow-up sequence I use every time', score: 3 },
      { text: 'I follow up once or twice manually', score: 2 },
      { text: 'I wait for them to reply', score: 0 },
      { text: 'I send a discount offer immediately', score: 1 },
    ]
  },
  {
    id: 'trust',
    question: 'How do you build trust with first-time buyers?',
    options: [
      { text: 'I actively share proof, testimonials, and process details', score: 3 },
      { text: 'I have a professional profile and catalog', score: 2 },
      { text: 'I answer their questions politely', score: 1 },
      { text: 'I assume they trust me if they messaged', score: 0 },
    ]
  },
  {
    id: 'quickreplies',
    question: 'Do you use WhatsApp Quick Replies for common questions?',
    options: [
      { text: 'Yes, extensively for almost everything', score: 3 },
      { text: 'Yes, for a few basic things like greetings', score: 2 },
      { text: 'No, I type everything out manually', score: 0 },
      { text: 'I copy-paste from a notes app', score: 1 },
    ]
  },
  {
    id: 'tracking',
    question: 'How do you track who needs a follow-up?',
    options: [
      { text: 'I use WhatsApp labels and a dedicated tracker', score: 3 },
      { text: 'I use WhatsApp labels only', score: 2 },
      { text: 'I scroll through my chats to remember', score: 0 },
      { text: 'I write them down on paper', score: 1 },
    ]
  }
];

export default function SalesLeakAudit() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [savedResult, setSavedResult] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPreviousResult = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'audit_results', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSavedResult(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching audit result:", error);
      }
    };
    fetchPreviousResult();
  }, [user]);

  const handleAnswer = async (score: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: score };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
      
      if (user) {
        try {
          const total = Object.values(newAnswers).reduce((a, b) => Number(a) + Number(b), 0);
          const max = questions.length * 3;
          const scorePercentage = Math.round((total as number / max) * 100);
          
          const resultData = {
            userId: user.uid,
            score: scorePercentage,
            categoryBreakdown: newAnswers,
            recommendedActions: [], // Can be populated based on answers
            completedAt: serverTimestamp()
          };
          
          await setDoc(doc(db, 'audit_results', user.uid), resultData);
          setSavedResult(resultData);
        } catch (error) {
          console.error("Error saving audit result:", error);
        }
      }
    }
  };

  const calculateScore = () => {
    if (savedResult && !isComplete && Object.keys(answers).length === 0) {
      return { 
        total: Math.round((savedResult.score / 100) * (questions.length * 3)), 
        max: questions.length * 3, 
        percentage: savedResult.score 
      };
    }
    const total = Object.values(answers).reduce((a, b) => Number(a) + Number(b), 0);
    const max = questions.length * 3;
    return { total: total as number, max, percentage: Math.round((total as number / max) * 100) };
  };

  const getDiagnosis = (percentage: number) => {
    if (percentage >= 80) return {
      status: 'Optimized',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      message: 'Your sales process is strong. Focus on advanced techniques like Status Selling and optimizing your follow-up speed.',
      nextSteps: [
        { label: 'Status Selling Mini-Module', path: '/status-selling' },
        { label: '7-Day Rescue Sprint', path: '/rescue-sprint' }
      ]
    };
    if (percentage >= 50) return {
      status: 'Leaking Sales',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      message: 'You have a foundation, but you are losing buyers at key friction points (likely pricing or follow-up).',
      nextSteps: [
        { label: 'Qualification Flow', path: '/qualification-flow' },
        { label: 'Script Bank (Follow-ups)', path: '/scripts' },
        { label: 'Before vs After Examples', path: '/chat-examples' }
      ]
    };
    return {
      status: 'Critical Leaks',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      message: 'Your current process is causing buyers to ghost. You need to implement the core Profit-Lock™ systems immediately.',
      nextSteps: [
        { label: 'Setup Checklist', path: '/checklist' },
        { label: 'Quick Replies Worksheet', path: '/quick-replies' },
        { label: 'Trust Mini-Module', path: '/trust-module' }
      ]
    };
  };

  const showResults = isComplete || (savedResult && Object.keys(answers).length === 0);

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-widest mb-4">
          <Activity size={14} /> Step 1: Diagnose
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">Sales Leak Audit</h1>
        <p className="text-lg text-neutral-500 leading-relaxed">
          Find out exactly where you are losing buyers in your WhatsApp conversations and get a customized action plan to fix it.
        </p>
      </header>

      {!showResults ? (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-200">
          <div className="mb-8 flex items-center justify-between text-sm font-bold text-neutral-400">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
          </div>
          
          <div className="w-full bg-neutral-100 h-2 rounded-full mb-10 overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
            />
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-8 leading-tight">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.score)}
                className="w-full text-left p-5 rounded-2xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-medium text-neutral-700 hover:text-emerald-900 group flex items-center justify-between"
              >
                <span>{option.text}</span>
                <ArrowRight size={18} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {(() => {
            const { percentage } = calculateScore();
            const diagnosis = getDiagnosis(percentage);
            
            return (
              <>
                <div className={`rounded-[2rem] p-8 md:p-12 border ${diagnosis.border} ${diagnosis.bg} text-center`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-6">
                    <span className={`text-3xl font-bold ${diagnosis.color}`}>{percentage}%</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">
                    Status: <span className={diagnosis.color}>{diagnosis.status}</span>
                  </h2>
                  <p className="text-lg text-neutral-700 leading-relaxed max-w-xl mx-auto">
                    {diagnosis.message}
                  </p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-200">
                  <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" /> Your Recommended Next Steps
                  </h3>
                  <div className="grid gap-4">
                    {diagnosis.nextSteps.map((step, idx) => (
                      <Link 
                        key={idx}
                        to={step.path}
                        className="flex items-center justify-between p-5 rounded-2xl bg-neutral-50 hover:bg-emerald-50 border border-neutral-100 hover:border-emerald-200 transition-all group"
                      >
                        <span className="font-bold text-neutral-900 group-hover:text-emerald-800">{step.label}</span>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <ArrowRight size={18} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={() => {
                      setCurrentQuestion(0);
                      setAnswers({});
                      setIsComplete(false);
                    }}
                    className="text-neutral-400 font-bold text-sm uppercase tracking-widest hover:text-neutral-600 transition-colors"
                  >
                    Retake Audit
                  </button>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
