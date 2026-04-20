import { useState } from 'react';
import { supabase } from '../supabase';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  onDone: () => void;
}

export default function SetPassword({ onDone }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    if (password !== confirm) { setError('Password tidak cocok.'); return; }

    setLoading(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }

    setDone(true);
    setTimeout(() => onDone(), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Bilmare</h1>
          <p className="text-[13px] text-slate-400 mt-1 tracking-widest uppercase font-medium">Client Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm shadow-black/[0.08] border border-black/[0.06] p-8">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: '#1a8f3c' }} />
              <p className="font-semibold text-slate-900">Password berhasil disimpan!</p>
              <p className="text-sm text-slate-500 mt-1">Mengalihkan ke portal...</p>
            </div>
          ) : (
            <>
              <h2 className="text-[15px] font-medium text-slate-700 mb-2 text-center">Buat Password Akun Anda</h2>
              <p className="text-[12px] text-slate-400 text-center mb-6">Password ini akan digunakan untuk login ke Bilmare Client Portal.</p>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full bg-black/[0.04] border border-transparent rounded-xl px-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all pr-10"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full bg-black/[0.04] border border-transparent rounded-xl px-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !password || !confirm}
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl text-[14px] transition-colors disabled:opacity-40 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Password'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">&copy; 2026 Bilmare. All rights reserved.</p>
      </div>
    </div>
  );
}
