import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const passwordStrength = form.password.length >= 8 ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-accent-500/20 to-primary-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card-glass bg-white/80 dark:bg-dark-800/80 p-8 rounded-3xl shadow-glass">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold gradient-text">NexCart</span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-dark-900 dark:text-white text-center mb-1">Create account</h1>
          <p className="text-dark-400 text-center text-sm mb-8">Join NexCart today</p>

          {error && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Full Name</label>
              <input type="text" className="input" placeholder="John Doe" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-1.5">
                  {['weak','medium','strong'].map((s, i) => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      (passwordStrength === 'strong') ? 'bg-green-500' :
                      (passwordStrength === 'medium' && i < 2) ? 'bg-yellow-500' :
                      (passwordStrength === 'weak' && i === 0) ? 'bg-red-500' :
                      'bg-dark-200 dark:bg-dark-700'
                    }`} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type="password" className="input pr-11" placeholder="Repeat password"
                  value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))} required />
                {form.confirm && form.confirm === form.password && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3.5 text-base gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</> : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
