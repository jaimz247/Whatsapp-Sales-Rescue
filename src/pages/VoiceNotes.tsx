import { Mic, CheckCircle2, XCircle, Volume2, PlayCircle, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

const guidelines = [
  {
    title: "When to Use Voice Notes",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    items: [
      "To explain a complex product feature or customization.",
      "To build trust with a high-ticket buyer who seems hesitant.",
      "To convey enthusiasm or warmth that text can't capture.",
      "When apologizing for a mistake or delay.",
      "When the buyer sends a voice note first (match their energy)."
    ]
  },
  {
    title: "When NOT to Use Voice Notes",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    items: [
      "For the very first reply to a cold lead (it can be intrusive).",
      "To send pricing, account numbers, or addresses (always use text for data).",
      "When the buyer is clearly at work or in a noisy environment.",
      "If the voice note is longer than 60 seconds (they won't listen).",
      "When you are in a noisy environment (wind, traffic, background chatter)."
    ]
  }
];

const prompts = [
  {
    title: "The 'Welcome & Qualify' Prompt",
    context: "Use this after they've sent an initial inquiry and you want to build immediate rapport.",
    script: "Hi [Name]! Thanks for reaching out about the [Product]. I'd love to help you with that. Just so I can give you the best recommendation, are you looking for [Option A] or [Option B]?"
  },
  {
    title: "The 'Reassurance' Prompt",
    context: "Use this when a buyer expresses doubt about quality, delivery, or legitimacy.",
    script: "Hey [Name], I totally understand your concern about [Objection]. Just to reassure you, [Explain Guarantee/Process]. I'm actually at the store/warehouse right now. Let me know if that helps!"
  },
  {
    title: "The 'Complex Answer' Prompt",
    context: "Use this when typing out the answer would take more than 3 paragraphs.",
    script: "Hi [Name], great question. It's a bit easier to explain over voice. Basically, [Explain Feature]. Does that make sense, or would you like me to send a quick video showing it?"
  },
  {
    title: "The 'Post-Purchase Thank You' Prompt",
    context: "Use this immediately after receiving payment to eliminate buyer's remorse.",
    script: "Hey [Name], I just received your payment and packed your order! Thank you so much for trusting us. I'll send the tracking link via text in just a moment. Have a great day!"
  },
  {
    title: "The 'Reactivation' Prompt",
    context: "Use this to wake up a lead who ghosted you 3-5 days ago.",
    script: "Hi [Name], just leaving a quick note because I was thinking about our chat regarding [Product]. I actually just got [New Info/Stock/Update] and wanted to give you first dibs. Let me know if you're still looking!"
  }
];

export default function VoiceNotes() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
          <Mic size={14} /> Advanced Strategy
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Voice Note Mastery
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          Voice notes are the ultimate trust-building tool on WhatsApp, but only if used correctly. Learn when to speak, when to type, and exactly what to say to close the sale.
        </p>
      </header>

      <div className="space-y-12">
        {/* The Golden Rules */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                <Volume2 size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">The 3 Golden Rules</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden group hover:border-indigo-200 transition-colors shadow-inner"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                <div className="text-indigo-600 font-black text-3xl mb-4 opacity-50">01</div>
                <h3 className="font-bold text-neutral-900 mb-3 text-lg tracking-tight">Keep it Under 45s</h3>
                <p className="text-[15px] text-neutral-600 leading-relaxed font-light">Aim for 15-30 seconds. Never exceed 60 seconds unless they specifically asked for a detailed explanation. People ignore long voice notes.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden group hover:border-indigo-200 transition-colors shadow-inner"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                <div className="text-indigo-600 font-black text-3xl mb-4 opacity-50">02</div>
                <h3 className="font-bold text-neutral-900 mb-3 text-lg tracking-tight">Smile When You Speak</h3>
                <p className="text-[15px] text-neutral-600 leading-relaxed font-light">It sounds cliché, but buyers can hear a smile. It instantly makes you sound warmer, more approachable, and less like a robot.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden group hover:border-indigo-200 transition-colors shadow-inner"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                <div className="text-indigo-600 font-black text-3xl mb-4 opacity-50">03</div>
                <h3 className="font-bold text-neutral-900 mb-3 text-lg tracking-tight">End with a Question</h3>
                <p className="text-[15px] text-neutral-600 leading-relaxed font-light">Don't just talk at them. End your voice note with a clear, simple question to prompt a reply and keep the conversation moving.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* When to Use vs Not Use */}
        <section className="grid md:grid-cols-2 gap-6 md:gap-8">
          {guidelines.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border ${guide.border}`}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${guide.bg} ${guide.color} flex items-center justify-center border ${guide.border}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">{guide.title}</h3>
                </div>
                <ul className="space-y-5">
                  {guide.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${guide.color.replace('text-', 'bg-')}`}></div>
                      <span className="text-[15px] text-neutral-700 leading-relaxed font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </section>

        {/* Prompts */}
        <section className="bg-neutral-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">5 Voice Note Prompts to Try Today</h2>
            <p className="text-neutral-400 text-[17px] max-w-2xl font-light leading-relaxed">
              Don't know what to say? Use these proven frameworks. Remember to speak naturally—don't read them like a robot.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 relative z-10">
            {prompts.map((prompt, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm group"
              >
                <div className="flex items-start justify-between mb-6">
                  <h3 className="font-bold text-white text-xl tracking-tight pr-4">{prompt.title}</h3>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <PlayCircle size={20} />
                  </div>
                </div>
                <div className="inline-block bg-white/10 px-3 py-1 rounded-full mb-6">
                  <p className="text-[11px] text-neutral-300 font-bold uppercase tracking-widest">{prompt.context}</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 relative">
                  <p className="text-[15px] text-indigo-100/90 italic leading-relaxed font-light">"{prompt.script}"</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-indigo-500/20 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-start gap-6 relative z-10 backdrop-blur-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xl mb-2 tracking-tight">Crucial Tip: The "Text Sandwich"</h4>
              <p className="text-[15px] text-indigo-100/80 leading-relaxed font-light">
                Always send a short text before or after a voice note. For example: "Hey, sending a quick voice note to explain this better! 👇" This prepares them to listen and prevents the voice note from feeling random.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
