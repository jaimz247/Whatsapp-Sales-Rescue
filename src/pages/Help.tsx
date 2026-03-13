import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckSquare, MessageSquareText, ListTodo, Clock, Gift, ArrowRight, Info } from 'lucide-react';

export default function Help() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-16 max-w-4xl mx-auto"
    >
      <header className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100">
          <Info size={14} />
          <span>Getting Started</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          Read Me First
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-2xl leading-relaxed">
          Welcome to the WhatsApp Sales Rescue Kit. Here is how to get the most out of this portal.
        </p>
      </header>

      <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 md:p-12 shadow-sm">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6 tracking-tight">What is this?</h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed mb-6 font-light">
          This product was created to help you stop losing buyers inside your WhatsApp conversations and start converting more inquiries into paid orders. Inside this portal, you will find practical tools to help you respond better, build trust faster, frame your offer more clearly, and organize leads properly.
        </p>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
          <p className="text-emerald-800 leading-relaxed font-medium text-[15px]">
            This is not a product to admire and leave on your device. It is a practical working kit. Use it. Install it. Adapt it.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Best Order to Use the Kit</h2>
        
        <div className="grid gap-4">
          <Link to="/guide" className="flex items-start gap-6 p-6 bg-white border border-neutral-200 rounded-[2rem] hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-neutral-900 text-[15px]">1. Read the Main Guide</h3>
              <p className="text-[14px] text-neutral-500 mt-2 font-light">This gives you the sales mindset and structure behind the entire system.</p>
            </div>
          </Link>

          <Link to="/checklist" className="flex items-start gap-6 p-6 bg-white border border-neutral-200 rounded-[2rem] hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <CheckSquare size={24} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-neutral-900 text-[15px]">2. Complete the Setup Checklist</h3>
              <p className="text-[14px] text-neutral-500 mt-2 font-light">Use it to clean up and strengthen your WhatsApp Business setup.</p>
            </div>
          </Link>

          <Link to="/action-plan" className="flex items-start gap-6 p-6 bg-white border border-neutral-200 rounded-[2rem] hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-neutral-900 text-[15px]">3. Open the 60-Minute Action Plan</h3>
              <p className="text-[14px] text-neutral-500 mt-2 font-light">This helps you implement the key parts quickly.</p>
            </div>
          </Link>

          <Link to="/scripts" className="flex items-start gap-6 p-6 bg-white border border-neutral-200 rounded-[2rem] hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <MessageSquareText size={24} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-neutral-900 text-[15px]">4. Go through the Script Bank</h3>
              <p className="text-[14px] text-neutral-500 mt-2 font-light">Choose the scripts most relevant to your business and save your top ones.</p>
            </div>
          </Link>

          <Link to="/tracker" className="flex items-start gap-6 p-6 bg-white border border-neutral-200 rounded-[2rem] hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <ListTodo size={24} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-neutral-900 text-[15px]">5. Open the Tracker</h3>
              <p className="text-[14px] text-neutral-500 mt-2 font-light">Enter your current leads and start using the system immediately.</p>
            </div>
          </Link>

          <Link to="/bonuses" className="flex items-start gap-6 p-6 bg-white border border-neutral-200 rounded-[2rem] hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform">
              <Gift size={24} />
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-neutral-900 text-[15px]">6. Use the Bonuses</h3>
              <p className="text-[14px] text-neutral-500 mt-2 font-light">These help you improve your presentation, content, and follow-up over time.</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-neutral-900 text-white rounded-[2rem] p-10 md:p-14 relative overflow-hidden shadow-2xl mt-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 tracking-tight">How to Get Results Fastest</h2>
          <p className="text-[15px] text-neutral-400 mb-10 font-light">If you want quick wins from this product, focus on these actions first:</p>
          <ul className="space-y-8 mb-12">
            <li className="flex gap-5">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold shrink-0">1</span>
              <div>
                <strong className="block text-white text-[15px] mb-1">Improve your first reply</strong>
                <span className="text-neutral-400 text-[14px] leading-relaxed">A better opening message can improve the whole flow of the chat.</span>
              </div>
            </li>
            <li className="flex gap-5">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold shrink-0">2</span>
              <div>
                <strong className="block text-white text-[15px] mb-1">Fix your price presentation</strong>
                <span className="text-neutral-400 text-[14px] leading-relaxed">Do not send only the amount. Add context, value, and next step.</span>
              </div>
            </li>
            <li className="flex gap-5">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold shrink-0">3</span>
              <div>
                <strong className="block text-white text-[15px] mb-1">Start following up properly</strong>
                <span className="text-neutral-400 text-[14px] leading-relaxed">Many buyers who went silent can still be recovered.</span>
              </div>
            </li>
          </ul>
          <Link to="/action-plan" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-[14px] transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1">
            Start the 60-Min Plan <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
