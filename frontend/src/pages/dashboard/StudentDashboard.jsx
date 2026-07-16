import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { FileSearch, Search, User, Bell, PackageX, PackageCheck, Zap } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    matches: 0,
    unreadNotifications: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [lostRes, foundRes, notifRes] = await Promise.all([
          api.get('/items/lost?mine=true'),
          api.get('/items/found?mine=true'),
          api.get('/notifications')
        ]);

        const lostItems = lostRes.data.items || lostRes.data;
        const foundItems = foundRes.data.items || foundRes.data;
        const notifications = notifRes.data;

        const unread = notifications.filter(n => !n.isRead).length;

        // Combine and sort recent items
        const allItems = [
          ...lostItems.map(i => ({ ...i, type: 'lost' })),
          ...foundItems.map(i => ({ ...i, type: 'found' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        setStats({
          lost: lostItems.length,
          found: foundItems.length,
          matches: notifications.filter(n => n.type === 'match').length,
          unreadNotifications: unread
        });
        
        setRecentItems(allItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
          {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Here is an overview of your activity on Lost and Found System.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <Card className="p-6 flex items-center">
            <div className="p-4 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mr-4">
              <PackageX size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Lost Items</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{stats.lost}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 flex items-center">
            <div className="p-4 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mr-4">
              <PackageCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Found Items</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{stats.found}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 flex items-center">
            <div className="p-4 rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 mr-4">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Smart Matches</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{stats.matches}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 flex items-center">
            <div className="p-4 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 mr-4">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Unread Notifications</p>
              <h3 className="text-2xl font-bold text-navy-900 dark:text-white">{stats.unreadNotifications}</h3>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Quick Actions</h2>
          <Card className="p-4 space-y-3">
            <Link to="/report-lost" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="p-2 bg-navy-50 text-navy-600 dark:bg-navy-900/30 dark:text-navy-400 rounded-lg mr-3">
                  <FileSearch size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-navy-900 dark:text-white">Report Lost Item</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">I lost something on campus</p>
                </div>
              </div>
            </Link>
            
            <Link to="/report-found" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="p-2 bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg mr-3">
                  <PackageCheck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-navy-900 dark:text-white">Report Found Item</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">I found someone's belonging</p>
                </div>
              </div>
            </Link>

            <Link to="/search" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="p-2 bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-lg mr-3">
                  <Search size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-navy-900 dark:text-white">Search Items</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Browse all reported items</p>
                </div>
              </div>
            </Link>

            <Link to="/profile" className="block">
              <div className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div className="p-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg mr-3">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-navy-900 dark:text-white">My Profile</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View history and settings</p>
                </div>
              </div>
            </Link>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-navy-900 dark:text-white">Recent Activity</h2>
            <Link to="/profile" className="text-sm text-teal-600 dark:text-teal-400 hover:underline">
              View All
            </Link>
          </div>
          
          <Card className="overflow-hidden">
            {recentItems.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentItems.map((item) => (
                  <div key={item._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-10 rounded-full mr-4 ${item.type === 'lost' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                      <div>
                        <h4 className="font-medium text-navy-900 dark:text-white">{item.name}</h4>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <span className="capitalize">{item.type} Item</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={
                          item.status === 'Active' ? 'info' : 
                          item.status === 'Claimed' ? 'success' : 
                          item.status === 'Verification Pending' ? 'warning' : 'neutral'
                        }
                      >
                        {item.status}
                      </Badge>
                      <Link to={`/items/${item._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <PackageX size={24} />
                </div>
                <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-1">No recent activity</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't reported any items yet.</p>
                <Link to="/report-lost">
                  <Button variant="outline" size="sm">Report a Lost Item</Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
