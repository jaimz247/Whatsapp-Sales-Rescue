import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Plus, Search, Users, AlertCircle, CheckCircle2, 
  XCircle, Crown, User as UserIcon, Download, ArrowUpDown, 
  ArrowUp, ArrowDown, Gift, DollarSign, BarChart as BarChartIcon, 
  Activity, Target, Clock, Calendar, CheckSquare, Settings, Zap, PieChart as PieChartIcon, Check, Webhook, Mail, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

interface UnifiedUser {
  email: string;
  uid?: string;
  displayName?: string;
  role?: string;
  accessStatus?: string;
  upgradeStatus?: string;
  lastLoginAt?: any;
  createdAt?: any;
  isAllowed: boolean;
  addedBy?: string;
}

interface Referral {
  id: string;
  referrerId: string;
  referrerEmail: string;
  referredEmail: string;
  amount: number;
  commission: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: any;
}

type SortField = 'email' | 'displayName' | 'accessStatus' | 'upgradeStatus' | 'role' | 'createdAt' | 'lastLoginAt';
type SortDirection = 'asc' | 'desc';
type TabType = 'overview' | 'users' | 'referrals' | 'analytics' | 'webhooks' | 'emails';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Users state
  const [allUsers, setAllUsers] = useState<UnifiedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked' | 'pending'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Referrals state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    scriptsSaved: 0,
    auditsCompleted: 0,
    totalLeads: 0,
    conversionRate: 0,
    leadsByStage: [] as {name: string, value: number}[]
  });

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchAllData();
    fetchReferrals();
    fetchAnalytics();
    fetchWebhooks();
  }, [user, navigate]);

  const fetchWebhooks = async () => {
    setWebhooksLoading(true);
    try {
      const webhooksRef = collection(db, 'webhook_logs');
      const q = query(webhooksRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const hooks: any[] = [];
      snapshot.forEach(doc => {
        hooks.push({ id: doc.id, ...doc.data() });
      });
      setWebhooks(hooks);
    } catch (err) {
      console.error("Error fetching webhooks:", err);
    } finally {
      setWebhooksLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [scriptsSnap, auditsSnap, leadsSnap] = await Promise.all([
        getDocs(collection(db, 'saved_scripts')),
        getDocs(collection(db, 'audit_results')),
        getDocs(collection(db, 'tracker_items'))
      ]);

      let paidLeads = 0;
      const stageCounts: Record<string, number> = {};

      leadsSnap.forEach(doc => {
        const stage = doc.data().stage;
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        if (stage === 'Paid' || stage === 'Delivered') {
          paidLeads++;
        }
      });

      const leadsByStage = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));

      setAnalytics({
        scriptsSaved: scriptsSnap.size,
        auditsCompleted: auditsSnap.size,
        totalLeads: leadsSnap.size,
        conversionRate: leadsSnap.size > 0 ? Math.round((paidLeads / leadsSnap.size) * 100) : 0,
        leadsByStage
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchReferrals = async () => {
    setReferralsLoading(true);
    try {
      const referralsRef = collection(db, 'referrals');
      const q = query(referralsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const refs: Referral[] = [];
      snapshot.forEach(doc => {
        refs.push({ id: doc.id, ...doc.data() } as Referral);
      });
      setReferrals(refs);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      toast.error("Failed to load referrals");
    } finally {
      setReferralsLoading(false);
    }
  };

  const handleUpdateReferralStatus = async (referralId: string, newStatus: 'pending' | 'paid' | 'cancelled') => {
    if (!window.confirm(`Are you sure you want to mark this referral as ${newStatus}?`)) return;
    try {
      await updateDoc(doc(db, 'referrals', referralId), { status: newStatus });
      await fetchReferrals();
      toast.success(`Referral marked as ${newStatus}`);
    } catch (err) {
      console.error("Error updating referral status:", err);
      toast.error("Failed to update referral status");
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [allowedSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'allowed_users')),
        getDocs(collection(db, 'users'))
      ]);

      const unifiedMap = new Map<string, UnifiedUser>();

      allowedSnap.forEach(doc => {
        const data = doc.data();
        unifiedMap.set(doc.id, {
          email: doc.id,
          isAllowed: true,
          addedBy: data.addedBy,
          accessStatus: 'pending',
          createdAt: data.addedAt
        });
      });

      usersSnap.forEach(doc => {
        const data = doc.data();
        const email = data.email?.toLowerCase();
        if (email) {
          const existing = unifiedMap.get(email) || { email, isAllowed: false, createdAt: undefined };
          unifiedMap.set(email, {
            ...existing,
            uid: doc.id,
            displayName: data.displayName,
            role: data.role || 'user',
            accessStatus: data.accessStatus || 'active',
            upgradeStatus: data.upgradeStatus || 'free',
            lastLoginAt: data.lastLoginAt,
            createdAt: data.createdAt || existing.createdAt
          });
        }
      });

      setAllUsers(Array.from(unifiedMap.values()));
    } catch (err) {
      console.error("Error fetching admin data:", err);
      toast.error("Failed to load users");
      setError("Failed to load users. Make sure you have admin permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !user) return;

    const normalizedEmail = newEmail.toLowerCase().trim();
    setIsAdding(true);
    setError(null);

    try {
      await setDoc(doc(db, 'allowed_users', normalizedEmail), {
        addedAt: serverTimestamp(),
        addedBy: user.email
      });
      
      const existingUser = allUsers.find(u => u.email === normalizedEmail);
      if (existingUser?.uid) {
        await updateDoc(doc(db, 'users', existingUser.uid), {
          accessStatus: 'active'
        });
      }
      
      setNewEmail('');
      toast.success("Access granted successfully");
      await fetchAllData();
    } catch (err) {
      console.error("Error granting access:", err);
      toast.error("Failed to grant access");
      setError("Failed to grant access. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRevokeAccess = async (u: UnifiedUser) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${u.email}? They will be logged out and unable to sign in.`)) {
      return;
    }

    try {
      if (u.isAllowed) {
        await deleteDoc(doc(db, 'allowed_users', u.email));
      }
      
      if (u.uid) {
        await updateDoc(doc(db, 'users', u.uid), {
          accessStatus: 'revoked'
        });
      }
      
      await fetchAllData();
      toast.success("Access revoked successfully");
    } catch (err) {
      console.error("Error revoking access:", err);
      toast.error("Failed to revoke access");
    }
  };

  const handleToggleSubscription = async (u: UnifiedUser) => {
    if (!u.uid) return;
    const newStatus = u.upgradeStatus === 'premium' ? 'free' : 'premium';
    if (!window.confirm(`Change subscription for ${u.email} to ${newStatus.toUpperCase()}?`)) return;

    try {
      await updateDoc(doc(db, 'users', u.uid), {
        upgradeStatus: newStatus
      });
      await fetchAllData();
      toast.success(`Subscription updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating subscription:", err);
      toast.error("Failed to update subscription");
    }
  };

  const handleToggleRole = async (u: UnifiedUser) => {
    if (!u.uid) return;
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role for ${u.email} to ${newRole.toUpperCase()}?`)) return;

    try {
      await updateDoc(doc(db, 'users', u.uid), {
        role: newRole
      });
      await fetchAllData();
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("Failed to update role");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-neutral-300 ml-1" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} className="text-emerald-500 ml-1" /> : <ArrowDown size={14} className="text-emerald-500 ml-1" />;
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Name', 'Status', 'Plan', 'Role', 'Added By', 'Joined', 'Last Login'];
    const csvData = filteredAndSortedUsers.map(u => [
      u.email,
      u.displayName || '',
      u.accessStatus || 'pending',
      u.upgradeStatus || 'free',
      u.role || 'user',
      u.addedBy || '',
      u.createdAt?.toDate ? format(u.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A',
      u.lastLoginAt?.toDate ? format(u.lastLoginAt.toDate(), 'yyyy-MM-dd HH:mm') : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = allUsers.filter(u => {
      const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      if (filter === 'active') return u.accessStatus === 'active';
      if (filter === 'revoked') return u.accessStatus === 'revoked';
      if (filter === 'pending') return u.accessStatus === 'pending';
      return true;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'createdAt' || sortField === 'lastLoginAt') {
        valA = a[sortField]?.toMillis() || 0;
        valB = b[sortField]?.toMillis() || 0;
      } else {
        valA = valA ? String(valA).toLowerCase() : '';
        valB = valB ? String(valB).toLowerCase() : '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allUsers, searchTerm, filter, sortField, sortDirection]);

  // Derived Stats
  const stats = useMemo(() => {
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    
    const activeLast30Days = allUsers.filter(u => 
      u.lastLoginAt?.toDate && isAfter(u.lastLoginAt.toDate(), thirtyDaysAgo)
    ).length;

    return {
      total: allUsers.length,
      activeStatus: allUsers.filter(u => u.accessStatus === 'active').length,
      premium: allUsers.filter(u => u.upgradeStatus === 'premium').length,
      revoked: allUsers.filter(u => u.accessStatus === 'revoked').length,
      activeUsers30d: activeLast30Days
    };
  }, [allUsers]);

  // Chart Data: User Growth (last 30 days)
  const growthData = useMemo(() => {
    const days = 30;
    const data = [];
    let runningTotal = 0;
    
    // Simplistic way to generate past 30 days
    for (let i = days; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'MMM dd');
      
      const usersOnDate = allUsers.filter(u => {
        if (!u.createdAt?.toDate) return false;
        const uDate = startOfDay(u.createdAt.toDate());
        return uDate.getTime() === date.getTime();
      }).length;
      
      runningTotal += usersOnDate;
      
      // Also calculate total up to this date
      const totalUpToDate = allUsers.filter(u => {
        if (!u.createdAt?.toDate) return true; // assuming before 30 days if no date
        const uDate = startOfDay(u.createdAt.toDate());
        return uDate.getTime() <= date.getTime();
      }).length;

      data.push({
        name: dateStr,
        New: usersOnDate,
        Total: totalUpToDate
      });
    }
    return data;
  }, [allUsers]);


  if (!user?.isAdmin) return null;

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-900 text-white mb-5 shadow-lg shadow-neutral-900/20">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Admin Workspace</h1>
          <p className="text-neutral-500 text-[16px] font-medium">Platform overview, user management, and detailed analytics.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-[14px] hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
          >
            <Download size={18} />
            Export Users CSV
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <p className="text-red-800 text-[15px] font-medium">{error}</p>
        </motion.div>
      )}

      {/* Modern Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar items-center gap-2 mb-8 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200/60 max-w-fit">
        {(['overview', 'users', 'referrals', 'analytics', 'webhooks', 'emails'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-[14px] font-bold capitalize transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50' 
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
            }`}
          >
            {tab === 'overview' && <Activity size={16} />}
            {tab === 'users' && <Users size={16} />}
            {tab === 'referrals' && <Gift size={16} />}
            {tab === 'analytics' && <BarChartIcon size={16} />}
            {tab === 'webhooks' && <Webhook size={16} />}
            {tab === 'emails' && <Mail size={16} />}
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Users size={20} />
                    </div>
                    <p className="text-[15px] font-bold text-neutral-500">Total Users</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 uppercase">
                  <p className="text-4xl font-black text-neutral-900 tracking-tight">{stats.total}</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Zap size={20} />
                    </div>
                    <p className="text-[15px] font-bold text-neutral-500">Active (30d)</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 uppercase">
                  <p className="text-4xl font-black text-neutral-900 tracking-tight">{stats.activeUsers30d}</p>
                  <p className="text-[13px] font-bold text-emerald-500 mb-1">Engaged</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Crown size={20} />
                    </div>
                    <p className="text-[15px] font-bold text-neutral-500">Premium Users</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 uppercase">
                  <p className="text-4xl font-black text-neutral-900 tracking-tight">{stats.premium}</p>
                  <p className="text-[13px] font-bold text-indigo-500 mb-1">Paid</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Gift size={20} />
                    </div>
                    <p className="text-[15px] font-bold text-neutral-500">Pending Referrals</p>
                  </div>
                </div>
                <div className="flex items-end gap-3 uppercase">
                  <p className="text-4xl font-black text-neutral-900 tracking-tight">{referrals.filter(r => r.status === 'pending').length}</p>
                  <p className="text-[13px] font-bold text-amber-500 mb-1">To review</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" />
                  User Growth (30 Days)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} minTickGap={20} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
                        itemStyle={{ color: '#111827' }}
                      />
                      <Area type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Feed / System Alerts */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Clock size={20} className="text-indigo-500" />
                    Recent Activity
                  </h3>
                  <button onClick={() => setActiveTab('users')} className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700">View All Users</button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {allUsers.slice(0, 7).map((u, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 border border-neutral-200">
                        <UserIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-neutral-900 truncate">{u.displayName || u.email}</p>
                        <p className="text-[13px] text-neutral-500 truncate">
                          {u.createdAt?.toDate ? `Joined ${format(u.createdAt.toDate(), 'MMM dd, yyyy')}` : 'Joined recently'}
                        </p>
                      </div>
                      <div>
                        {u.upgradeStatus === 'premium' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-4 gap-6"
          >
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-neutral-200 pb-6 lg:pb-0 lg:pr-6 mb-6 lg:mb-0">
              <div className="sticky top-6">
                <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-xl mb-6">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Plus size={20} className="text-emerald-400" />
                    Grant Access
                  </h2>
                  <p className="text-[13px] text-neutral-300 mb-6 leading-relaxed">
                    Whitelist a user's email address. They will be able to request a magic link to access the portal.
                  </p>
                  <form onSubmit={handleGrantAccess} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-white placeholder:text-neutral-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAdding || !newEmail}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-[14px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      {isAdding ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Whitelist Email
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-4 ml-1">Filters</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'All Users', count: allUsers.length },
                      { id: 'active', label: 'Active', count: stats.activeStatus },
                      { id: 'pending', label: 'Pending', count: allUsers.length - stats.activeStatus - stats.revoked },
                      { id: 'revoked', label: 'Revoked', count: stats.revoked }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-bold transition-all ${
                          filter === f.id 
                            ? 'bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm' 
                            : 'text-neutral-500 hover:bg-neutral-50 border border-transparent'
                        }`}
                      >
                        {f.label}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${filter === f.id ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-100 text-neutral-400'}`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
                <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/50">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Users size={20} className="text-neutral-400" />
                    Directory <span className="text-neutral-400 font-medium">({filteredAndSortedUsers.length})</span>
                  </h2>
                  <div className="relative">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto flex-1 h-full">
                  {isLoading ? (
                    <div className="p-12 flex justify-center h-full items-center">
                      <div className="w-10 h-10 border-4 border-neutral-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                  ) : filteredAndSortedUsers.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center h-full text-neutral-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-[15px] font-medium text-neutral-500">No users found matching your criteria.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm border-b border-neutral-200">
                        <tr>
                          {[
                            { key: 'email', label: 'User' },
                            { key: 'accessStatus', label: 'Status' },
                            { key: 'upgradeStatus', label: 'Plan' },
                            { key: 'role', label: 'Role' },
                            { key: 'createdAt', label: 'Joined' },
                            { key: 'lastLoginAt', label: 'Last Login' },
                          ].map(col => (
                            <th 
                              key={col.key}
                              className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-700 transition-colors"
                              onClick={() => handleSort(col.key as SortField)}
                            >
                              <div className="flex items-center">
                                {col.label} <SortIcon field={col.key as SortField} />
                              </div>
                            </th>
                          ))}
                          <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredAndSortedUsers.map((u) => (
                          <tr key={u.email} className="hover:bg-neutral-50 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 border border-neutral-200">
                                  <UserIcon size={18} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[14px] font-bold text-neutral-900 truncate">{u.displayName || 'No Name'}</div>
                                  <div className="text-[13px] text-neutral-500 truncate">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {u.accessStatus === 'active' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 size={12} /> Active</span>}
                              {u.accessStatus === 'revoked' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-red-50 text-red-700 border border-red-100"><XCircle size={12} /> Revoked</span>}
                              {u.accessStatus === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-700 border border-amber-100"><AlertCircle size={12} /> Pending</span>}
                            </td>
                            <td className="py-4 px-6">
                              {u.upgradeStatus === 'premium' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"><Crown size={12} /> Premium</span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">Free</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-[12px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'text-purple-600' : 'text-neutral-500'}`}>
                                {u.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-[13px] text-neutral-600">
                                <Calendar size={14} className="text-neutral-400" />
                                {u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : 'Unknown'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-[13px] text-neutral-600">
                                <Clock size={14} className="text-neutral-400" />
                                {u.lastLoginAt?.toDate ? format(u.lastLoginAt.toDate(), 'MMM dd, yyyy') : 'Never'}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {u.uid && (
                                  <>
                                    <button
                                      onClick={() => handleToggleSubscription(u)}
                                      className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors tooltip-trigger"
                                      title="Toggle Premium"
                                    >
                                      <Crown size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleToggleRole(u)}
                                      className="p-2 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors tooltip-trigger"
                                      title="Toggle Admin"
                                    >
                                      <Settings size={18} />
                                    </button>
                                  </>
                                )}
                                
                                {u.accessStatus !== 'revoked' ? (
                                  <button
                                    onClick={() => handleRevokeAccess(u)}
                                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors tooltip-trigger"
                                    title="Revoke Access"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setNewEmail(u.email);
                                      // Note: better UX to un-revoke directly, but kept matching original flow
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-2 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors tooltip-trigger"
                                    title="Restore Access"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Total Referrals</p>
                <p className="text-3xl font-black text-neutral-900">{referrals.length}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Pending Commission</p>
                <p className="text-3xl font-black text-amber-500">${referrals.filter(r => r.status === 'pending').reduce((a, b) => a + (b.commission || 0), 0).toFixed(2)}</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <p className="text-[13px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Total Paid</p>
                <p className="text-3xl font-black text-emerald-500">${referrals.filter(r => r.status === 'paid').reduce((a, b) => a + (b.commission || 0), 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Gift size={20} className="text-neutral-400" />
                  Referral Program History
                </h2>
              </div>

              <div className="overflow-x-auto flex-1 h-full">
                {referralsLoading ? (
                  <div className="p-12 flex justify-center items-center h-full">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-amber-500 rounded-full animate-spin"></div>
                  </div>
                ) : referrals.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center justify-center h-full text-neutral-400">
                    <Gift size={48} className="mb-4 opacity-20" />
                    <p className="text-[15px] font-medium text-neutral-500">No referrals found.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm border-b border-neutral-200">
                      <tr>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Referrer</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Referred User</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Amount Paid</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Commission</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {referrals.map((ref) => (
                        <tr key={ref.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-4 px-6 text-[13px] text-neutral-500 font-medium">
                            {ref.createdAt?.toDate ? format(ref.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-[14px] font-bold text-neutral-900">{ref.referrerEmail}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-[14px] text-neutral-600">{ref.referredEmail}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-[14px] font-bold text-neutral-900">${ref.amount?.toFixed(2)}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-[14px] font-black text-emerald-600">${ref.commission?.toFixed(2)}</div>
                          </td>
                          <td className="py-4 px-6">
                            {ref.status === 'paid' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700"><CheckCircle2 size={12} /> Paid</span>}
                            {ref.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-700 animate-pulse"><AlertCircle size={12} /> Pending</span>}
                            {ref.status === 'cancelled' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-neutral-100 text-neutral-500"><XCircle size={12} /> Cancelled</span>}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {ref.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateReferralStatus(ref.id, 'paid')}
                                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-[12px] rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <DollarSign size={14} /> Pay
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReferralStatus(ref.id, 'cancelled')}
                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-3 mb-4 text-emerald-600">
                  <div className="p-2 bg-emerald-50 rounded-xl"><Target size={20} /></div>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-neutral-500">Total Leads</p>
                </div>
                <p className="text-4xl font-black text-neutral-900">{analytics.totalLeads}</p>
              </div>
              
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 mb-4 text-blue-600">
                  <div className="p-2 bg-blue-50 rounded-xl"><Activity size={20} /></div>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-neutral-500">Conv. Rate</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-neutral-900">{analytics.conversionRate}%</p>
                </div>
              </div>
              
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3 mb-4 text-purple-600">
                  <div className="p-2 bg-purple-50 rounded-xl"><CheckSquare size={20} /></div>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-neutral-500">Audits Done</p>
                </div>
                <p className="text-4xl font-black text-neutral-900">{analytics.auditsCompleted}</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                  <div className="p-2 bg-amber-50 rounded-xl"><Plus size={20} /></div>
                  <p className="text-[14px] font-bold uppercase tracking-wider text-neutral-500">Saved Scripts</p>
                </div>
                <p className="text-4xl font-black text-neutral-900">{analytics.scriptsSaved}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Distribution Chart */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <PieChartIcon className="text-purple-500" size={20} />
                  Leads by Stage
                </h3>
                <div className="h-72 w-full">
                  {analytics.leadsByStage.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.leadsByStage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.leadsByStage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400 font-medium">No lead data available</div>
                  )}
                </div>
              </div>

              {/* Bar Chart representing feature adoption */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <BarChartIcon className="text-blue-500" size={20} />
                  Feature Adoption
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Scripts Saved', count: analytics.scriptsSaved },
                        { name: 'Audits', count: analytics.auditsCompleted },
                        { name: 'Leads Created', count: analytics.totalLeads }
                      ]}
                      margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
                        itemStyle={{ color: '#111827' }}
                        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'webhooks' && (
          <motion.div
            key="webhooks"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Webhook size={20} className="text-emerald-500" />
                  Received Webhooks <span className="text-neutral-400 font-medium">({webhooks.length})</span>
                </h2>
                <button
                  onClick={fetchWebhooks}
                  className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-bold text-[13px] hover:bg-neutral-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <Activity size={16} />Refresh Logs
                </button>
              </div>

              <div className="overflow-x-auto flex-1 h-full">
                {webhooksLoading ? (
                  <div className="p-12 flex justify-center h-full items-center">
                    <div className="w-10 h-10 border-4 border-neutral-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                ) : webhooks.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center justify-center h-full text-neutral-400">
                    <Webhook size={48} className="mb-4 opacity-20" />
                    <p className="text-[15px] font-medium text-neutral-500">No webhooks received yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm border-b border-neutral-200">
                      <tr>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Date/Time</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Provider</th>
                        <th className="py-4 px-6 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Raw Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {webhooks.map((w) => (
                        <tr key={w.id} className="hover:bg-neutral-50 transition-colors group align-top">
                          <td className="py-4 px-6">
                            <div className="text-[13px] text-neutral-600 font-medium whitespace-nowrap">
                              {w.createdAt?.toDate ? format(w.createdAt.toDate(), 'MMM dd, yyyy HH:mm:ss') : 'Unknown'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {w.provider || 'unknown'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <details className="cursor-pointer group/details">
                              <summary className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 mb-2 list-none flex items-center gap-2">
                                <span className="group-open/details:hidden">View Payload</span>
                                <span className="hidden group-open/details:inline">Hide Payload</span>
                              </summary>
                              <pre className="text-[11px] text-neutral-600 bg-neutral-100 p-4 rounded-xl overflow-x-auto border border-neutral-200">
                                {JSON.stringify(w.payload, null, 2)}
                              </pre>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'emails' && (
          <motion.div
            key="emails"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="max-w-3xl mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight flex items-center gap-2">
                  <Mail className="text-indigo-600" /> Communcation Templates
                </h2>
                <p className="text-neutral-500 font-medium text-[15px]">
                  Professional, pre-written templates you can use for your Selar purchase confirmation emails, onboarding sequences, or individual support replies. Simply copy and paste these into your email provider or Selar product settings.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {[
                  {
                    title: "1. Selar Purchase Welcome & Access Instructions (Important)",
                    description: "Set this as the automated message buyers receive immediately after purchase on Selar. It guides them smoothly through the new login process.",
                    subject: "Your Private Access: Elevate Mensah Sales Rescue Kit",
                    body: `Hi there,\n\nThank you for your purchase! I'm thrilled to welcome you to the WhatsApp Sales Rescue Kit.\n\nYour purchase has been securely processed and your email is fully approved for Premium Access.\n\nTo access your dashboard and all the premium modules, please follow these steps:\n1. Go to the private access portal: https://[YOUR_APP_URL]/access\n2. Enter the exact email address you used to make your purchase.\n3. Since this is your first time, click on the **\"Create Account\"** tab.\n4. Create a secure password. Your account will be created instantly and you will be logged in.\n\nFor future visits, simply use the \"Sign In\" tab with your email and the password you just created.\n\nIf you encounter any issues logging in, please reply directly to this email or reach out to our support team.\n\nLet's get to work and elevate your sales!\n\nBest,\nThe Elevate Mensah Team`
                  },
                  {
                    title: "2. Password Reset Instructions (Manual Support)",
                    description: "Send this if a user emails you saying they forgot their password and are struggling to log in.",
                    subject: "Resetting your password for Elevate Mensah",
                    body: `Hi there,\n\nWe noticed you're having trouble logging into your Elevate Mensah Premium Access.\n\nTo reset your password and get back into your account:\n1. Go to the login page: https://[YOUR_APP_URL]/access\n2. Enter your email address and click \"Continue\"\n3. Click on the \"Forgot Password?\" link at the bottom of the screen.\n4. You will receive an automated email from Firebase/Google with a secure link to reset your password.\n\nIf you're still having trouble after following these steps, let us know and we'll be happy to assist further.\n\nBest,\nThe Elevate Mensah Team`
                  },
                  {
                    title: "3. Onboarding Follow-Up (Day 3 Check-in)",
                    description: "Send this 2-3 days after purchase to encourage engagement and show excellent customer care.",
                    subject: "Checking in: How's the Sales Rescue Kit?",
                    body: `Hey,\n\nIt's been a few days since you got the WhatsApp Sales Rescue Kit. I hope you've had a chance to log in and start exploring the modules!\n\nA great place to start is the \"Main Guide\" to get the foundational strategy, then quickly jump into the \"Quick Replies Worksheet\" to start seeing immediate action in your conversations.\n\nHave you had any big wins or \"aha\" moments yet?\n\nWe genuinely care about your progress. Hit reply and let me know—I read every email.\n\nBest,\nThe Elevate Mensah Team`
                  },
                  {
                    title: "4. Cart Abandonment (Selar Recovery)",
                    description: "Use this to win back users who clicked your checkout link but didn't complete the purchase.",
                    subject: "You left something behind (plus a little gift inside)",
                    body: `Hi there,\n\nI noticed you were checking out the WhatsApp Sales Rescue Kit but didn't quite finish your purchase.\n\nI know life gets busy, or maybe you had a quick question before committing. If there's anything you're unsure about, just reply to this email! I'm happy to help.\n\nTo make your decision a bit easier, here is a special 10% discount code just for you: RESCUE10\n\nYou can complete your purchase and claim your discount here: [YOUR_SELAR_CHECKOUT_LINK]\n\nHope to see you inside the portal soon.\n\nBest,\nThe Elevate Mensah Team`
                  },
                  {
                    title: "5. Leave a Testimonial (Day 14 Request)",
                    description: "Send this about two weeks after purchase to collect valuable social proof and reviews.",
                    subject: "Quick question about your experience",
                    body: `Hey,\n\nI hope you're loving the WhatsApp Sales Rescue Kit and already seeing some great results in your business!\n\nAs a creator, nothing means more to me than hearing how these strategies are helping my students. It also helps other business owners know if this kit is right for them.\n\nIf you have 2 minutes today, would you be willing to leave a quick, honest review?\n\nYou can drop your review right here: [YOUR_REVIEW_LINK]\n\nThank you so much for your support and trust.\n\nBest,\nThe Elevate Mensah Team`
                  },
                  {
                    title: "6. Course Update / New Feature Announcement",
                    description: "When you add new resources, templates, or chapters to the platform, let your students know.",
                    subject: "Boom! We just added something new for you \uD83D\uDE80",
                    body: `Hi everyone,\n\nI'm so excited to announce that a brand new module was just added to your dashboard!\n\nI've seen the struggles so many of you have had with [Topic/Problem], so I went back to the lab and put together a step-by-step guide to solve it. It's completely free and available to you right now as an existing member.\n\nLog in here to check it out: https://[YOUR_APP_URL]/access\n\nLet me know what you think!\n\nBest,\nThe Elevate Mensah Team`
                  }
                ].map((tpl, i) => (
                  <div key={i} className="border border-neutral-200 rounded-2xl bg-neutral-50/50 overflow-hidden">
                    <div className="p-5 border-b border-neutral-200 bg-white">
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">{tpl.title}</h3>
                      <p className="text-[14px] text-neutral-500">{tpl.description}</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                          Subject Line
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(tpl.subject);
                              toast.success('Subject line copied!');
                            }}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 normal-case tracking-normal"
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                        <div className="bg-white p-3 border border-neutral-200 rounded-xl text-[14px] font-medium text-neutral-900 shadow-sm">
                          {tpl.subject}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                          Email Body
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(tpl.body);
                              toast.success('Email body copied!');
                            }}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 normal-case tracking-normal"
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                        <div className="bg-white p-4 border border-neutral-200 rounded-xl text-[14px] font-medium text-neutral-700 shadow-sm whitespace-pre-wrap font-mono leading-relaxed">
                          {tpl.body}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
