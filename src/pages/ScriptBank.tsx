import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Check, Search, Star, Filter, X, Zap, Clock, Share2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { scripts, ScriptCategory } from '../data/scripts';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';

export default function ScriptBank() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedScripts, setSavedScripts] = useState<Set<string>>(new Set());
  const [recentScripts, setRecentScripts] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().businessProfile) {
          setProfile(docSnap.data().businessProfile);
        } else {
          // Fallback to local storage
          const saved = localStorage.getItem('rescueKit_profile');
          if (saved) {
            setProfile(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      }
    };

    loadProfile();
    window.addEventListener('rescueKit_profile_updated', loadProfile);
    return () => window.removeEventListener('rescueKit_profile_updated', loadProfile);
  }, [user]);

  const personalizeText = (text: string) => {
    if (!isPersonalized || !profile) return text;
    
    let personalized = text;
    if (profile.businessName) personalized = personalized.replace(/\[business name\]/gi, profile.businessName);
    if (profile.productName) personalized = personalized.replace(/\[product\/size\/colour\/quantity\]|\[product\/service\]|\[item\/service\]|\[offer\]/gi, profile.productName);
    if (profile.defaultPrice) personalized = personalized.replace(/\[price\]/gi, profile.defaultPrice);
    
    const bankInfo = `${profile.accountName}\n${profile.bankName}\n${profile.accountNumber}`;
    if (profile.accountName && profile.bankName && profile.accountNumber) {
      personalized = personalized.replace(/\[Account Name\]\n\[Bank Name\]\n\[Account Number\]|\[details\]/gi, bankInfo);
    }
    
    if (profile.deliveryNote) personalized = personalized.replace(/\[delivery\/pickup note if needed\]/gi, profile.deliveryNote);
    
    return personalized;
  };

  const initialFilter = searchParams.get('filter');
  const [activeCategory, setActiveCategory] = useState<ScriptCategory | 'All' | 'Top 15' | 'Saved' | 'Recent'>(
    initialFilter === 'top15' ? 'Top 15' : 'All'
  );

  useEffect(() => {
    const fetchSavedScripts = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'saved_scripts'));
        const querySnapshot = await getDocs(q);
        
        const loadedSaved = new Set<string>();
        querySnapshot.forEach((doc) => {
          if (doc.data().userId === user.uid) {
            loadedSaved.add(doc.data().scriptId);
          }
        });
        setSavedScripts(loadedSaved);
      } catch (error) {
        console.error("Error fetching saved scripts:", error);
        toast.error("Failed to load saved scripts");
      }
    };
    fetchSavedScripts();

    const recent = localStorage.getItem('rescueKit_recentScripts');
    if (recent) {
      try {
        setRecentScripts(JSON.parse(recent));
      } catch (e) {
        console.error('Failed to load recent scripts');
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('rescueKit_recentScripts', JSON.stringify(recentScripts));
  }, [recentScripts]);

  const categories: (ScriptCategory | 'All' | 'Top 15' | 'Saved' | 'Recent')[] = [
    'All',
    'Top 15',
    'Saved',
    'Recent',
    'First Response',
    'Trust-Building',
    'Clarification & Qualification',
    'Price Presentation',
    'Price Defense',
    'Objection Handling',
    'Ghosting Recovery',
    'Closing & Payment',
    'Order Confirmation & Fulfillment',
    'Retention & Repeat Sale'
  ];

  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      // Category filter
      if (activeCategory === 'Top 15' && !script.isTop15) return false;
      if (activeCategory === 'Saved' && !savedScripts.has(script.id)) return false;
      if (activeCategory === 'Recent' && !recentScripts.includes(script.id)) return false;
      if (activeCategory !== 'All' && activeCategory !== 'Top 15' && activeCategory !== 'Saved' && activeCategory !== 'Recent' && script.category !== activeCategory) return false;
      
      // Scenario filter
      if (activeScenario && !script.scenario.toLowerCase().includes(activeScenario.toLowerCase()) && !script.title.toLowerCase().includes(activeScenario.toLowerCase())) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          script.title.toLowerCase().includes(query) ||
          script.scenario.toLowerCase().includes(query) ||
          script.script.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [activeCategory, searchQuery, savedScripts, activeScenario]);

  const scenarios = [
    { label: 'Ghosting', value: 'ghosting' },
    { label: 'Price', value: 'price' },
    { label: 'Payment', value: 'payment' },
    { label: 'Trust', value: 'trust' },
    { label: 'Closing', value: 'closing' },
  ];

  const handleCopy = (text: string, id: string) => {
    const finalContent = personalizeText(text);
    navigator.clipboard.writeText(finalContent);
    setCopiedId(id);
    toast.success("Script copied to clipboard");
    
    // Add to recent scripts (keep last 10)
    setRecentScripts(prev => {
      const newRecent = [id, ...prev.filter(scriptId => scriptId !== id)].slice(0, 10);
      return newRecent;
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (text: string) => {
    const finalContent = personalizeText(text);
    const url = `https://wa.me/?text=${encodeURIComponent(finalContent)}`;
    window.open(url, '_blank');
  };

  const toggleSave = async (id: string) => {
    if (!user) return;
    const newSaved = new Set(savedScripts);
    const isSaving = !newSaved.has(id);
    
    if (isSaving) {
      newSaved.add(id);
    } else {
      newSaved.delete(id);
    }
    setSavedScripts(newSaved);
    
    try {
      const docRef = doc(db, 'saved_scripts', `${user.uid}_${id}`);
      if (isSaving) {
        await setDoc(docRef, {
          userId: user.uid,
          scriptId: id,
          savedAt: serverTimestamp(),
          tags: []
        });
        toast.success("Script saved");
      } else {
        await deleteDoc(docRef);
        toast.success("Script removed from saved");
      }
    } catch (error) {
      console.error("Error toggling saved script:", error);
      toast.error("Failed to save script");
      // Revert optimistic update
      const revertedSaved = new Set(savedScripts);
      setSavedScripts(revertedSaved);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          Script Bank
        </h1>
        <p className="text-xl text-neutral-500 font-light max-w-3xl leading-relaxed">
          Ready-to-use replies for every stage of the conversation. Find the right words, copy, adapt lightly, and send.
        </p>
      </header>

      {/* Search and Filter Bar */}
      <div className="space-y-4 sticky top-[68px] md:top-0 z-30 bg-neutral-50/95 backdrop-blur-xl py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b border-neutral-200/50 md:border-none">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 shadow-sm rounded-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              id="script-search"
              type="text"
              placeholder="Search scripts (e.g. price, ghosting)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-[15px] shadow-sm placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-full p-1 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPersonalized(!isPersonalized)}
              className={clsx(
                "flex items-center justify-center gap-2 border px-4 py-3.5 rounded-2xl font-bold text-[14px] shadow-sm transition-all active:scale-95",
                isPersonalized 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : "bg-white border-neutral-200 text-neutral-700"
              )}
              title={profile ? "Toggle personalization" : "Complete your profile to use this"}
            >
              <Settings2 size={18} />
              <span className="hidden sm:inline">Personalize</span>
            </button>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 bg-white border border-neutral-200 px-5 py-3.5 rounded-2xl font-bold text-[14px] text-neutral-700 shadow-sm active:bg-neutral-50 transition-colors"
            >
              <Filter size={18} />
              {activeCategory === 'All' ? 'Categories' : activeCategory}
            </button>
          </div>
        </div>

        {/* Scenario Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setActiveScenario(null)}
            className={clsx(
              "px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all border",
              activeScenario === null 
                ? "bg-neutral-900 text-white border-neutral-900" 
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
            )}
          >
            All Scenarios
          </button>
          {scenarios.map(s => (
            <button
              key={s.value}
              onClick={() => setActiveScenario(activeScenario === s.value ? null : s.value)}
              className={clsx(
                "px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all border",
                activeScenario === s.value 
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                  : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Mobile Filters Modal */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 md:hidden max-h-[85vh] flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                  <h3 className="text-xl font-bold text-neutral-900">Categories</h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsFilterOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-5 py-4 rounded-2xl text-lg font-semibold transition-all flex items-center justify-between",
                        activeCategory === cat 
                          ? "bg-neutral-900 text-white shadow-md" 
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {cat === 'Top 15' && <Zap size={20} className={activeCategory === cat ? "text-amber-400" : "text-amber-500"} />}
                        {cat === 'Saved' && <Star size={20} className={activeCategory === cat ? "text-amber-400" : "text-amber-500"} />}
                        {cat === 'Recent' && <Clock size={20} className={activeCategory === cat ? "text-emerald-400" : "text-emerald-500"} />}
                        {cat}
                      </span>
                      {cat === 'Saved' && savedScripts.size > 0 && (
                        <span className={clsx(
                          "inline-flex items-center justify-center text-xs px-2.5 py-1 rounded-full font-bold",
                          activeCategory === cat ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                        )}>
                          {savedScripts.size}
                        </span>
                      )}
                      {cat === 'Recent' && recentScripts.length > 0 && (
                        <span className={clsx(
                          "inline-flex items-center justify-center text-xs px-2.5 py-1 rounded-full font-bold",
                          activeCategory === cat ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                        )}>
                          {recentScripts.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-72 shrink-0 sticky top-[120px]">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4 px-4">Categories</h3>
          <div className="space-y-1.5 bg-white border border-neutral-200 rounded-3xl p-3 shadow-sm">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-between group",
                  activeCategory === cat 
                    ? "bg-neutral-900 text-white shadow-md" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <span className="flex items-center gap-2.5">
                  {cat === 'Top 15' && <Zap size={14} className={activeCategory === cat ? "text-amber-400" : "text-amber-500 group-hover:text-amber-600"} />}
                  {cat === 'Saved' && <Star size={14} className={activeCategory === cat ? "text-amber-400" : "text-amber-500 group-hover:text-amber-600"} />}
                  {cat === 'Recent' && <Clock size={14} className={activeCategory === cat ? "text-emerald-400" : "text-emerald-500 group-hover:text-emerald-600"} />}
                  {cat}
                </span>
                {cat === 'Saved' && savedScripts.size > 0 && (
                  <span className={clsx(
                    "inline-flex items-center justify-center text-[10px] px-2 py-0.5 rounded-full font-bold",
                    activeCategory === cat ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                  )}>
                    {savedScripts.size}
                  </span>
                )}
                {cat === 'Recent' && recentScripts.length > 0 && (
                  <span className={clsx(
                    "inline-flex items-center justify-center text-[10px] px-2 py-0.5 rounded-full font-bold",
                    activeCategory === cat ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                  )}>
                    {recentScripts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Script Cards */}
        <div className="flex-1 w-full">
          <AnimatePresence mode="popLayout">
            {filteredScripts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 bg-white border border-neutral-200 rounded-3xl border-dashed"
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-neutral-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">No scripts found</h3>
                <p className="text-[15px] text-neutral-500 mb-8 font-light max-w-md mx-auto">We couldn't find any scripts matching your search or category filter.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="text-white font-bold bg-neutral-900 hover:bg-neutral-800 px-6 py-3.5 rounded-2xl transition-colors shadow-sm text-[15px]"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                {filteredScripts.map(script => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    key={script.id} 
                    className="bg-white border border-neutral-200 rounded-3xl shadow-sm hover:shadow-md hover:shadow-emerald-500/5 hover:border-emerald-200 transition-all flex flex-col h-full overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4 md:mb-5">
                        <div className="pr-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-100">
                              {script.category}
                            </span>
                            {script.isTop15 && (
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-400/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-400/30 flex items-center gap-1 shadow-sm">
                                <Zap size={10} className="fill-amber-500 text-amber-500" /> Top 15
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-neutral-900 leading-tight tracking-tight">{script.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 -mr-1 -mt-1 shrink-0">
                          <button 
                            onClick={() => handleCopy(script.script, script.id)}
                            className={clsx(
                              "p-3 transition-all rounded-full",
                              copiedId === script.id ? "text-emerald-600 bg-emerald-50" : "text-neutral-300 hover:text-emerald-600 hover:bg-emerald-50"
                            )}
                            title="Quick Copy"
                          >
                            {copiedId === script.id ? <Check size={22} /> : <Copy size={22} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 md:space-y-4 mb-5 md:mb-6 flex-1 bg-neutral-50/50 p-4 md:p-5 rounded-2xl border border-neutral-100">
                        <div>
                          <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1 md:mb-1.5">Scenario</span> 
                          <p className="text-[12px] md:text-[13px] text-neutral-700 leading-relaxed font-medium">{script.scenario}</p>
                        </div>
                        <div className="h-px bg-neutral-200/60 w-full"></div>
                        <div>
                          <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1 md:mb-1.5">When to use</span> 
                          <p className="text-[12px] md:text-[13px] text-neutral-600 leading-relaxed">{script.whenToUse}</p>
                        </div>
                      </div>

                      <div className="bg-neutral-900 rounded-2xl overflow-hidden mt-auto shadow-inner relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                        <div className="p-4 sm:p-5 md:p-6">
                          <p className="text-white whitespace-pre-wrap font-medium leading-relaxed text-[14px] md:text-[15px]">
                            {personalizeText(script.script)}
                          </p>
                          {script.optionalVariation && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="text-[9px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 md:mb-1.5">Optional Variation</p>
                              <p className="text-[13px] md:text-[14px] text-neutral-300 italic">
                                "{personalizeText(script.optionalVariation)}"
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex border-t border-white/10">
                          <button 
                            onClick={() => handleCopy(script.script, script.id)}
                            className={clsx(
                              "flex-1 py-4.5 px-4 font-bold text-[14px] flex items-center justify-center gap-2 transition-all relative overflow-hidden",
                              copiedId === script.id 
                                ? "bg-emerald-500 text-white" 
                                : "bg-white/5 text-white hover:bg-white/10"
                            )}
                          >
                            {copiedId === script.id ? (
                              <><Check size={18} /> Copied</>
                            ) : (
                              <><Copy size={18} /> Copy</>
                            )}
                          </button>
                          <button 
                            onClick={() => handleShare(script.script)}
                            className="flex-1 py-4.5 px-4 font-bold text-[14px] flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all border-l border-white/10"
                          >
                            <Share2 size={18} /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Floating Search Focus Button for Mobile */}
      {!searchQuery && (
        <button 
          onClick={() => document.getElementById('script-search')?.focus()}
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
        >
          <Search size={24} />
        </button>
      )}
    </motion.div>
  );
}
