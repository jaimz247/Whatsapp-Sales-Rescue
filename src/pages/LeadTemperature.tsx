import { Thermometer, Snowflake, Flame, Sun, RefreshCw, Clock, Target, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const temperatures = [
  {
    id: 'cold',
    title: 'Cold Lead',
    icon: Snowflake,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Just discovered you. Asked a generic question like "Price?" or "Do you have this?".',
    speed: 'Respond within 1 hour max. Faster is better.',
    logic: 'They are shopping around. Your goal is to qualify them quickly and stand out from competitors.',
    label: 'New Inquiry'
  },
  {
    id: 'warm',
    title: 'Warm Lead',
    icon: Sun,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Engaged in conversation. Asked specific questions about shipping, sizing, or features.',
    speed: 'Respond within 15-30 minutes.',
    logic: 'They are interested but need reassurance or a specific problem solved before buying.',
    label: 'Interested / Follow Up'
  },
  {
    id: 'hot',
    title: 'Hot Lead',
    icon: Flame,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'Asked for payment details, delivery timelines, or said "I want this".',
    speed: 'Respond IMMEDIATELY (under 5 minutes).',
    logic: 'They have their wallet out. Do not let them cool down. Give clear, simple instructions to pay.',
    label: 'Pending Payment'
  },
  {
    id: 'returning',
    title: 'Returning Buyer',
    icon: RefreshCw,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Has purchased from you before.',
    speed: 'Respond as quickly as possible. Treat them like VIPs.',
    logic: 'They already trust you. Skip the heavy qualification and focus on a smooth, fast transaction or upsell.',
    label: 'VIP / Repeat'
  }
];

export default function LeadTemperature() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
          <Thermometer size={14} /> Advanced Strategy
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
          Lead Temperature Framework
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-3xl leading-relaxed">
          Not all leads are created equal. Treat a cold lead like a hot lead, and you'll scare them away. Treat a hot lead like a cold lead, and you'll lose the sale to a faster competitor. Use this framework to categorize and respond appropriately.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {temperatures.map((temp, index) => {
          const Icon = temp.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-[2rem] p-8 shadow-sm border ${temp.border} relative overflow-hidden group hover:shadow-md transition-shadow`}
            >
              <div className={`absolute top-0 right-0 w-48 h-48 ${temp.bg} rounded-bl-full -z-10 opacity-30 transition-transform group-hover:scale-110`}></div>
              
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${temp.bg} ${temp.color} flex items-center justify-center shadow-sm border border-white/50`}>
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">{temp.title}</h2>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-widest">
                      Label: {temp.label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3 items-start">
                  <MessageCircle size={18} className="text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[13px] font-bold text-neutral-900 mb-1 uppercase tracking-wider">What it means</h3>
                    <p className="text-[15px] text-neutral-600 leading-relaxed">{temp.description}</p>
                  </div>
                </div>
                
                <div className={`rounded-2xl p-5 border ${temp.bg} ${temp.border} bg-opacity-50 flex gap-3 items-start`}>
                  <Clock size={18} className={`${temp.color} shrink-0 mt-0.5`} />
                  <div>
                    <h3 className={`text-[13px] font-bold ${temp.color} mb-1 uppercase tracking-wider`}>Response Speed</h3>
                    <p className="text-[15px] text-neutral-800 font-medium leading-relaxed">{temp.speed}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Target size={18} className="text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[13px] font-bold text-neutral-900 mb-1 uppercase tracking-wider">Follow-Up Logic</h3>
                    <p className="text-[15px] text-neutral-600 leading-relaxed">{temp.logic}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
