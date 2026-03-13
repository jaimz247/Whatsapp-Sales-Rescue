import { Smartphone, Eye, Flame, Users, ArrowRight, RefreshCw, Clock, Star, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

const strategies = [
  {
    title: "Warming Up Cold Leads",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    description: "Use Status to educate buyers who asked for a price but ghosted.",
    tactics: [
      "Post a 'Behind the Scenes' video showing the quality of your product.",
      "Share a quick tip related to your industry (e.g., 'How to care for leather').",
      "Highlight a specific feature that justifies your price point."
    ]
  },
  {
    title: "Reactivating Old Contacts",
    icon: RefreshCw,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "Bring dead leads back to life without sending a direct message.",
    tactics: [
      "Post a 'Flash Sale' exclusively for your WhatsApp contacts.",
      "Share a 'New Arrival' teaser before it hits your website.",
      "Ask a poll question to encourage replies (e.g., 'Which color do you prefer?')."
    ]
  },
  {
    title: "Building Urgency",
    icon: Clock,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    description: "Force a decision from buyers who are 'thinking about it'.",
    tactics: [
      "Post 'Only 2 left in stock!' with a picture of the item.",
      "Share a countdown to a price increase or offer expiration.",
      "Show a screenshot of an order being packed (social proof + scarcity)."
    ]
  },
  {
    title: "Using Proof & Testimonials",
    icon: Star,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    description: "Dismantle skepticism by showing that others trust you.",
    tactics: [
      "Screenshot a happy customer's message (blur their name/number).",
      "Post a video of a customer unboxing your product.",
      "Share a 'Before & After' result if applicable to your service."
    ]
  }
];

export default function StatusSelling() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
          <Smartphone size={14} /> Advanced Strategy
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Status Selling Mastery
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          Your WhatsApp Status is free real estate. Learn how to use it to warm up leads, build urgency, and close sales without sending a single direct message.
        </p>
      </header>

      <div className="space-y-12">
        {/* Core Concept */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-neutral-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                <Eye size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">The "Silent Follow-Up"</h2>
            </div>
            
            <p className="text-[17px] text-neutral-600 leading-relaxed mb-10 font-light max-w-3xl">
              When a buyer ghosts you, sending another message can feel pushy. But if they view your Status, they are still engaged. Status Selling allows you to follow up silently, providing value and proof until they are ready to buy.
            </p>
            
            <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="font-bold text-indigo-600 mb-4 text-[12px] uppercase tracking-widest">The Golden Rule of Status</h3>
              <p className="text-neutral-900 italic font-medium text-xl md:text-2xl leading-relaxed tracking-tight">
                "Don't just post your catalog. Post the story behind the catalog. People buy from people, not brochures."
              </p>
            </div>
          </div>
        </section>

        {/* Strategies Grid */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8 tracking-tight">4 Status Selling Strategies</h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {strategies.map((strategy, index) => {
              const Icon = strategy.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border ${strategy.border} relative overflow-hidden group hover:border-indigo-200 transition-colors`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl ${strategy.bg} ${strategy.color} flex items-center justify-center mb-8 border ${strategy.border}`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">{strategy.title}</h3>
                    <p className="text-neutral-600 mb-8 text-[15px] leading-relaxed font-light">{strategy.description}</p>
                    
                    <div className="space-y-5">
                      <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Tactics</h4>
                      {strategy.tactics.map((tactic, tIndex) => (
                        <div key={tIndex} className="flex items-start gap-4 text-[15px] text-neutral-700 leading-relaxed font-light">
                          <ArrowRight size={18} className="text-indigo-400 mt-0.5 shrink-0" />
                          <span>{tactic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Sequence Example */}
        <section className="bg-neutral-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">Example: The 3-Part "Urgency" Sequence</h2>
            <p className="text-neutral-400 text-[17px] max-w-2xl font-light leading-relaxed">
              Post these three status updates over the course of a single day to drive immediate action from fence-sitters.
            </p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-2xl shrink-0 border border-indigo-500/30">1</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-xl tracking-tight">Morning (9 AM)</h3>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">The Setup</span>
                </div>
                <p className="text-neutral-300 text-[16px] leading-relaxed font-light">Post a video packing an order. Caption: <span className="text-white font-medium italic">"Getting these beauties ready for shipping today! Only 3 left in this color."</span></p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col md:flex-row gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-2xl shrink-0 border border-indigo-500/30">2</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-xl tracking-tight">Afternoon (2 PM)</h3>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">The Proof</span>
                </div>
                <p className="text-neutral-300 text-[16px] leading-relaxed font-light">Post a screenshot of a customer review for that exact item. Caption: <span className="text-white font-medium italic">"Love seeing these messages. Quality speaks for itself."</span></p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-2xl shrink-0 border border-indigo-500/30">3</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white text-xl tracking-tight">Evening (6 PM)</h3>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">The Close</span>
                </div>
                <p className="text-neutral-300 text-[16px] leading-relaxed font-light">Post a photo of the last item. Caption: <span className="text-white font-medium italic">"Down to the last one! DM me to claim it before I close orders for the day."</span></p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
