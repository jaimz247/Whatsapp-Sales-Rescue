import { Filter, ArrowRight, CheckCircle2, MessageSquare, Target, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function QualificationFlow() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
          <Filter size={14} /> Core Systems
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          The Qualification Flow
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          Stop giving the price immediately and hoping they buy. Learn when to answer directly, and when to qualify first to build value and protect your margins.
        </p>
      </header>

      <div className="space-y-12">
        {/* The Core Principle */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8 tracking-tight flex items-center gap-3">
              <Target className="text-emerald-500" />
              The Core Principle
            </h2>
            
            <div className="bg-neutral-900 rounded-3xl p-8 md:p-10 shadow-xl mb-12 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-white/5">
                <MessageSquare size={160} />
              </div>
              <p className="text-xl md:text-2xl text-white font-light leading-relaxed relative z-10">
                "Some buyers aren't ghosting you because of the price. They are ghosting you because <span className="font-bold text-emerald-400">they don't understand the value yet</span>. They are qualifying themselves out, before you let them buy in."
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6 bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
                <h3 className="font-bold text-neutral-900 flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 text-neutral-600 flex items-center justify-center font-bold shadow-sm">1</div>
                  When to Answer Directly
                </h3>
                <ul className="space-y-4 text-[15px] text-neutral-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-neutral-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">The item is low-ticket / impulse buy.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-neutral-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">The buyer is a repeat customer who already trusts you.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-neutral-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">They asked a very specific, technical question alongside the price.</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-6 bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100">
                <h3 className="font-bold text-emerald-900 flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shadow-sm">2</div>
                  When to Qualify First
                </h3>
                <ul className="space-y-4 text-[15px] text-emerald-800">
                  <li className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">The item is high-ticket or premium.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">The product requires customization or sizing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">They just sent a screenshot and said "Price?".</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The 3-Question Flow */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-200">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-12 tracking-tight">The 2-3 Question Qualification Flow</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-neutral-900 text-white shadow-sm z-10 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 md:p-8 rounded-[2rem] border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">Acknowledge & Pivot</h3>
                <p className="text-[15px] text-neutral-500 mb-6 leading-relaxed">Don't ignore the price question, but pivot immediately to their needs.</p>
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 relative">
                  <span className="absolute -top-3 left-5 bg-white px-3 py-0.5 rounded-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-neutral-200">Script</span>
                  <p className="text-[15px] text-neutral-700 font-medium italic leading-relaxed">
                    "Hi! Yes, I can absolutely get you the pricing for that. Are you looking for this for a specific event, or just everyday wear?"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-neutral-900 text-white shadow-sm z-10 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 md:p-8 rounded-[2rem] border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">Deepen the Value</h3>
                <p className="text-[15px] text-neutral-500 mb-6 leading-relaxed">Ask one more question that highlights your expertise or the product's quality.</p>
                <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 relative">
                  <span className="absolute -top-3 left-5 bg-white px-3 py-0.5 rounded-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest border border-neutral-200">Script</span>
                  <p className="text-[15px] text-neutral-700 font-medium italic leading-relaxed">
                    "Perfect. For everyday wear, you'll want something durable. Do you prefer a matte finish or something with a bit of shine? The matte hides scratches better."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-emerald-500 text-white shadow-sm z-10 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 md:p-8 rounded-[2rem] border border-emerald-200 shadow-md ring-1 ring-emerald-500/10">
                <h3 className="text-xl font-bold text-emerald-900 mb-3 tracking-tight">Present Price + Recommendation</h3>
                <p className="text-[15px] text-emerald-700/80 mb-6 leading-relaxed">Now give the price, tied directly to the value you just uncovered.</p>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 relative">
                  <span className="absolute -top-3 left-5 bg-emerald-100 px-3 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-widest border border-emerald-200">Script</span>
                  <p className="text-[15px] text-emerald-900 font-medium italic leading-relaxed">
                    "Based on that, I highly recommend the Matte Onyx version. It's $150, and it will last you years of daily use. I have one left in stock—should I reserve it for you?"
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900 rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Ready to use these scripts?</h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              We've pre-written these qualification flows for you. Head over to the Script Bank to copy, paste, and customize them for your business.
            </p>
            <Link 
              to="/scripts"
              className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-2xl font-bold hover:bg-neutral-100 transition-colors shadow-lg shadow-white/10"
            >
              Go to Script Bank <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
