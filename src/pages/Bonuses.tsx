import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, MessageCircle, FileText, Calendar, Gift, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

const statusCaptions = [
  { category: 'Urgency', text: 'Limited stock available, and I’d rather you message early than be disappointed later.' },
  { category: 'Urgency', text: 'A few slots left on this one. If you want in, this is a good time to message me.' },
  { category: 'Urgency', text: 'Closing orders for the week in 2 hours. If you need this, let’s talk now.' },
  { category: 'Urgency', text: 'Only 3 units left at this introductory price. Once they are gone, the price resets.' },
  { category: 'Trust', text: 'We don’t just want to sell to you. We want the process to be clear, smooth, and worth it.' },
  { category: 'Trust', text: 'Quality, clarity, and a good customer experience matter here.' },
  { category: 'Trust', text: 'Another happy delivery! Seeing these results is why we do what we do.' },
  { category: 'Trust', text: 'Real results from a real customer. We let the quality speak for itself.' },
  { category: 'Promo', text: 'If you’ve been considering this, this is a good time to move.' },
  { category: 'Promo', text: 'Special availability currently open. Message me for full details.' },
  { category: 'Promo', text: 'Bundle deal: Buy 2 and get a special surprise. Valid for the next 24 hours.' },
  { category: 'Value', text: 'It’s not just about the product; it’s about how much easier your life becomes with it.' },
  { category: 'Value', text: 'Designed to solve [Problem]. Simple, effective, and reliable.' },
];

const catalogFormulas = [
  {
    type: 'Product',
    formula: '[Product name]\nA [brief description of what it is], designed for [who it is for].\nIt helps with [key benefit].\nAvailable in [size/colour/type/spec].\nMessage to order or request full details.',
    example: 'Premium Ready-to-Wear Set\nA stylish, easy-to-wear outfit set designed for women who want to look polished without stress.\nIdeal for outings, casual events, and simple statement looks.\nAvailable in multiple sizes and select colours.\nMessage to check availability or place your order.'
  },
  {
    type: 'Service',
    formula: '[Service name]\nA [type of service] designed for [type of client].\nThis includes [what is included].\nIdeal for helping you [result].\nMessage to book or request full details.',
    example: 'Logo Design Service\nA logo design service for businesses that want a stronger and more professional visual identity.\nIncludes concept development and a polished final logo.\nIdeal for helping your brand look more credible and more memorable.\nMessage to request details or start your project.'
  },
  {
    type: 'Bundle',
    formula: '[Bundle Name]\nGet [Product A] + [Product B] at a special combined rate.\nPerfect for [Use case].\nSave [Amount/Percentage] compared to buying separately.\nMessage "BUNDLE" to claim yours.',
    example: 'The Morning Glow Bundle\nGet our Vitamin C Serum + Hydrating Moisturizer at 15% off.\nPerfect for a simple, effective daily skincare routine.\nSave ₦2,500 today.\nMessage "BUNDLE" to claim yours.'
  }
];

