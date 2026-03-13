import { ShieldCheck, Star, Users, CheckCircle2, MessageCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function TrustModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-purple-100 shadow-sm">
          <ShieldCheck size={14} /> Advanced Strategy
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Trust-Building Mastery
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-2xl leading-relaxed">
          First-time buyers are naturally skeptical. Here is how to systematically dismantle their uncertainty before they even ask.
        </p>
      </header>

      <div className="space-y-8">
        {/* Profile Basics */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">WhatsApp Profile Trust Basics</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="font-bold text-neutral-900 text-[15px] uppercase tracking-wider">The "Must-Haves"</h3>
              <ul className="space-y-4 text-neutral-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[15px] leading-relaxed">A clear, professional profile picture (logo or face).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[15px] leading-relaxed">A business description that states exactly what you do.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[15px] leading-relaxed">Operating hours clearly listed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[15px] leading-relaxed">A link to your website or main social media profile.</span>
                </li>
              </ul>
            </div>
            <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Info size={18} className="text-purple-600" />
                <h3 className="font-bold text-purple-900 text-[14px] uppercase tracking-wider">Why it matters</h3>
              </div>
              <p className="text-[15px] text-purple-800 leading-relaxed font-medium">
                Before a buyer sends their first message, they check your profile. If it looks empty or unprofessional, their trust level drops to zero instantly.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Reassuring First-Time Buyers */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-neutral-200"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Reassuring First-Time Buyers</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-100">
              <div className="flex items-start gap-4">
                <MessageCircle className="text-indigo-400 shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-[16px]">The "Process" Script</h3>
                  <p className="text-[14px] text-neutral-500 mb-4 leading-relaxed">
                    Uncertainty kills sales. Tell them exactly what happens after they pay.
                  </p>
                  <div className="bg-white p-5 rounded-xl border border-neutral-200 text-[15px] text-neutral-700 font-medium italic shadow-sm leading-relaxed relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-l-xl"></div>
                    "Since this is your first time ordering with us, here is how it works: Once payment is confirmed, we pack your order within 24 hours and send you a tracking link. Delivery usually takes 2-3 days."
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-100">
              <div className="flex items-start gap-4">
                <MessageCircle className="text-indigo-400 shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-neutral-900 mb-2 text-[16px]">The "Guarantee" Script</h3>
                  <p className="text-[14px] text-neutral-500 mb-4 leading-relaxed">
                    Remove the risk from their shoulders.
                  </p>
                  <div className="bg-white p-5 rounded-xl border border-neutral-200 text-[15px] text-neutral-700 font-medium italic shadow-sm leading-relaxed relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-l-xl"></div>
                    "We guarantee all our deliveries. If anything happens in transit, we replace it immediately at no cost to you."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Using Testimonials */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-neutral-900 rounded-[2rem] p-8 md:p-12 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-sm border border-emerald-500/30">
              <Star size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">How to Use Proof</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-500/30">1</div>
              <h3 className="font-bold text-white mb-3 text-[16px]">The Status Update</h3>
              <p className="text-[14px] text-neutral-300 leading-relaxed">
                Post screenshots of happy customer reviews or packed orders on your WhatsApp Status daily.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-500/30">2</div>
              <h3 className="font-bold text-white mb-3 text-[16px]">The Catalog Link</h3>
              <p className="text-[14px] text-neutral-300 leading-relaxed">
                Include a link to a dedicated "Reviews" highlight on your Instagram or a review page in your catalog.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-500/30">3</div>
              <h3 className="font-bold text-white mb-3 text-[16px]">The Direct Send</h3>
              <p className="text-[14px] text-neutral-300 leading-relaxed">
                If a buyer is hesitating on a specific product, send them a screenshot of a review for <span className="text-emerald-400 font-medium italic">that exact product</span>.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
