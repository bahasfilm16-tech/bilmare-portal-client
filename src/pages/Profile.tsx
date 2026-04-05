import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, Loader2, User } from 'lucide-react';
import { supabase } from '../supabase';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Profile = () => {
  const { user, addToast } = useAppContext();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('client_users')
        .select('display_name, avatar_url')
        .eq('email', user.email)
        .single();

      if (data) {
        setDisplayName(data.display_name ?? user.name);
        setAvatarUrl(data.avatar_url ?? '');
      } else {
        setDisplayName(user.name);
      }
      setLoading(false);
    };

    if (user.email) fetchProfile();
  }, [user.email]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran foto maksimal 2MB.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar.', 'error');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.email?.replace(/[@.]/g, '_')}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(urlData.publicUrl);
      addToast('Foto berhasil diunggah!', 'success');
    } catch (err: any) {
      addToast('Gagal mengunggah foto: ' + err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('client_users')
      .update({
        display_name: displayName.trim(),
        avatar_url: avatarUrl || null,
      })
      .eq('email', user.email);

    if (error) {
      addToast('Gagal menyimpan profil: ' + error.message, 'error');
    } else {
      addToast('Profil berhasil disimpan!', 'success');
    }
    setSaving(false);
  };

  const avatarSrc = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 mt-1">Kelola informasi profil akun Anda.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Avatar upload */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 bg-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-60"
                title="Ganti foto"
              >
                {uploading
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-white" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{displayName || user.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs text-indigo-600 hover:text-indigo-700 mt-1.5 disabled:opacity-50"
              >
                {uploading ? 'Mengunggah...' : 'Ganti foto profil'}
              </button>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, GIF — maks. 2MB</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Nama Tampilan
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nama Anda"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Email read-only */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">Email tidak dapat diubah.</p>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : <><Save className="w-4 h-4" /> Simpan Perubahan</>
            }
          </button>

        </CardContent>
      </Card>
    </div>
  );
};
