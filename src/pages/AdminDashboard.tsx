import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Shield, Plus, Trash2, Search, Users, AlertCircle, CheckCircle2, XCircle, Crown, User as UserIcon, MoreVertical, Edit2, Download, ArrowUpDown, ArrowUp, ArrowDown, Gift, DollarSign } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

type SortField = 'email' | 'displayName' | 'accessStatus' | 'upgradeStatus' | 'role' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type TabType = 'users' | 'referrals';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  
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

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchAllData();
    fetchReferrals();
  }, [user, navigate]);

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
    } finally {
      setReferralsLoading(false);
    }
  };

  const handleUpdateReferralStatus = async (referralId: string, newStatus: 'pending' | 'paid' | 'cancelled') => {
    if (!window.confirm(`Are you sure you want to mark this referral as ${newStatus}?`)) return;
    try {
      await updateDoc(doc(db, 'referrals', referralId), { status: newStatus });
      await fetchReferrals();
    } catch (err) {
      console.error("Error updating referral status:", err);
      setError("Failed to update referral status.");
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
          accessStatus: 'pending'
        });
      });

      usersSnap.forEach(doc => {
        const data = doc.data();
        const email = data.email?.toLowerCase();
        if (email) {
          const existing = unifiedMap.get(email) || { email, isAllowed: false };
          unifiedMap.set(email, {
            ...existing,
            uid: doc.id,
            displayName: data.displayName,
            role: data.role || 'user',
            accessStatus: data.accessStatus || 'active',
            upgradeStatus: data.upgradeStatus || 'free',
            lastLoginAt: data.lastLoginAt,
            createdAt: data.createdAt
          });
        }
      });

      setAllUsers(Array.from(unifiedMap.values()));
    } catch (err) {
      console.error("Error fetching admin data:", err);
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
      // Add to allowed_users
      await setDoc(doc(db, 'allowed_users', normalizedEmail), {
        addedAt: serverTimestamp(),
        addedBy: user.email
      });
      
      // If user exists in users collection, update their accessStatus
      const existingUser = allUsers.find(u => u.email === normalizedEmail);
      if (existingUser?.uid) {
        await updateDoc(doc(db, 'users', existingUser.uid), {
          accessStatus: 'active'
        });
      }
      
      setNewEmail('');
      await fetchAllData();
    } catch (err) {
      console.error("Error granting access:", err);
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
      // Remove from allowed_users
      if (u.isAllowed) {
        await deleteDoc(doc(db, 'allowed_users', u.email));
      }
      
      // Update users collection if they exist
      if (u.uid) {
        await updateDoc(doc(db, 'users', u.uid), {
          accessStatus: 'revoked'
        });
      }
      
      await fetchAllData();
    } catch (err) {
      console.error("Error revoking access:", err);
      setError("Failed to revoke access.");
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
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError("Failed to update subscription.");
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
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update role.");
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
    const headers = ['Email', 'Name', 'Status', 'Plan', 'Role', 'Added By'];
    const csvData = filteredAndSortedUsers.map(u => [
      u.email,
      u.displayName || '',
      u.accessStatus || 'pending',
      u.upgradeStatus || 'free',
      u.role || 'user',
      u.addedBy || ''
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

      if (sortField === 'createdAt') {
        valA = a.createdAt?.toMillis() || 0;
        valB = b.createdAt?.toMillis() || 0;
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

  // Stats
  const stats = useMemo(() => {
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.accessStatus === 'active').length,
      premium: allUsers.filter(u => u.upgradeStatus === 'premium').length,
      revoked: allUsers.filter(u => u.accessStatus === 'revoked').length,
    };
  }, [allUsers]);

  if (!user?.isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-900 text-white mb-4 shadow-md">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-neutral-500 text-[16px]">Manage users, access control, and subscriptions.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl font-medium text-sm hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users' 
              ? 'border-neutral-900 text-neutral-900' 
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            Users
          </div>
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'referrals' 
              ? 'border-neutral-900 text-neutral-900' 
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift size={16} />
            Referrals
          </div>
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={18} />
            </div>
            <p className="text-sm font-medium text-neutral-500">Total Users</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-sm font-medium text-neutral-500">Active</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.active}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Crown size={18} />
            </div>
            <p className="text-sm font-medium text-neutral-500">Premium</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.premium}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <XCircle size={18} />
            </div>
            <p className="text-sm font-medium text-neutral-500">Revoked</p>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.revoked}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-neutral-400" />
              Grant Access
            </h2>
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[15px] focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAdding || !newEmail}
                className="w-full bg-neutral-900 text-white py-2.5 rounded-xl font-medium text-[15px] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Plus size={18} />
                    Grant Access
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Users added here will be whitelisted and can request a magic link to access the portal.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
                <Users size={18} className="text-neutral-400" />
                User Management ({filteredAndSortedUsers.length})
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending (Not Joined)</option>
                  <option value="revoked">Revoked</option>
                </select>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
                </div>
              ) : filteredAndSortedUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-neutral-500">No users found matching your criteria.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-neutral-50/50 border-b border-neutral-100">
                      <th 
                        className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">User <SortIcon field="email" /></div>
                      </th>
                      <th 
                        className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('accessStatus')}
                      >
                        <div className="flex items-center">Status <SortIcon field="accessStatus" /></div>
                      </th>
                      <th 
                        className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('upgradeStatus')}
                      >
                        <div className="flex items-center">Plan <SortIcon field="upgradeStatus" /></div>
                      </th>
                      <th 
                        className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center">Role <SortIcon field="role" /></div>
                      </th>
                      <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredAndSortedUsers.map((u) => (
                      <tr key={u.email} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                              <UserIcon size={16} />
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-neutral-900">{u.displayName || 'No Name'}</div>
                              <div className="text-[13px] text-neutral-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {u.accessStatus === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle2 size={12} /> Active
                            </span>
                          )}
                          {u.accessStatus === 'revoked' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                              <XCircle size={12} /> Revoked
                            </span>
                          )}
                          {u.accessStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                              <AlertCircle size={12} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {u.upgradeStatus === 'premium' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                              <Crown size={12} /> Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                              Free
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-medium ${u.role === 'admin' ? 'text-purple-600' : 'text-neutral-500'}`}>
                            {u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.uid && (
                              <>
                                <button
                                  onClick={() => handleToggleSubscription(u)}
                                  className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                  title="Toggle Subscription"
                                >
                                  <Crown size={16} />
                                </button>
                                <button
                                  onClick={() => handleToggleRole(u)}
                                  className="p-1.5 text-neutral-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                  title="Toggle Admin Role"
                                >
                                  <Shield size={16} />
                                </button>
                              </>
                            )}
                            
                            {u.accessStatus !== 'revoked' ? (
                              <button
                                onClick={() => handleRevokeAccess(u)}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Revoke Access"
                              >
                                <XCircle size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setNewEmail(u.email);
                                  // Scroll to top to show the form
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-1.5 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Restore Access"
                              >
                                <CheckCircle2 size={16} />
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
      </div>
        </>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
              <Gift size={18} className="text-neutral-400" />
              Referrals ({referrals.length})
            </h2>
          </div>

          <div className="overflow-x-auto flex-1">
            {referralsLoading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
              </div>
            ) : referrals.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-neutral-500">No referrals found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-50/50 border-b border-neutral-100">
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">Referrer</th>
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">Referred User</th>
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">Commission</th>
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] text-neutral-500">
                        {ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[14px] font-medium text-neutral-900">{ref.referrerEmail}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[14px] text-neutral-500">{ref.referredEmail}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[14px] font-medium text-neutral-900">${ref.amount?.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[14px] font-medium text-emerald-600">${ref.commission?.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-6">
                        {ref.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        )}
                        {ref.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            <AlertCircle size={12} /> Pending
                          </span>
                        )}
                        {ref.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                            <XCircle size={12} /> Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ref.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateReferralStatus(ref.id, 'paid')}
                                className="p-1.5 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Mark as Paid"
                              >
                                <DollarSign size={16} />
                              </button>
                              <button
                                onClick={() => handleUpdateReferralStatus(ref.id, 'cancelled')}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Cancel Referral"
                              >
                                <XCircle size={16} />
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
      )}
    </div>
  );
}