export default function Bonuses() {
  const [activeTab, setActiveTab] = useState<'status' | 'catalog' | 'calendar'>('status');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 border border-emerald-100 shadow-sm">
          <Gift size={14} />
          <span>Extra Resources</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          Bonus Materials
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-2xl leading-relaxed">
          Extra tools to help you improve your status selling, catalog descriptions, and follow-up process.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
        <button
          onClick={() => setActiveTab('status')}
          className={clsx(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[14px] whitespace-nowrap transition-all border",
            activeTab === 'status' 
              ? "bg-neutral-900 text-white border-neutral-900 shadow-md" 
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <MessageCircle size={16} /> 50 Status Captions
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={clsx(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[14px] whitespace-nowrap transition-all border",
            activeTab === 'catalog' 
              ? "bg-neutral-900 text-white border-neutral-900 shadow-md" 
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <FileText size={16} /> Catalog Formulas
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={clsx(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[14px] whitespace-nowrap transition-all border",
            activeTab === 'calendar' 
              ? "bg-neutral-900 text-white border-neutral-900 shadow-md" 
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <Calendar size={16} /> 7-Day Follow-Up
        </button>
      </div>

      {/* Content */}
      <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
        
        {activeTab === 'status' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">WhatsApp Status Captions</h2>
                <p className="text-lg text-neutral-500 font-light">Pair these with product photos, videos, or testimonials to spark interest without sounding overly "salesy".</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-[12px] font-bold">
                {statusCaptions.length} Captions Available
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statusCaptions.map((caption, i) => {
                const id = `cap-${i}`;
                return (
                  <div key={id} className="bg-neutral-50 border border-neutral-100 rounded-[2rem] p-6 relative group hover:border-emerald-200 hover:bg-white transition-all hover:shadow-md">
                    <span className="inline-block px-3 py-1 bg-white border border-neutral-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 shadow-sm">
                      {caption.category}
                    </span>
                    <p className="text-neutral-800 font-medium pr-10 text-[14px] leading-relaxed">{caption.text}</p>
                    <button 
                      onClick={() => handleCopy(caption.text, id)}
                      className="absolute top-6 right-6 p-2.5 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors bg-white border border-neutral-200 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Copy caption"
                    >
                      {copiedId === id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Catalog Description Formulas</h2>
              <p className="text-lg text-neutral-500 font-light">Write cleaner, clearer catalog descriptions that reduce confusion and make buying easier.</p>
            </div>

            <div className="space-y-10">
              {catalogFormulas.map((item, i) => {
                const id = `cat-${i}`;
                return (
                  <div key={id} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-[2rem] p-8">
                      <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-3 text-[14px]">
                        <span className="bg-neutral-900 text-white px-3 py-1 rounded-xl text-[10px] uppercase tracking-widest">{item.type}</span>
                        Formula
                      </h3>
                      <pre className="whitespace-pre-wrap font-sans text-[14px] text-neutral-600 leading-relaxed bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        {item.formula}
                      </pre>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 relative group">
                      <h3 className="font-bold text-emerald-900 mb-6 text-[14px]">Example</h3>
                      <p className="whitespace-pre-wrap text-[14px] text-emerald-800 leading-relaxed">
                        {item.example}
                      </p>
                      <button 
                        onClick={() => handleCopy(item.example, id)}
                        className="absolute top-8 right-8 p-3 text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-colors bg-white shadow-sm border border-emerald-100 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        {copiedId === id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">7-Day Follow-Up Calendar</h2>
              <p className="text-lg text-neutral-500 font-light max-w-3xl">A simple rhythm you can use after a buyer goes quiet. Follow up is not begging; it's part of selling.</p>
            </div>

            <div className="relative border-l-2 border-emerald-200 ml-6 space-y-12 pb-6 mt-8">
              <div className="relative pl-10">
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-white shadow-sm"></div>
                <h3 className="font-bold text-neutral-900 text-lg">Day 0: Initial Response</h3>
                <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">Send the price, details, and offer. Be clear and make the next step obvious.</p>
              </div>
              
              <div className="relative pl-10">
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-emerald-200 ring-4 ring-white shadow-sm"></div>
                <h3 className="font-bold text-neutral-900 text-lg">Day 1: Soft Check-In</h3>
                <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">Reopen the conversation politely. "Just checking in on the details I shared earlier..."</p>
              </div>

              <div className="relative pl-10">
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-emerald-200 ring-4 ring-white shadow-sm"></div>
                <h3 className="font-bold text-neutral-900 text-lg">Day 2: Value Reminder</h3>
                <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">Re-anchor around value, not pressure. Remind them of the usefulness of the offer.</p>
              </div>

              <div className="relative pl-10">
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-emerald-200 ring-4 ring-white shadow-sm"></div>
                <h3 className="font-bold text-neutral-900 text-lg">Day 4: Availability Reminder</h3>
                <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">Create a little urgency without sounding pushy. Let them know it may not remain open forever.</p>
              </div>

              <div className="relative pl-10">
                <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-neutral-300 ring-4 ring-white shadow-sm"></div>
                <h3 className="font-bold text-neutral-900 text-lg">Day 7: Close-the-Loop</h3>
                <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">End follow-up cleanly. "I'll leave this here for now so I don't disturb you further..."</p>
              </div>
            </div>

            <div className="mt-8 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-emerald-900 text-[15px]">Put this calendar into practice</h4>
                <p className="text-emerald-700 mt-1 text-[14px]">Use the Tracker to manage your leads and know exactly who to follow up with today.</p>
              </div>
              <Link to="/tracker" className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-[14px] transition-colors shadow-sm">
                Open Tracker <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
