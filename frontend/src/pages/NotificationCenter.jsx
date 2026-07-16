import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Bell, BellOff, Zap, ShieldCheck, Info, CheckCircle, Check } from 'lucide-react';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match':
        return <Zap size={20} className="text-teal-500" />;
      case 'claim':
      case 'claim_approved':
      case 'claim_rejected':
        return <ShieldCheck size={20} className="text-sky-500" />;
      case 'status':
        return <Info size={20} className="text-amber-500" />;
      default:
        return <Bell size={20} className="text-slate-400" />;
    }
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white flex items-center gap-3">
            <Bell size={28} className="text-teal-500" />
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check size={16} className="mr-2" />
            Mark All Read
          </Button>
        )}
      </motion.div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <Card className="p-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <BellOff className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">
            No notifications yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You'll be notified here when there's a match for your lost item, or when your claim status changes.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                variants={itemVariants}
                layout
              >
                <Card
                  className={`p-5 cursor-pointer transition-all duration-200 border-l-4 ${
                    notification.isRead
                      ? 'border-l-transparent opacity-70 hover:opacity-100'
                      : 'border-l-teal-500 bg-teal-50/30 dark:bg-teal-900/10'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        notification.isRead
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : 'bg-teal-100 dark:bg-teal-900/30'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          notification.isRead
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-navy-900 dark:text-white font-medium'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Read indicator */}
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-2 animate-pulse" />
                    )}
                    {notification.isRead && (
                      <CheckCircle size={16} className="text-slate-300 dark:text-slate-600 shrink-0 mt-1" />
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
