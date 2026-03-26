import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle2, Plus, Trash2, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const defaultWorksheet = [
  { id: '1', shortcut: '/hi', category: 'Greeting', message: 'Hi there! Thanks for reaching out to [Business Name]. How can I help you today?', when: 'First message from a new lead', note: 'Add their name if known' },
  { id: '2', shortcut: '/price', category: 'Pricing', message: 'The [Product Name] is [Price]. Are you looking for this for a specific occasion or everyday use?', when: 'When asked "How much?"', note: 'Always end with a question' },
  { id: '3', shortcut: '/shipping', category: 'Logistics', message: 'We ship nationwide via [Carrier]. Standard delivery takes 2-3 days and costs [Amount]. Would you like me to check express options?', when: 'When asked about delivery', note: 'Be clear on timelines' },
  { id: '4', shortcut: '/pay', category: 'Closing', message: 'Perfect. Your total is [Amount]. You can transfer to [Bank] [Account]. Please send a screenshot here once done so I can process your order.', when: 'When they agree to buy', note: 'Create urgency' },
  { id: '5', shortcut: '/followup', category: 'Follow-up', message: 'Hi [Name], just closing out my orders for the week. Did you want me to hold the [Item] for you, or should I release it?', when: '24 hours after ghosting', note: 'Don\'t sound desperate' },
];

export default function QuickRepliesWorksheet() {
  const [worksheet, setWorksheet] = useState(defaultWorksheet);
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('rescueKit_quickReplies');
    if (savedData) {
      try {
        setWorksheet(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved quick replies");
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('rescueKit_quickReplies', JSON.stringify(worksheet));
    setSaved(true);
    toast.success("Worksheet saved to device");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (id: string, field: string, value: string) => {
    setWorksheet(worksheet.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleAddRow = () => {
    const newId = Date.now().toString();
    setWorksheet([...worksheet, { id: newId, shortcut: '/', category: '', message: '', when: '', note: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setWorksheet(worksheet.filter(row => row.id !== id));
  };

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
      className="max-w-6xl mx-auto pb-16"
    >
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-widest mb-6 border border-emerald-100 shadow-sm">
          <FileText size={14} /> Diagnostics & Setup
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              Quick Replies Install Worksheet
            </h1>
            <p className="text-[17px] text-neutral-500 font-light leading-relaxed">
              Map out your most common responses before adding them to WhatsApp Business. This ensures consistency, saves hours of typing, and keeps your tone professional.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] shrink-0 shadow-md hover:shadow-lg"
          >
            {saved ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Save size={18} />}
            {saved ? 'Saved to Device' : 'Save Worksheet'}
          </button>
        </div>
      </header>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4 items-start">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-amber-900 mb-1 text-[15px]">How to install these in WhatsApp Business</h3>
          <p className="text-amber-800 text-[14px] leading-relaxed">
            Go to Settings &gt; Business Tools &gt; Quick Replies. Tap the + icon. Copy your message from below, paste it in, and set the shortcut. Remember to replace bracketed text like [Name] before sending!
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200">
                <th className="p-5 font-bold text-neutral-900 text-[13px] uppercase tracking-wider w-36">Shortcut</th>
                <th className="p-5 font-bold text-neutral-900 text-[13px] uppercase tracking-wider w-40">Category</th>
                <th className="p-5 font-bold text-neutral-900 text-[13px] uppercase tracking-wider min-w-[350px]">Full Message</th>
                <th className="p-5 font-bold text-neutral-900 text-[13px] uppercase tracking-wider w-56">When to Use</th>
                <th className="p-5 font-bold text-neutral-900 text-[13px] uppercase tracking-wider w-56">Personalization Note</th>
                <th className="p-5 font-bold text-neutral-900 text-[13px] uppercase tracking-wider w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <AnimatePresence>
                {worksheet.map((row) => (
                  <motion.tr 
                    key={row.id}
                    initial={{ opacity: 0, bg: '#f8fafc' }}
                    animate={{ opacity: 1, bg: '#ffffff' }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="p-4 align-top">
                      <input 
                        type="text" 
                        value={row.shortcut} 
                        onChange={(e) => handleChange(row.id, 'shortcut', e.target.value)}
                        placeholder="/shortcut"
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] font-mono text-emerald-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-300"
                      />
                    </td>
                    <td className="p-4 align-top">
                      <input 
                        type="text" 
                        value={row.category} 
                        onChange={(e) => handleChange(row.id, 'category', e.target.value)}
                        placeholder="e.g. Greeting"
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-300"
                      />
                    </td>
                    <td className="p-4 align-top relative">
                      <textarea 
                        value={row.message} 
                        onChange={(e) => handleChange(row.id, 'message', e.target.value)}
                        placeholder="Type your full message here..."
                        rows={4}
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3 text-[14px] text-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y transition-all placeholder:text-neutral-300"
                      />
                      <button
                        onClick={() => handleCopy(row.message, row.id)}
                        className="absolute top-6 right-6 p-1.5 bg-white border border-neutral-200 rounded-md text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        title="Copy message"
                      >
                        {copiedId === row.id ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </td>
                    <td className="p-4 align-top">
                      <textarea 
                        value={row.when} 
                        onChange={(e) => handleChange(row.id, 'when', e.target.value)}
                        placeholder="When should you use this?"
                        rows={2}
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3 text-[13px] text-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y transition-all placeholder:text-neutral-300"
                      />
                    </td>
                    <td className="p-4 align-top">
                      <textarea 
                        value={row.note} 
                        onChange={(e) => handleChange(row.id, 'note', e.target.value)}
                        placeholder="Any notes for personalization?"
                        rows={2}
                        className="w-full bg-neutral-50/50 border border-neutral-200 rounded-xl px-4 py-3 text-[13px] text-neutral-500 italic focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y transition-all placeholder:text-neutral-300"
                      />
                    </td>
                    <td className="p-4 align-top text-center pt-6">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete row"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-center">
          <button 
            onClick={handleAddRow}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-6 py-2.5 rounded-full transition-colors border border-emerald-100"
          >
            <Plus size={16} /> Add New Quick Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
}
