import { MessageSquare, ArrowRight, XCircle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const examples = [
  {
    title: "The 'Price Only' vs 'Value-Led' Response",
    context: "A buyer asks 'How much is this?' from a catalog link.",
    weak: {
      buyer: "Hi, how much is the black bag?",
      seller: "$120 plus shipping.",
      result: "Buyer ghosts. They have no context for the value, only the cost."
    },
    strong: {
      buyer: "Hi, how much is the black bag?",
      seller: "Hi Sarah! That's the Onyx Leather Tote. It's $120. Are you looking for an everyday work bag or something for travel? It fits a 15-inch laptop perfectly.",
      result: "Buyer replies. You answered the question but immediately pivoted to their needs and highlighted a key feature."
    }
  },
  {
    title: "The 'Awkward Follow-Up' vs 'Calm Follow-Up'",
    context: "You sent the price yesterday and haven't heard back.",
    weak: {
      seller: "Hello? Are you still interested? I can give you a discount if you buy today.",
      result: "Looks desperate. Lowers your perceived value."
    },
    strong: {
      seller: "Hi Sarah, just closing out my orders for the week. Did you want me to hold the Onyx Tote for you, or should I release it back to inventory?",
      result: "Creates genuine scarcity. Professional, calm, and forces a yes/no decision without begging."
    }
  },
  {
    title: "Handling 'Is that your last price?'",
    context: "The buyer is trying to negotiate on a fixed-price item.",
    weak: {
      buyer: "Can you do $100?",
      seller: "No sorry, prices are fixed.",
      result: "Shuts down the conversation aggressively."
    },
    strong: {
      buyer: "Can you do $100?",
      seller: "I can't do $100 on the Onyx Tote as it's premium leather, but if you order today I can include complimentary express shipping. Would you like to proceed with that?",
      result: "Protects the margin, offers a low-cost concession (shipping), and immediately asks for the sale."
    }
  },
  {
    title: "The 'Poor Payment Close' vs 'Cleaner Close'",
    context: "The buyer said they want to buy.",
    weak: {
      buyer: "Okay I'll take it.",
      seller: "Great! You can pay via bank transfer to 123456789. Let me know when done.",
      result: "Leaves the timeline open-ended. Buyer might forget."
    },
    strong: {
      buyer: "Okay I'll take it.",
      seller: "Perfect. I've reserved it for you. You can transfer $120 to [Bank] 123456789. Just send a screenshot here once done so I can process your shipping label today. Sound good?",
      result: "Creates urgency ('shipping label today'), gives clear instructions, and asks for confirmation."
    }
  }
];

export default function ChatExamples() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
          <MessageSquare size={14} /> Core Systems
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Before vs After Examples
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          See the exact difference between a response that causes ghosting and a response that locks in the sale. Compare the weak leaks with the strong fixes.
        </p>
      </header>

      <div className="space-y-12">
        {examples.map((example, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-200 relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="mb-10 relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight mb-4">{example.title}</h2>
              <div className="inline-flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Context</span>
                <span className="text-[15px] text-neutral-700 font-medium">{example.context}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
              {/* Weak Example */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-red-600 font-bold mb-6 bg-red-50 inline-flex px-4 py-2 rounded-xl border border-red-100">
                  <ShieldAlert size={20} />
                  <span className="tracking-tight">The Leak (Weak)</span>
                </div>
                
                <div className="bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-100 space-y-6 shadow-inner">
                  {example.weak.buyer && (
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-2">Buyer</span>
                      <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-5 py-3.5 text-[15px] text-neutral-700 shadow-sm max-w-[85%] leading-relaxed">
                        {example.weak.buyer}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-2">You</span>
                    <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tr-sm px-5 py-3.5 text-[15px] text-red-900 shadow-sm max-w-[85%] leading-relaxed">
                      {example.weak.seller}
                    </div>
                  </div>
                </div>

                <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex items-start gap-3">
                  <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[14px] text-red-800 leading-relaxed">
                    <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">Result</span>
                    {example.weak.result}
                  </p>
                </div>
              </div>

              {/* Strong Example */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-600 font-bold mb-6 bg-emerald-50 inline-flex px-4 py-2 rounded-xl border border-emerald-100">
                  <ShieldCheck size={20} />
                  <span className="tracking-tight">The Fix (Strong)</span>
                </div>
                
                <div className="bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-100 space-y-6 shadow-inner">
                  {example.strong.buyer && (
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-2">Buyer</span>
                      <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-5 py-3.5 text-[15px] text-neutral-700 shadow-sm max-w-[85%] leading-relaxed">
                        {example.strong.buyer}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mr-2">You</span>
                    <div className="bg-emerald-600 border border-emerald-700 rounded-2xl rounded-tr-sm px-5 py-3.5 text-[15px] text-white shadow-sm max-w-[85%] leading-relaxed">
                      {example.strong.seller}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[14px] text-emerald-800 leading-relaxed">
                    <span className="font-bold uppercase tracking-wider text-[11px] block mb-1">Result</span>
                    {example.strong.result}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
