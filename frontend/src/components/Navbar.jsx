import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  FileSearch,
  FilePlus2,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Track scroll for background change
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Fetch unread notifications count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnread = async () => {
        try {
          const res = await api.get('/notifications');
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchUnread();
      // Optional: Polling every 60s
      const interval = setInterval(fetchUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]); // Re-fetch on navigation as well

  const navLinks = isAuthenticated
    ? [
        { to: '/search', label: 'Search', icon: FileSearch },
        { to: '/report-lost', label: 'Report Lost', icon: FilePlus2 },
        { to: '/report-found', label: 'Report Found', icon: FilePlus2 },
      ]
    : [
        { to: '/search', label: 'Search', icon: FileSearch },
      ];

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    const map = { admin: '/admin', security: '/security', student: '/dashboard' };
    return map[user.role] || '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg shadow-navy/5 border-b border-slate-200/50 dark:border-slate-700/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Lost and Found System Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-navy-800 dark:text-white tracking-tight leading-none">
                Lost and Found <span className="text-teal-500">System</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-navy-800 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(getDashboardLink())
                      ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-navy-800 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {isAuthenticated ? (
                <>
                  {/* Notification bell */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/notifications')}
                    className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white dark:border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Profile dropdown */}
                  <div className="relative hidden md:block" ref={profileRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-navy-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-navy/10 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-medium rounded-md capitalize">
                              {user?.role}
                            </span>
                          </div>
                          <div className="py-1">
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </Link>
                            <Link
                              to={getDashboardLink()}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </Link>
                          </div>
                          <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                            <button
                              onClick={logout}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-navy-800 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-lg font-bold text-navy-800 dark:text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {isAuthenticated && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-navy-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${
                      isActive(link.to)
                        ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <hr className="my-2 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <div className="mt-4 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-3 text-sm font-medium text-navy-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
