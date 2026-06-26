import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Login = () => {
  const { login, user } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check if redirecting from token expiration
  useEffect(() => {
    if (searchParams.get('expired')) {
      setErrorMsg('Your session has expired. Please sign in again.');
      addToast('Session Expired', 'Please sign in again to continue.', 'warning');
    }
  }, [searchParams, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      await login(email, password, rememberMe);
      addToast('Success', 'Logged in successfully.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Verify credentials.');
      addToast('Error', err.message || 'Failed to authenticate.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080512] flex items-center justify-center p-4 relative font-sans">
      
      {/* Background blobs */}
      <div className="aurora-bg">
        <div className="absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-brand-500/10 rounded-full aurora-blob animate-aurora" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full aurora-blob animate-aurora" style={{ animationDelay: '-6s' }} />
      </div>

      <div className="w-full max-w-md glass-panel p-8 border border-white/20 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
            N
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Access your workspaces and plan projects.</p>
          </div>
        </div>

        {/* Error Message banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-300 text-xs flex items-center gap-2.5 animate-pulse-slow">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                required
                type="email"
                placeholder="name@company.com"
                className="glass-input pl-10 text-sm w-full bg-slate-900/30 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PASSWORD</label>
              <button
                type="button"
                onClick={() => {
                  alert('Verification OTP link: Register a new account to test password controls immediately, or use dev@nexora.com / password123!');
                }}
                className="text-[10px] text-brand-400 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="glass-input pl-10 pr-10 text-sm w-full bg-slate-900/30 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-brand-500 border-slate-700 bg-slate-900 focus:ring-brand-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-xs text-slate-400 font-medium">Remember me for 30 days</span>
            </label>
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="w-full py-3 mt-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </form>

        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/5 dark:border-slate-800/80 text-center text-xs">
          <span className="text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 font-bold hover:underline">
              Create free account
            </Link>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Demo Access: <span className="text-slate-400 font-semibold">dev@nexora.com</span> /{' '}
            <span className="text-slate-400 font-semibold">password123</span>
          </span>
        </div>

      </div>
    </div>
  );
};
