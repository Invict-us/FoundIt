import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, MapPin, Calendar, Clock, Tag, User, Phone,
  Mail, ArrowLeft, Shield, CheckCircle2, Eye, Zap,
  AlertTriangle, Loader2, HandMetal, HeartPulse
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const statusVariantMap = {
  Active: 'info',
  'Verification Pending': 'warning',
  Claimed: 'success',
  Archived: 'neutral',
  Rejected: 'danger'
};

const STATUS_STEPS = [
  { key: 'reported', label: 'Reported Lost', icon: AlertTriangle },
  { key: 'matched', label: 'Potential Match Found', icon: Zap },
  { key: 'verification', label: 'Verification Submitted', icon: Shield },
  { key: 'approved', label: 'Claim Approved', icon: CheckCircle2 },
  { key: 'recovered', label: 'Item Recovered', icon: Package }
];

function getActiveStep(status) {
  switch (status) {
    case 'Active': return 0;
    case 'Matched': return 1;
    case 'Verification Pending': return 2;
    case 'Claimed': return 4;
    case 'Archived': return 4;
    default: return 0;
  }
}

function getPriority(category) {
  if (!category) return null;
  const lower = category.toLowerCase();
  if (['id cards', 'wallets', 'keys', 'phone'].includes(lower)) return { level: 'High Priority', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: <HeartPulse className="w-3 h-3" /> };
  if (['electronics', 'laptop', 'calculator'].includes(lower)) return { level: 'Medium Priority', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', icon: <AlertTriangle className="w-3 h-3" /> };
  return { level: 'Low Priority', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> };
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/items/${id}`);
        setItem(res.data?.item || res.data);
      } catch (err) {
        setError('Item not found or failed to load.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const isOwner = item && user && (item.user === user._id || item.user?._id === user._id || item.userId === user._id);
  const activeStep = item ? getActiveStep(item.status) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading item details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Item Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'This item may have been removed.'}</p>
          <Button variant="primary" onClick={() => navigate('/search')}>Browse Items</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#1E3A5F] dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Go Back</span>
      </motion.button>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800 aspect-square lg:aspect-auto lg:h-[500px]">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Package className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">No image available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Type & Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={item.type === 'lost' ? 'danger' : 'success'}>
              {item.type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}
            </Badge>
            <Badge variant={statusVariantMap[item.status] || 'neutral'}>
              {item.status || 'Active'}
            </Badge>
            {getPriority(item.category) && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriority(item.category).color}`}>
                {getPriority(item.category).icon}
                {getPriority(item.category).level}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A5F] dark:text-white leading-tight">
            {item.name}
          </h1>

          {/* Category */}
          {item.category && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#14B8A6]" />
              <span className="text-sm font-semibold text-[#14B8A6]">{item.category}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.description || 'No description provided.'}
            </p>
          </div>

          {/* Details Grid */}
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Location</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.building || 'Unknown'}{item.room ? `, ${item.room}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Date {item.type === 'lost' ? 'Lost' : 'Found'}
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(item.dateLost || item.dateFound || item.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Reported</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {(item.contactEmail || item.finderEmail) && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Contact</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {item.contactEmail || item.finderEmail}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isOwner && item.status === 'Active' && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/claims/new/${item._id}`)}
                className="flex-1"
              >
                <HandMetal className="w-5 h-5 mr-2" />
                Claim This Item
              </Button>
            )}
            {isOwner && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  ✨ This is your item. You'll be notified when someone makes a claim.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Status Timeline */}
      <motion.div variants={itemVariants} className="mt-10">
        <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-white mb-6">Status Timeline</h2>
        <Card>
          <div className="flex items-center justify-between relative px-4">
            {/* Connection Line */}
            <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
            <div
              className="absolute top-6 left-[10%] h-0.5 bg-gradient-to-r from-[#14B8A6] to-[#4A90E2] z-0 transition-all duration-1000"
              style={{ width: `${(activeStep / (STATUS_STEPS.length - 1)) * 80}%` }}
            />

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.15, type: 'spring', stiffness: 200 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-[#14B8A6] to-[#4A90E2] border-[#14B8A6] shadow-lg shadow-teal-500/30'
                        : isCompleted
                        ? 'bg-[#14B8A6] border-[#14B8A6]'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <step.icon
                      className={`w-5 h-5 ${
                        isCompleted || isCurrent ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  </motion.div>
                  <p
                    className={`mt-2 text-xs font-semibold text-center ${
                      isCurrent
                        ? 'text-[#14B8A6]'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
