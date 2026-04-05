import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, Save, Loader2, User, X, Check } from 'lucide-react';
import { supabase } from '../supabase';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// Helper: crop gambar jadi blob
const getCroppedImg = (imageSrc: string, croppedAreaPixels: any): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Canvas toBlob failed');
      }, 'image/jpeg', 0.9);
    };
    image.onerror = reject;
  });
};

export const Profile = () => {
  const { user, addToast, updateUserProfile } = useAppContext();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran foto maksimal 5MB.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    setUploading(true);
    setShowCropper(false);

    try {
      const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      const fileName = `${user.email?.replace(/[@.]/g, '_')}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(urlData.publicUrl);
      setRawImageSrc(null);
      addToast('Foto berhasil diunggah! Klik Simpan untuk menyimpan.', 'success');
    } catch (err: any) {
      addToast('Gagal mengunggah foto: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageSrc(null);
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
      // Update AppContext supaya header & sidebar langsung ikut berubah
      updateUserProfile(displayName.trim(), avatarUrl);
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
    <>
      {/* Modal Crop */}
      {showCropper && rawImageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Crop area */}
          <div className="relative flex-1">
            <Cropper
              image={rawImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Zoom slider */}
          <div className="bg-black px-6 py-3 flex items-center gap-3">
            <span className="text-white text-xs">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
          </div>

          {/* Tombol aksi */}
          <div className="bg-black px-6 py-4 flex gap-3">
            <button
              onClick={handleCropCancel}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" /> Batal
            </button>
            <button
              onClick={handleCropConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
            >
              <Check className="w-4 h-4" /> Gunakan Foto Ini
            </button>
          </div>
        </div>
      )}

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

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                {uploading ? (
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
                    }}
                  />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-60"
                  title="Ganti foto"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
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
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, GIF — maks. 5MB</p>
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

            {/* Email */}
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
    </>
  );
};
