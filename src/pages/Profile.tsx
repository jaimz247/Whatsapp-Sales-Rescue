import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Save, Building2, CreditCard, Package, Tag, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Profile() {
  const [profile, setProfile] = useState({
    businessName: '',
    productName: '',
    defaultPrice: '',
    accountName: '',
    bankName: '',
    accountNumber: '',
    deliveryNote: '',
    niche: ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.businessProfile) {
            setProfile(prev => ({ ...prev, ...data.businessProfile }));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        businessProfile: profile,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      localStorage.setItem('rescueKit_profile', JSON.stringify(profile));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Dispatch event so other components can update if needed
      window.dispatchEvent(new Event('rescueKit_profile_updated'));
      toast.success("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16 max-w-4xl mx-auto"
    >
      <header>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
          Business Profile
        </h1>
        <p className="text-[17px] text-neutral-500 font-light max-w-2xl leading-relaxed">
          Set your business details once. We'll automatically insert them into your scripts to save you time.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business & Product */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold text-neutral-900">General Info</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Business Name</label>
              <input 
                type="text" 
                value={profile.businessName}
                onChange={e => setProfile({...profile, businessName: e.target.value})}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
                placeholder="e.g. Luxe Fragrances"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Main Product/Service</label>
              <input 
                type="text" 
                value={profile.productName}
                onChange={e => setProfile({...profile, productName: e.target.value})}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
                placeholder="e.g. Designer Perfumes"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Standard Price (with currency)</label>
            <input 
              type="text" 
              value={profile.defaultPrice}
              onChange={e => setProfile({...profile, defaultPrice: e.target.value})}
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
              placeholder="e.g. $50 or ₦25,000"
            />
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-neutral-900">Payment Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Account Name</label>
              <input 
                type="text" 
                value={profile.accountName}
                onChange={e => setProfile({...profile, accountName: e.target.value})}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
                placeholder="e.g. John Doe Enterprises"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Bank Name</label>
              <input 
                type="text" 
                value={profile.bankName}
                onChange={e => setProfile({...profile, bankName: e.target.value})}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
                placeholder="e.g. First National Bank"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Account Number</label>
            <input 
              type="text" 
              value={profile.accountNumber}
              onChange={e => setProfile({...profile, accountNumber: e.target.value})}
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
              placeholder="e.g. 0123456789"
            />
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-orange-600" size={20} />
            <h2 className="text-lg font-bold text-neutral-900">Delivery / Fulfillment</h2>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Default Delivery Note</label>
            <textarea 
              rows={3}
              value={profile.deliveryNote}
              onChange={e => setProfile({...profile, deliveryNote: e.target.value})}
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none resize-none text-[14px] font-medium transition-all shadow-sm"
              placeholder="e.g. Delivery takes 24-48 hours within the city."
            />
          </div>
        </div>

        {/* Niche Tagging */}
        <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="text-purple-600" size={20} />
            <h2 className="text-lg font-bold text-neutral-900">Business Niche</h2>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-neutral-700 mb-2 uppercase tracking-widest">Select your primary niche</label>
            <p className="text-[13px] text-neutral-500 mb-4">This helps us tailor script suggestions and examples to your specific industry.</p>
            <select 
              value={profile.niche}
              onChange={e => setProfile({...profile, niche: e.target.value})}
              className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-medium transition-all shadow-sm"
            >
              <option value="">Select a niche...</option>
              <option value="ecommerce">E-commerce & Physical Products</option>
              <option value="services">Professional Services & Consulting</option>
              <option value="digital">Digital Products & Courses</option>
              <option value="health">Health, Beauty & Wellness</option>
              <option value="realestate">Real Estate & Property</option>
              <option value="food">Food & Beverage</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 sticky bottom-6 md:static z-40">
          {isSaved && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-600 font-bold text-[14px]"
            >
              <CheckCircle2 size={18} /> Saved successfully
            </motion.div>
          )}
          <button 
            type="submit"
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
          >
            <Save size={20} /> Save Profile
          </button>
        </div>
      </form>
    </motion.div>
  );
}
