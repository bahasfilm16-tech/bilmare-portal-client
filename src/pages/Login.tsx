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
      window.location.href = 'https://portal-tim.vercel.app';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Bilmare</h1>
          <p className="text-[13px] text-slate-400 mt-1 tracking-widest uppercase font-medium">Client Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm shadow-black/[0.08] border border-black/[0.06] p-8">
          <p className="text-[15px] font-medium text-slate-700 mb-6 text-center">Masuk ke akun Anda</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@perusahaan.com"
                className="w-full bg-black/[0.04] border border-transparent rounded-xl px-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/[0.04] border border-transparent rounded-xl px-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 active:bg-slate-800 text-white font-medium py-2.5 rounded-xl text-[14px] transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">&copy; 2025 Bilmare. All rights reserved.</p>
      </div>
    </div>
  );
}