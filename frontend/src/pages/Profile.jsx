import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Mail, Phone, CreditCard, Camera, PackageX, PackageCheck, ShieldCheck, Edit3, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('lost');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '' });
    }
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [itemsRes, claimsRes] = await Promise.all([
        api.get('/items/my-items'),
        api.get('/claims/my'),
      ]);
      setLostItems(itemsRes.data.lostItems || []);
      setFoundItems(itemsRes.data.foundItems || []);
      setClaims(claimsRes.data.data || claimsRes.data || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      if (profilePicFile) {
        data.append('profilePic', profilePicFile);
      }
      await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (updateProfile) {
        updateProfile({ ...user, name: formData.name, phone: formData.phone });
      }
      setEditing(false);
      setProfilePicFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'lost', label: 'Lost Reports', icon: <PackageX size={16} />, count: lostItems.length },
    { id: 'found', label: 'Found Reports', icon: <PackageCheck size={16} />, count: foundItems.length },
    { id: 'claims', label: 'My Claims', icon: <ShieldCheck size={16} />, count: claims.length },
  ];

  const avatarSrc = previewUrl || (user?.profilePic ? user.profilePic : null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-xl shadow-teal-500/20">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              {editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-4 max-w-md">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                      <Save size={16} className="mr-2" /> Save
                    </Button>
                    <Button variant="ghost" onClick={() => { setEditing(false); setPreviewUrl(null); setProfilePicFile(null); }}>
                      <X size={16} className="mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{user?.name}</h1>
                    <Badge variant={user?.role === 'admin' ? 'danger' : user?.role === 'security' ? 'warning' : 'info'}>
                      {user?.role}
                    </Badge>
                  </div>
                  <div className="space-y-1 mt-3 text-sm text-slate-600 dark:text-slate-400">
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <CreditCard size={16} className="text-slate-400" /> {user?.usn || 'N/A'}
                    </p>
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <Mail size={16} className="text-slate-400" /> {user?.email}
                    </p>
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <Phone size={16} className="text-slate-400" /> {user?.phone || 'Not set'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(true)}>
                    <Edit3 size={14} className="mr-2" /> Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className="ml-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your history...</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {activeTab === 'lost' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lostItems.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <PackageX className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                  <p className="text-slate-500">You haven't reported any lost items yet.</p>
                  <Link to="/report-lost"><Button variant="outline" size="sm" className="mt-4">Report Lost Item</Button></Link>
                </div>
              ) : (
                lostItems.map((item) => (
                  <motion.div key={item._id} variants={itemVariants}>
                    <Link to={`/items/${item._id}`}>
                      <Card hover className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0 overflow-hidden">
                          {item.imagePath ? (
                            <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <PackageX size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-navy-900 dark:text-white truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{item.location} • {new Date(item.dateLost || item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={item.status === 'Active' ? 'info' : item.status === 'Claimed' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'found' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foundItems.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <PackageCheck className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                  <p className="text-slate-500">You haven't reported any found items yet.</p>
                  <Link to="/report-found"><Button variant="outline" size="sm" className="mt-4">Report Found Item</Button></Link>
                </div>
              ) : (
                foundItems.map((item) => (
                  <motion.div key={item._id} variants={itemVariants}>
                    <Link to={`/items/${item._id}`}>
                      <Card hover className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0 overflow-hidden">
                          {item.imagePath ? (
                            <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <PackageCheck size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-navy-900 dark:text-white truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{item.location} • {new Date(item.dateFound || item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={item.status === 'Active' ? 'info' : item.status === 'Claimed' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="space-y-4">
              {claims.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                  <p className="text-slate-500">You haven't submitted any claims yet.</p>
                </div>
              ) : (
                claims.map((claim) => (
                  <motion.div key={claim._id} variants={itemVariants}>
                    <Card className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-navy-900 dark:text-white">
                              Claim #{claim._id.slice(-6).toUpperCase()}
                            </h4>
                            <Badge
                              variant={
                                claim.status === 'Approved' ? 'success' :
                                claim.status === 'Rejected' ? 'danger' : 'warning'
                              }
                            >
                              {claim.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{claim.description}</p>
                          <p className="text-xs text-slate-500">
                            Submitted {new Date(claim.createdAt).toLocaleDateString()} • Item Type: {claim.itemType || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
