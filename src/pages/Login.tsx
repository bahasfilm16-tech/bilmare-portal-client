import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', data.user.email)
      .single();

    if (profile?.role === 'admin' || profile?.role === 'staff') {
      window.location.href = import.meta.env.VITE_PORTAL_TIM_URL ?? 'https://portal-tim.vercel.app';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] dark:bg-[#0D0D12] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25">
            <span className="text-white text-base font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bilmare</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1 tracking-widest uppercase font-medium">Client Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#16161F] rounded-2xl shadow-sm shadow-slate-200/80 dark:shadow-none border border-slate-200/70 dark:border-white/[0.06] p-7">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-5 text-center">Masuk ke akun Anda</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px] px-3.5 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@perusahaan.com"
                className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:bg-white dark:focus:bg-white/[0.07] focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:bg-white dark:focus:bg-white/[0.07] focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 transition-all"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-xl text-[13px] transition-colors disabled:opacity-50 shadow-sm shadow-indigo-500/20 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Memverifikasi...
                </span>
              ) : 'Masuk'}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-700 mt-6">&copy; 2025 Bilmare. All rights reserved.</p>
      </div>
    </div>
  );
}
