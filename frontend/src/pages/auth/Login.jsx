import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { ShieldCheck, User as UserIcon, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'security') navigate('/security');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
    // On success, the useEffect above will redirect
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Left side illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-navy-900 to-teal-900 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Welcome Back!</h1>
          <p className="text-teal-100 text-lg max-w-md">
            Securely access the FoundIt platform to report items or verify ownership.
          </p>
        </motion.div>

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute top-20 right-20 w-32 h-32 bg-teal-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 7 }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-sky-500/20 rounded-full blur-xl"
        />
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 border-transparent shadow-2xl dark:shadow-navy-900/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-navy-900 dark:text-white">Sign In</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Select your role to continue</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8">
              {[
                { id: 'student', label: 'Student', icon: <UserIcon size={16} /> },
                { id: 'security', label: 'Security', icon: <Shield size={16} /> },
                { id: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    role === r.id
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-navy-900 dark:text-white'
                      : 'text-slate-500 hover:text-navy-900 dark:hover:text-white'
                  }`}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your campus email"
                required
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-sm text-teal-600 dark:text-teal-400 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                Register as Student
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
