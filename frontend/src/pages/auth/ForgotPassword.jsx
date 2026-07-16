import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../utils/api';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // In dev mode, this just logs to console on the backend
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset email sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 p-4">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl dark:shadow-navy-900/50">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400">
              <KeyRound size={32} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Forgot Password?</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {message ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl text-center border border-emerald-100 dark:border-emerald-800/30"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-emerald-800 dark:text-emerald-300 font-medium mb-2">Check your email</h3>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-6">
                {message}
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">Return to Login</Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800/50">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Send Reset Link
              </Button>

              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </motion.div>

    </div>
  );
}
