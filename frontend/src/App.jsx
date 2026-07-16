import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SecurityDashboard from './pages/dashboard/SecurityDashboard';

import ReportLostItem from './pages/items/ReportLostItem';
import ReportFoundItem from './pages/items/ReportFoundItem';
import SearchPage from './pages/items/SearchPage';
import ItemDetail from './pages/items/ItemDetail';

import Profile from './pages/Profile';
import NotificationCenter from './pages/NotificationCenter';
import ClaimForm from './pages/claims/ClaimForm';

// ProtectedRoute wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dashboardMap = {
      admin: '/admin',
      security: '/security',
      student: '/dashboard',
    };
    return <Navigate to={dashboardMap[user?.role] || '/dashboard'} replace />;
  }

  return children;
}

function App() {
  const location = useLocation();

  // Pages where we hide the Navbar/Footer (auth pages)
  const hideLayout = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/items/:id" element={<ItemDetail />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute allowedRoles={['security']}>
                  <SecurityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute>
                  <ReportLostItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-found"
              element={
                <ProtectedRoute>
                  <ReportFoundItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims/new/:itemId"
              element={
                <ProtectedRoute>
                  <ClaimForm />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
