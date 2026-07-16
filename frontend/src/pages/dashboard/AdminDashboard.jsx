import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Users, FileSearch, CheckCircle2, AlertCircle, Trash2, ShieldCheck, Check, X } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, claimsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/claims')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setClaims(claimsRes.data.filter(c => c.status === 'Pending'));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        alert('Error deleting user: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleClaimAction = async (id, action) => {
    try {
      await api.put(`/claims/${id}/${action}`);
      // Remove from pending list
      setClaims(claims.filter(c => c._id !== id));
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      alert(`Error ${action}ing claim`);
    }
  };

  if (loading || !stats) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white flex items-center gap-3">
            Admin Dashboard <Badge variant="info">Admin</Badge>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Platform overview and management.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
          {['overview', 'users', 'claims'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-navy-50 text-navy-700 dark:bg-slate-700 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Users</p>
                  <h3 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{stats.totalUsers}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Lost Items</p>
                  <h3 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{stats.totalLost}</h3>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Found Items</p>
                  <h3 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{stats.totalFound}</h3>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileSearch size={20} /></div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Active Claims</p>
                  <h3 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{stats.activeClaims}</h3>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShieldCheck size={20} /></div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Recovery Rate</p>
                  <h3 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{stats.recoveryRate}%</h3>
                </div>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><CheckCircle2 size={20} /></div>
              </div>
            </Card>
          </div>

          {/* Charts area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Reports Timeline (Last 6 Months)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData?.timelineData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Lost Items" />
                    <Line type="monotone" dataKey="found" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Found Items" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Items by Category</h3>
              <div className="h-64 w-full flex items-center justify-center">
                {stats.chartData?.lostByCategory?.length > 0 || stats.chartData?.foundByCategory?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const map = new Map();
                        (stats.chartData?.lostByCategory || []).forEach(item => {
                          map.set(item._id, { name: item._id || 'Unknown', lost: item.count, found: 0 });
                        });
                        (stats.chartData?.foundByCategory || []).forEach(item => {
                          if (map.has(item._id)) {
                            map.get(item._id).found = item.count;
                          } else {
                            map.set(item._id, { name: item._id || 'Unknown', lost: 0, found: item.count });
                          }
                        });
                        return Array.from(map.values()).sort((a,b) => (b.lost + b.found) - (a.lost + a.found)).slice(0, 5);
                      })()}
                      margin={{ top: 5, right: 0, bottom: 5, left: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="name" type="category" width={80} stroke="#64748b" fontSize={11} tick={{fill: '#64748b'}} />
                      <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Bar dataKey="lost" fill="#ef4444" radius={[0, 4, 4, 0]} name="Lost" stackId="a" />
                      <Bar dataKey="found" fill="#10b981" radius={[0, 4, 4, 0]} name="Found" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-500">No category data available</div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Pending Claims ({claims.length})</h3>
              {claims.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500">No pending claims</div>
              ) : (
                <div className="space-y-4">
                  {claims.slice(0, 3).map(claim => (
                    <div key={claim._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-navy-900 dark:text-white text-sm">Item ID: {claim.itemId.substring(0, 8)}...</p>
                        <p className="text-xs text-slate-500">By User: {claim.claimedBy}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => handleClaimAction(claim._id, 'approve')} className="px-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none">Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => handleClaimAction(claim._id, 'reject')} className="px-2">Reject</Button>
                      </div>
                    </div>
                  ))}
                  {claims.length > 3 && (
                    <Button variant="ghost" className="w-full text-sm" onClick={() => setActiveTab('claims')}>View All Claims</Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-sm font-semibold text-navy-900 dark:text-white">Name</th>
                    <th className="p-4 text-sm font-semibold text-navy-900 dark:text-white">Email</th>
                    <th className="p-4 text-sm font-semibold text-navy-900 dark:text-white">Role</th>
                    <th className="p-4 text-sm font-semibold text-navy-900 dark:text-white">Joined</th>
                    <th className="p-4 text-sm font-semibold text-navy-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.usn}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{u.email}</td>
                      <td className="p-4 text-sm">
                        <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'security' ? 'warning' : 'info'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-sm">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u.role === 'admin'}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'claims' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="overflow-hidden">
            {claims.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No pending claims to review.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {claims.map(claim => (
                  <div key={claim._id} className="p-6 flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-navy-900 dark:text-white">Claim for Item</h3>
                          <p className="text-sm text-slate-500 mt-1">Item ID: {claim.itemId}</p>
                          <p className="text-sm text-slate-500">Claimed By: {claim.claimedBy}</p>
                        </div>
                        <Badge variant="warning">{claim.status}</Badge>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Claim Description:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{claim.description}</p>
                      </div>
                      
                      {claim.proof && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Proof Image:</p>
                          <img src={claim.proof} alt="Proof" className="w-32 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-3 min-w-[120px]">
                      <Button className="w-full justify-center bg-emerald-500 hover:bg-emerald-600 text-white border-none" onClick={() => handleClaimAction(claim._id, 'approve')}>
                        <Check size={16} className="mr-2" /> Approve
                      </Button>
                      <Button variant="danger" className="w-full justify-center" onClick={() => handleClaimAction(claim._id, 'reject')}>
                        <X size={16} className="mr-2" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

    </div>
  );
}
