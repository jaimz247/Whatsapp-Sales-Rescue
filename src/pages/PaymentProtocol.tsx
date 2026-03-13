import { CreditCard, CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const steps = [
  {
    title: "The Payment Request",
    description: "How to ask for the money without sounding desperate or vague.",
    script: "Perfect. The total is $150. You can transfer to [Bank Name] [Account Number]. Please send a screenshot here once done so I can process your order immediately.",
    why: "It gives exact instructions, sets an expectation (send a screenshot), and provides a reason (so I can process immediately)."
  },
  {
    title: "The 'Awaiting Confirmation' Message",
    description: "If they said they paid, but you haven't received the alert yet.",
    script: "Thanks for the screenshot! I'm just waiting for the bank alert to reflect on my end. Sometimes it takes a few minutes. I'll confirm with you the second it drops.",
    why: "It acknowledges their action, explains the delay calmly, and promises follow-up."
  },
  {
    title: "The Payment Received Confirmation",
    description: "The crucial step to reassure the buyer that their money is safe.",
    script: "Payment received! Thank you. Your order is now confirmed. I will send you the tracking details by [Time/Day].",
    why: "It provides immediate relief, confirms the order status, and sets the next expectation."
  }
];

const edgeCases = [
  {
    title: "Wrong Amount Sent",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    script: "Hi Sarah, I received the transfer, but it looks like it was for $120 instead of $150. Could you please send the remaining $30 so I can finalize the order?"
  },
  {
    title: "Delayed Alert (> 24 hours)",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    script: "Hi Sarah, I still haven't received the bank alert for the transfer. Could you double-check with your bank to ensure it went through successfully on your end?"
  },
  {
    title: "Post-Payment Reassurance",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    script: "Payment confirmed. Thank you for trusting us with this purchase. We are preparing your item now and will keep you updated every step of the way."
  }
];

export default function PaymentProtocol() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
          <CreditCard size={14} /> Core Systems
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Payment Confirmation Protocol
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          The moment money changes hands is the highest-anxiety point for a buyer. Handle it professionally to build massive trust and prevent buyer's remorse.
        </p>
      </header>

      <div className="space-y-16">
        {/* 3-Step Flow */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold shadow-sm">
              1-2-3
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">The Verification Flow</h2>
          </div>
          
          <div className="grid gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute left-[2.25rem] top-12 bottom-12 w-0.5 bg-neutral-200 z-0"></div>
            
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 group"
              >
                <div className="md:w-16 shrink-0 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-white border-4 border-neutral-100 text-neutral-400 flex items-center justify-center font-bold text-lg shadow-sm group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                      <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-[15px] text-neutral-500 leading-relaxed">{step.description}</p>
                    </div>
                    
                    <div className="md:w-2/3 space-y-5">
                      <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 relative">
                        <span className="absolute -top-3 left-6 bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-200">Script</span>
                        <p className="text-neutral-700 font-medium italic text-[15px] leading-relaxed">"{step.script}"</p>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[14px] text-emerald-800 leading-relaxed">
                          <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">Why it works</span>
                          {step.why}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Edge Cases */}
        <section className="bg-neutral-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">Handling Edge Cases</h2>
            <p className="text-neutral-400 text-[15px] max-w-2xl font-light">
              Don't panic when things go wrong. Use these templates to handle awkward payment situations professionally.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            {edgeCases.map((caseItem, index) => {
              const Icon = caseItem.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl ${caseItem.bg} ${caseItem.color} flex items-center justify-center mb-6 border ${caseItem.border}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-4 text-lg tracking-tight">{caseItem.title}</h3>
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                    <p className="text-[14px] text-neutral-300 italic leading-relaxed">"{caseItem.script}"</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
