import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Heart, User } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'donor') {
        navigate('/donor/dashboard');
      } else {
        navigate('/requests');
      }
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  // 1-Click Demo Login Quickfill
  const fillDemoAccount = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsSubmitting(true);
    const res = await login(demoEmail, 'Password123!');
    setIsSubmitting(false);

    if (res.success) {
      if (demoRole === 'admin') navigate('/admin');
      else if (demoRole === 'donor') navigate('/donor/dashboard');
      else navigate('/requests');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blood-600/20 border border-blood-500/50 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blood-600/30">
            <Droplet className="w-7 h-7 text-blood-500 fill-blood-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to LifeLink</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your donor dashboard, coordinate emergency requests, or manage platform operations.
          </p>
        </div>

        {/* Development / Testing Sandbox Credentials (Clearly Separated from Production) */}
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/15">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Development & Evaluation Sandbox Only
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 font-mono">
              TEST ACCOUNTS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-snug">
            For local evaluation only. Production users authenticate below using real credentials verified against the live MongoDB database.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('sarah.oneg@donor.lifelink.org', 'donor')}
              className="py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blood-500 transition-all text-center flex flex-col items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 text-blood-500" />
              <span>O- Donor</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('elena.requester@lifelink.org', 'requester')}
              className="py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500 transition-all text-center flex flex-col items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Requester</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@lifelink.org', 'admin')}
              className="py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500 transition-all text-center flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-blood-950/80 border border-blood-600/50 flex items-start gap-2.5 text-xs text-blood-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-blood-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blood-500 focus:ring-1 focus:ring-blood-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white shadow-lg shadow-blood-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blood-400 hover:text-blood-300 font-bold">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
