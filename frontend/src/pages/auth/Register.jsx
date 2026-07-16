import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.usn || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const usnRegex = /^[A-Za-z0-9]{6,15}$/;
    if (!usnRegex.test(formData.usn)) {
      setError('USN must be 6-15 alphanumeric characters (e.g. 1XX21CS001)');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      usn: formData.usn.toUpperCase(),
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Left side illustration */}
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-tr from-teal-900 to-navy-900 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Join the Platform</h1>
          <p className="text-teal-100 text-lg max-w-md mb-8">
            Create a student account to report lost items, search for belongings, and submit claims.
          </p>

          <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <AlertCircle className="text-teal-300 shrink-0 mt-1" />
            <p className="text-sm text-teal-50">
              Only students can register here. Admin and Security accounts are provisioned by the IT department.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg py-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign up as a student</p>
          </div>

          {success && (
            <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm border border-emerald-100 dark:border-emerald-800/50">
              Registration successful! Redirecting to login...
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              <Input
                label="USN / Roll No"
                name="usn"
                value={formData.usn}
                onChange={handleChange}
                placeholder="1XX21CS001"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@campus.edu"
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-4"
              loading={loading}
            >
              Register
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
