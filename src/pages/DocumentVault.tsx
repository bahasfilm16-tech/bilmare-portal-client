/**
 * DocumentVault.tsx — Portal Client
 *
 * Adaptive per tier:
 * - Tier 1: Upload zone (draft AR/SR/LK) + Tab Laporan dari Bilmare
 * - Tier 2: Guided checklist-based intake + Tab Laporan dari Bilmare
 *
 * Bias yang dimitigasi:
 * - Format validation per checklist item
 * - Partial re-unlock untuk revisi item spesifik
 * - Checklist hanya tampil setelah diaktivasi tim
 * - Deliverable hanya tampil setelah status Released
 * - In-app banner untuk Needs Revision (tidak bergantung email)
 * - Konfirmasi replace vs add saat upload ke item yang sudah ada file
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
  FileText, Upload, Download, CheckCircle2,
  Clock, Loader2, X, ChevronDown, ChevronUp, Shield,
  AlertTriangle, Package, FolderOpen,
  Lock, Bell
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { usePermission } from '../hooks/usePermission';
import { supabase } from '../supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  item_name: string;
  category: string;
  description: string;
  accepted_formats: string;
  is_mandatory: boolean;
  is_active: boolean;
  status: 'pending' | 'uploaded' | 'needs_revision' | 'accepted';
  revision_note: string | null;
  reviewing_by: string | null;
  uploaded_files: UploadedFile[];
  sort_order: number;
  checklist_activated_at: string | null;
}

interface UploadedFile {
  file_path: string;
  file_name: string;
  size: string;
  uploaded_at: string;
  version: number;
}

interface Tier1Doc {
  id: string;
  name: string;
  category: string;
  uploadDate: Date;
  size: string;
  status: string;
  clarification?: string;
  filePath?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER1_CATEGORIES = [
  { value: 'AR',    label: 'Draft Laporan Tahunan (Annual Report)' },
  { value: 'SR',    label: 'Draft Laporan Keberlanjutan (Sustainability Report)' },
  { value: 'LK',    label: 'Laporan Keuangan Audited' },
  { value: 'OTHER', label: 'Dokumen Pendukung' },
];

const DOC_TYPE_LABEL: Record<string, string> = {
  AR:    'Draft Laporan Tahunan',
  SR:    'Draft Laporan Keberlanjutan',
  LK:    'Laporan Keuangan Audited',
  OTHER: 'Dokumen Pendukung',
};

const STATUS_CLIENT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  Active:                { label: 'Diterima',            color: '#1a8f3c', bg: 'rgba(48,209,88,0.08)',   icon: CheckCircle2 },
  Received:              { label: 'Diterima',            color: '#1a8f3c', bg: 'rgba(48,209,88,0.08)',   icon: CheckCircle2 },
  'Needs Clarification': { label: 'Perlu Klarifikasi',   color: '#ff3b30', bg: 'rgba(255,59,48,0.08)',   icon: AlertTriangle },
  Processing:            { label: 'Sedang Diverifikasi', color: '#0071e3', bg: 'rgba(0,113,227,0.08)',   icon: Clock },
};

const CHECKLIST_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:        { label: 'Belum Diupload',       color: '#86868b', bg: 'rgba(0,0,0,0.04)',        icon: Clock },
  uploaded:       { label: 'Menunggu Review Tim',  color: '#0071e3', bg: 'rgba(0,113,227,0.08)',    icon: Clock },
  needs_revision: { label: 'Perlu Revisi',         color: '#ff3b30', bg: 'rgba(255,59,48,0.08)',    icon: AlertTriangle },
  accepted:       { label: 'Diterima',             color: '#1a8f3c', bg: 'rgba(48,209,88,0.08)',    icon: CheckCircle2 },
};

const CATEGORY_COLORS: Record<string, string> = {
  Governance: '#0071e3',
  Risk:       '#ff9f0a',
  Climate:    '#30d158',
  Social:     '#bf5af2',
  Financial:  '#ff375f',
  Strategy:   '#636366',
};

const MAX_FILE_SIZE = 52428800; // 50MB

const card: React.CSSProperties = {
  background: 'white',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const formatFileSize = (bytes: number) =>
  bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

// ─── Component ────────────────────────────────────────────────────────────────

export const DocumentVault = () => {
  const { addToast, project, deliverables, logActivity } = useAppContext();
  const { can } = usePermission();
  const projectId = project?.id ?? '';
  const tier       = project?.tier ?? 'Tier 1';
  const isT2       = tier?.toLowerCase().includes('2');

  const [activeTab, setActiveTab] = useState<'dokumen' | 'laporan'>('dokumen');

  // ── Tier 1 state ──
  const [tier1Docs,       setTier1Docs]       = useState<Tier1Doc[]>([]);
  const [t1Loading,       setT1Loading]       = useState(true);
  const [t1CatFilter,     setT1CatFilter]     = useState('All');
  const [isT1UploadOpen,  setIsT1UploadOpen]  = useState(false);
  const [t1Name,          setT1Name]          = useState('');
  const [t1Cat,           setT1Cat]           = useState(TIER1_CATEGORIES[0].value);
  const [t1File,          setT1File]          = useState<File | null>(null);
  const [t1Uploading,     setT1Uploading]     = useState(false);
  const [t1UploadErr,     setT1UploadErr]     = useState('');
  const [t1Note,          setT1Note]          = useState('');
  const t1FileRef = useRef<HTMLInputElement>(null);

  // ── Tier 2 state ──
  const [checklist,           setChecklist]           = useState<ChecklistItem[]>([]);
  const [t2Loading,           setT2Loading]           = useState(true);
  const [dcStatus,            setDcStatus]            = useState('not_started');
  const [expandedCat,         setExpandedCat]         = useState<string | null>(null);
  const [uploadingId,         setUploadingId]         = useState<string | null>(null);
  const [uploadErr2,          setUploadErr2]          = useState('');
  const [confirmingComplete,  setConfirmingComplete]  = useState(false);
  const [replaceConfirm,      setReplaceConfirm]      = useState<{ itemId: string; file: File } | null>(null);
  const t2FileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchTier1Docs = useCallback(async () => {
    if (!projectId || isT2) return;
    setT1Loading(true);
    const { data } = await supabase
      .from('documents').select('*')
      .eq('project_id', projectId)
      .order('upload_date', { ascending: false });
    setTier1Docs((data ?? []).map((d: any) => ({
      id:            String(d.id),
      name:          d.document_name ?? '',
      category:      DOC_TYPE_LABEL[d.doc_type ?? ''] ?? 'Dokumen Pendukung',
      uploadDate:    d.upload_date ? new Date(d.upload_date) : new Date(),
      size:          d.file_size ? formatFileSize(d.file_size) : '—',
      status:        d.status ?? 'Received',
      clarification: d.clarification ?? '',
      filePath:      d.file_path ?? '',
    })));
    setT1Loading(false);
  }, [projectId, isT2]);

  const fetchChecklist = useCallback(async () => {
    if (!projectId || !isT2) return;
    setT2Loading(true);
    const { data: proj } = await supabase
      .from('projects').select('data_collection_status').eq('id', projectId).single();
    if (proj) setDcStatus(proj.data_collection_status ?? 'not_started');

    const { data } = await supabase
      .from('data_collection_checklist').select('*')
      .eq('project_id', projectId).eq('is_active', true)
      .order('sort_order', { ascending: true });
    setChecklist((data ?? []).map((d: any) => ({ ...d, uploaded_files: d.uploaded_files ?? [] })));
    setT2Loading(false);
  }, [projectId, isT2]);

  useEffect(() => {
    if (isT2) fetchChecklist(); else fetchTier1Docs();
  }, [projectId, isT2, fetchChecklist, fetchTier1Docs]);

  // ─── Tier 1: Upload ───────────────────────────────────────────────────────

  const handleTier1Upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!t1Name.trim()) { setT1UploadErr('Nama dokumen wajib diisi.'); return; }
    if (!t1File)         { setT1UploadErr('Pilih file terlebih dahulu.'); return; }
    if (t1File.size > MAX_FILE_SIZE) { setT1UploadErr('Ukuran file maksimal 50MB.'); return; }

    setT1Uploading(true); setT1UploadErr('');
    try {
      const ext      = t1File.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}_${t1Name.trim().replace(/\s+/g, '_')}.${ext}`;

      const { error: sErr } = await supabase.storage
        .from('Portal Client').upload(fileName, t1File, { upsert: false });
      if (sErr) throw sErr;

      const { error: dErr } = await supabase.from('documents').insert([{
        id: crypto.randomUUID(), project_id: projectId,
        document_name: `${t1Name.trim()}.${ext}`, doc_type: t1Cat,
        category: TIER1_CATEGORIES.find(c => c.value === t1Cat)?.label ?? t1Cat,
        file_path: fileName, file_name: t1File.name,
        file_size: t1File.size, file_type: t1File.type,
        status: 'Received', version: 'v1',
        upload_date: new Date().toISOString(),
        clarification: t1Note.trim() || null,
      }]);
      if (dErr) throw dErr;

      addToast('Dokumen berhasil diunggah!', 'success');
      setIsT1UploadOpen(false);
      setT1Name(''); setT1File(null); setT1Note('');
      setT1Cat(TIER1_CATEGORIES[0].value);
      await logActivity('document', `Dokumen diunggah: ${t1Name.trim()}`);
      await fetchTier1Docs();
    } catch (err: any) {
      setT1UploadErr(err.message ?? 'Gagal mengunggah dokumen.');
    } finally {
      setT1Uploading(false);
    }
  };

  // ─── Tier 2: Upload ke checklist item ────────────────────────────────────

  const handleT2FileSelect = (itemId: string, file: File) => {
    const item = checklist.find(c => c.id === itemId);
    if (!item) return;

    const ext     = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = item.accepted_formats.split(',').map(f => f.trim().toLowerCase());
    if (!allowed.includes(ext)) {
      setUploadErr2(`Format tidak diterima. Format yang diizinkan: ${item.accepted_formats.toUpperCase()}`);
      setUploadingId(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadErr2('Ukuran file maksimal 50MB.');
      setUploadingId(null);
      return;
    }
    setUploadErr2('');

    if (item.uploaded_files.length > 0) {
      setReplaceConfirm({ itemId, file });
    } else {
      doUpload(itemId, file, 'add');
    }
  };

  const doUpload = async (itemId: string, file: File, mode: 'add' | 'replace') => {
    setUploadingId(itemId);
    const item = checklist.find(c => c.id === itemId);
    if (!item) return;
    try {
      const fileName = `tier2/${projectId}/${itemId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: sErr } = await supabase.storage
        .from('Portal Client').upload(fileName, file, { upsert: false });
      if (sErr) throw sErr;

      const newFile: UploadedFile = {
        file_path:   fileName,
        file_name:   file.name,
        size:        formatFileSize(file.size),
        uploaded_at: new Date().toISOString(),
        version:     mode === 'replace' ? 1 : (item.uploaded_files.length + 1),
      };
      const newFiles = mode === 'replace' ? [newFile] : [...item.uploaded_files, newFile];

      const { error: dErr } = await supabase
        .from('data_collection_checklist')
        .update({ uploaded_files: newFiles, status: 'uploaded', updated_at: new Date().toISOString() })
        .eq('id', itemId);
      if (dErr) throw dErr;

      addToast('File berhasil diunggah!', 'success');
      await fetchChecklist();
    } catch (err: any) {
      setUploadErr2(err.message ?? 'Gagal mengunggah file.');
      addToast('Gagal mengunggah file.', 'error');
    } finally {
      setUploadingId(null);
      setReplaceConfirm(null);
    }
  };

  // ─── Tier 2: Konfirmasi selesai ───────────────────────────────────────────

  const handleClientConfirm = async () => {
    setConfirmingComplete(true);
    const { error } = await supabase.from('projects')
      .update({ data_collection_status: 'client_confirmed' }).eq('id', projectId);
    if (error) {
      addToast('Gagal mengkonfirmasi. Coba lagi.', 'error');
    } else {
      setDcStatus('client_confirmed');
      addToast('Konfirmasi berhasil! Tim Bilmare akan segera mereview dokumen Anda.', 'success');
    }
    setConfirmingComplete(false);
  };

  // ─── Download ─────────────────────────────────────────────────────────────

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('Portal Client').createSignedUrl(filePath, 3600);
    if (error || !data) { addToast('Gagal membuat link download.', 'error'); return; }
    const a = document.createElement('a');
    a.href = data.signedUrl; a.download = fileName; a.click();
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const needsRevisionItems  = checklist.filter(c => c.status === 'needs_revision');
  const mandatoryItems      = checklist.filter(c => c.is_mandatory);
  const mandatoryUploaded   = mandatoryItems.filter(c => ['uploaded', 'accepted'].includes(c.status)).length;
  const allMandatoryUploaded = mandatoryItems.every(c => ['uploaded', 'accepted'].includes(c.status));
  const isLocked            = ['locked', 'client_confirmed'].includes(dcStatus);
  const checklistActivated  = checklist.length > 0;
  const progressPct         = mandatoryItems.length > 0
    ? Math.round((mandatoryUploaded / mandatoryItems.length) * 100) : 0;

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const releasedDeliverables = (deliverables ?? [])
    .filter((d: any) => ['Released', 'Delivered'].includes(d.status));

  const t1Cats       = ['All', ...Array.from(new Set(tier1Docs.map(d => d.category)))];
  const filteredT1   = t1CatFilter === 'All'
    ? tier1Docs : tier1Docs.filter(d => d.category === t1CatFilter);

  // ─── Badge helpers ────────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CLIENT_CONFIG[status] ?? STATUS_CLIENT_CONFIG['Received'];
    const Icon = cfg.icon;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: cfg.bg, color: cfg.color }}>
        <Icon className="w-3 h-3" />{cfg.label}
      </span>
    );
  };

  const ChecklistBadge = ({ status }: { status: ChecklistItem['status'] }) => {
    const cfg = CHECKLIST_STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
        style={{ background: cfg.bg, color: cfg.color }}>
        <Icon className="w-3 h-3" />{cfg.label}
      </span>
    );
  };

  // ─── Render: Tabs ─────────────────────────────────────────────────────────

  const renderTabs = () => (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
      {([
        { key: 'dokumen', label: isT2 ? 'Data & Dokumen Sumber' : 'Dokumen Anda',  icon: FolderOpen },
        { key: 'laporan', label: 'Laporan dari Bilmare',                           icon: Package },
      ] as const).map(tab => {
        const Icon   = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center"
            style={{
              background: active ? 'white' : 'transparent',
              color:      active ? '#1d1d1f' : '#86868b',
              boxShadow:  active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.key === 'dokumen' ? 'Dokumen' : 'Laporan'}</span>
            {tab.key === 'dokumen' && needsRevisionItems.length > 0 && (
              <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: '#ff3b30', color: 'white' }}>
                {needsRevisionItems.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  // ─── Render: Tier 1 ───────────────────────────────────────────────────────

  const renderTier1 = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#1d1d1f' }}>Dokumen Anda</h2>
          <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>
            Upload draft laporan dan dokumen pendukung untuk diverifikasi tim Bilmare.
          </p>
        </div>
        {can('uploadDocument') && (
          <button onClick={() => { setIsT1UploadOpen(true); setT1UploadErr(''); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
            style={{ background: '#0071e3', color: 'white' }}>
            <Upload className="w-4 h-4" /> Upload Dokumen
          </button>
        )}
      </div>

      {t1Cats.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {t1Cats.map(cat => (
            <button key={cat} onClick={() => setT1CatFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: t1CatFilter === cat ? '#0071e3' : 'rgba(0,0,0,0.04)',
                color:      t1CatFilter === cat ? 'white'   : '#3a3a3c',
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {t1Loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#86868b' }} />
        </div>
      ) : filteredT1.length === 0 ? (
        <div style={card} className="p-12 text-center">
          <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: '#d1d1d6' }} />
          <p className="text-sm font-medium" style={{ color: '#3a3a3c' }}>Belum ada dokumen</p>
          <p className="text-xs mt-1" style={{ color: '#86868b' }}>
            Klik "Upload Dokumen" untuk mulai mengirimkan file ke tim Bilmare.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredT1.map(doc => (
            <div key={doc.id} style={card} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,113,227,0.08)' }}>
                    <FileText className="w-4 h-4" style={{ color: '#0071e3' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1d1d1f' }}>{doc.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>
                      {doc.category} · {doc.size} · {format(doc.uploadDate, 'dd MMM yyyy')}
                    </p>
                    {doc.clarification && (
                      <p className="text-xs mt-1 italic" style={{ color: '#86868b' }}>
                        Catatan: {doc.clarification}
                      </p>
                    )}
                    {doc.status === 'Needs Clarification' && (
                      <p className="text-xs mt-1 font-medium" style={{ color: '#ff3b30' }}>
                        ⚠ Tim Bilmare membutuhkan klarifikasi untuk dokumen ini.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={doc.status} />
                  {doc.filePath && (
                    <button onClick={() => handleDownload(doc.filePath!, doc.name)}
                      className="p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.04)', color: '#3a3a3c' }}>
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isT1UploadOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsT1UploadOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-lg flex flex-col sm:rounded-2xl overflow-hidden"
            style={{ borderRadius: '20px 20px 0 0', maxHeight: '90vh' }}>
            <div className="px-6 py-4 flex justify-between items-center flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1d1d1f' }}>Upload Dokumen</h2>
              <button onClick={() => setIsT1UploadOpen(false)} className="p-2 rounded-lg" style={{ color: '#86868b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {t1UploadErr && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,59,48,0.08)', color: '#ff3b30' }}>
                  {t1UploadErr}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: '#86868b' }}>Kategori Dokumen</label>
                <select value={t1Cat} onChange={e => setT1Cat(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#1d1d1f' }}>
                  {TIER1_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: '#86868b' }}>Nama Dokumen *</label>
                <input value={t1Name} onChange={e => setT1Name(e.target.value)}
                  placeholder="cth: Draft AR 2024 v2"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#1d1d1f' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: '#86868b' }}>File (maks. 50MB)</label>
                <div onClick={() => t1FileRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
                  style={{ borderColor: t1File ? 'rgba(0,113,227,0.4)' : 'rgba(0,0,0,0.1)' }}>
                  {t1File ? (
                    <p className="text-sm font-medium" style={{ color: '#0071e3' }}>{t1File.name}</p>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: '#86868b' }} />
                      <p className="text-sm" style={{ color: '#86868b' }}>Klik untuk pilih file</p>
                      <p className="text-xs mt-1" style={{ color: '#d1d1d6' }}>PDF, DOCX, XLSX, PPTX</p>
                    </>
                  )}
                </div>
                <input ref={t1FileRef} type="file" className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                  onChange={e => { if (e.target.files?.[0]) setT1File(e.target.files[0]); }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: '#86868b' }}>Catatan untuk Tim Bilmare (opsional)</label>
                <textarea value={t1Note} onChange={e => setT1Note(e.target.value)}
                  placeholder="cth: Ini draft v2, ada perubahan di bagian tata kelola hal 45-60"
                  rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#1d1d1f' }} />
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-2 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button onClick={() => setIsT1UploadOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#3a3a3c' }}>Batal</button>
              <button onClick={handleTier1Upload} disabled={t1Uploading}
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-60"
                style={{ background: '#0071e3', color: 'white' }}>
                {t1Uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t1Uploading ? 'Mengunggah...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render: Tier 2 ───────────────────────────────────────────────────────

  const renderTier2 = () => {
    if (t2Loading) return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#86868b' }} />
      </div>
    );

    if (!checklistActivated) return (
      <div style={card} className="p-12 text-center">
        <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: '#d1d1d6' }} />
        <p className="text-sm font-semibold mb-1" style={{ color: '#1d1d1f' }}>
          Tim Bilmare sedang menyiapkan daftar dokumen
        </p>
        <p className="text-sm" style={{ color: '#86868b', maxWidth: 360, margin: '0 auto' }}>
          Anda akan mendapat notifikasi saat daftar dokumen yang dibutuhkan sudah siap.
          Biasanya 1–2 hari kerja setelah kick-off proyek.
        </p>
      </div>
    );

    return (
      <div className="space-y-5">
        {/* Progress card */}
        <div style={{ ...card, border: allMandatoryUploaded ? '1px solid rgba(48,209,88,0.25)' : '1px solid rgba(0,0,0,0.06)' }}
          className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>Progress Pengumpulan Data</p>
              <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>
                {mandatoryUploaded} dari {mandatoryItems.length} dokumen wajib sudah dikirim
              </p>
            </div>
            <span className="text-lg font-bold"
              style={{ color: allMandatoryUploaded ? '#1a8f3c' : '#0071e3' }}>
              {progressPct}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: allMandatoryUploaded ? '#30d158' : '#0071e3' }} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: 'Diterima',         count: checklist.filter(c => c.status === 'accepted').length,        color: '#1a8f3c', bg: 'rgba(48,209,88,0.08)' },
              { label: 'Menunggu Review',  count: checklist.filter(c => c.status === 'uploaded').length,        color: '#0071e3', bg: 'rgba(0,113,227,0.08)' },
              { label: 'Perlu Revisi',     count: needsRevisionItems.length,                                    color: '#ff3b30', bg: 'rgba(255,59,48,0.08)' },
              { label: 'Belum Diupload',   count: checklist.filter(c => c.status === 'pending').length,         color: '#86868b', bg: 'rgba(0,0,0,0.04)' },
            ].map(s => (
              <span key={s.label} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: s.bg, color: s.color }}>
                {s.count} {s.label}
              </span>
            ))}
          </div>

          {!isLocked && allMandatoryUploaded && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs mb-2" style={{ color: '#86868b' }}>
                Semua dokumen wajib sudah dikirim. Konfirmasi ke tim Bilmare bahwa data sudah lengkap.
              </p>
              <button onClick={handleClientConfirm} disabled={confirmingComplete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: '#1d1d1f', color: 'white' }}>
                {confirmingComplete
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Mengkonfirmasi...</>
                  : <><CheckCircle2 className="w-4 h-4" />Konfirmasi Data Sudah Lengkap</>}
              </button>
            </div>
          )}
          {dcStatus === 'client_confirmed' && (
            <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Clock className="w-4 h-4" style={{ color: '#0071e3' }} />
              <p className="text-xs" style={{ color: '#0071e3' }}>
                Menunggu konfirmasi akhir dari tim Bilmare.
              </p>
            </div>
          )}
          {dcStatus === 'locked' && (
            <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Lock className="w-4 h-4" style={{ color: '#1a8f3c' }} />
              <p className="text-xs font-semibold" style={{ color: '#1a8f3c' }}>
                Data collection selesai — Tim Bilmare sedang memproses dokumen Anda.
              </p>
            </div>
          )}
        </div>

        {/* Checklist per kategori */}
        {Object.entries(groupedChecklist).map(([category, items]) => {
          const catColor  = CATEGORY_COLORS[category] ?? '#636366';
          const catDone   = items.filter(i => i.status === 'accepted').length;
          const isExp     = expandedCat === category;
          return (
            <div key={category} style={card} className="overflow-hidden">
              <button onClick={() => setExpandedCat(isExp ? null : category)}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                  <span className="text-sm font-semibold" style={{ color: '#1d1d1f' }}>{category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${catColor}18`, color: catColor }}>
                    {catDone}/{items.length} selesai
                  </span>
                </div>
                {isExp
                  ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#86868b' }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#86868b' }} />}
              </button>

              {isExp && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {items.map((item, idx) => (
                    <div key={item.id}
                      style={{ borderTop: idx > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                      className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <span className="text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ color: item.is_mandatory ? '#ff3b30' : '#86868b' }}>
                            {item.is_mandatory ? '*' : '○'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium" style={{ color: '#1d1d1f' }}>{item.item_name}</p>
                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#86868b' }}>
                              {item.description}
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#86868b' }}>
                              Format: <span className="font-semibold">{item.accepted_formats.toUpperCase()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-0.5">
                          <ChecklistBadge status={item.status} />
                        </div>
                      </div>

                      {/* Revision note */}
                      {item.status === 'needs_revision' && item.revision_note && (
                        <div className="mb-3 px-3 py-2 rounded-lg"
                          style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)' }}>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: '#ff3b30' }}>
                            Catatan dari Tim Bilmare:
                          </p>
                          <p className="text-xs" style={{ color: '#ff3b30' }}>{item.revision_note}</p>
                        </div>
                      )}

                      {/* Uploaded files */}
                      {item.uploaded_files.length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          {item.uploaded_files.map((f, fi) => (
                            <div key={fi}
                              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#86868b' }} />
                                <span className="text-xs truncate" style={{ color: '#3a3a3c' }}>{f.file_name}</span>
                                <span className="text-xs flex-shrink-0" style={{ color: '#86868b' }}>{f.size}</span>
                              </div>
                              <button onClick={() => handleDownload(f.file_path, f.file_name)}
                                className="p-1 rounded flex-shrink-0" style={{ color: '#0071e3' }}>
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button */}
                      {(!isLocked || item.status === 'needs_revision') && item.status !== 'accepted' && (
                        <div>
                          {uploadErr2 && uploadingId === item.id && (
                            <p className="text-xs mb-2" style={{ color: '#ff3b30' }}>{uploadErr2}</p>
                          )}
                          <button
                            onClick={() => {
                              setUploadingId(item.id);
                              setUploadErr2('');
                              t2FileRefs.current[item.id]?.click();
                            }}
                            disabled={uploadingId === item.id && !replaceConfirm}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-60 transition-all"
                            style={{
                              background: item.status === 'needs_revision' ? 'rgba(255,59,48,0.08)' : 'rgba(0,113,227,0.08)',
                              color:      item.status === 'needs_revision' ? '#ff3b30'              : '#0071e3',
                              border:    `1px solid ${item.status === 'needs_revision' ? 'rgba(255,59,48,0.2)' : 'rgba(0,113,227,0.2)'}`,
                            }}>
                            {uploadingId === item.id && !replaceConfirm
                              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Mengunggah...</>
                              : <><Upload className="w-3.5 h-3.5" />
                                  {item.uploaded_files.length > 0 ? 'Tambah File' : 'Upload File'}
                                </>}
                          </button>
                          <input
                            ref={el => { t2FileRefs.current[item.id] = el; }}
                            type="file" className="hidden"
                            accept={item.accepted_formats.split(',').map(f => `.${f.trim()}`).join(',')}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleT2FileSelect(item.id, file);
                              e.target.value = '';
                            }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <p className="text-xs px-1" style={{ color: '#86868b' }}>
          <span className="font-bold" style={{ color: '#ff3b30' }}>*</span> Wajib diupload sebelum konfirmasi selesai
        </p>
      </div>
    );
  };

  // ─── Render: Laporan tab ──────────────────────────────────────────────────

  const renderLaporan = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold" style={{ color: '#1d1d1f' }}>Laporan dari Bilmare</h2>
        <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>
          Dokumen final yang sudah diverifikasi dan disetujui tim Bilmare.
        </p>
      </div>
      {releasedDeliverables.length === 0 ? (
        <div style={card} className="p-12 text-center">
          <Package className="w-10 h-10 mx-auto mb-3" style={{ color: '#d1d1d6' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: '#1d1d1f' }}>Laporan sedang disiapkan</p>
          <p className="text-sm" style={{ color: '#86868b', maxWidth: 320, margin: '0 auto' }}>
            {isT2
              ? 'Laporan final akan tersedia setelah tim Bilmare menyelesaikan proses verifikasi dan penulisan.'
              : 'Laporan verifikasi akan tersedia setelah tim Bilmare menyelesaikan review dokumen Anda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {releasedDeliverables.map((d: any) => (
            <div key={d.id} style={card} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(48,209,88,0.08)' }}>
                    <Shield className="w-4 h-4" style={{ color: '#1a8f3c' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#1d1d1f' }}>{d.name}</p>
                    {d.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#86868b' }}>{d.description}</p>
                    )}
                    {d.dateAvailable && (
                      <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>
                        {format(new Date(d.dateAvailable), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(48,209,88,0.08)', color: '#1a8f3c' }}>
                    Siap Diunduh
                  </span>
                  {d.filePath && (
                    <button onClick={() => handleDownload(d.filePath, d.name)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                      style={{ background: '#0071e3', color: 'white' }}>
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Render: Replace Modal ────────────────────────────────────────────────

  const renderReplaceModal = () => {
    if (!replaceConfirm) return null;
    const item = checklist.find(c => c.id === replaceConfirm.itemId);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
        <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#1d1d1f' }}>File Sudah Ada</h3>
          <p className="text-sm mb-1" style={{ color: '#3a3a3c' }}>
            <strong>{item?.item_name}</strong> sudah punya {item?.uploaded_files.length} file.
          </p>
          <p className="text-sm mb-4" style={{ color: '#86868b' }}>
            Ganti semua file lama, atau tambahkan file baru?
          </p>
          <div className="flex gap-2">
            <button onClick={() => doUpload(replaceConfirm.itemId, replaceConfirm.file, 'replace')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,59,48,0.08)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.2)' }}>
              Ganti File Lama
            </button>
            <button onClick={() => doUpload(replaceConfirm.itemId, replaceConfirm.file, 'add')}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: '#0071e3', color: 'white' }}>
              Tambah File Baru
            </button>
          </div>
          <button onClick={() => { setReplaceConfirm(null); setUploadingId(null); }}
            className="w-full mt-2 py-2 rounded-xl text-sm" style={{ color: '#86868b' }}>
            Batal
          </button>
        </div>
      </div>
    );
  };

  // ─── Main ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight"
          style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}>
          {isT2 ? 'Data & Dokumen' : 'Document Vault'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#86868b' }}>
          {isT2
            ? 'Kirimkan data dan dokumen sumber untuk laporan keberlanjutan Anda.'
            : 'Kelola dan pantau dokumen yang Anda kirimkan ke tim Bilmare.'}
        </p>
      </div>

      {/* Needs revision banner */}
      {isT2 && needsRevisionItems.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
          <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ff3b30' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ff3b30' }}>
              {needsRevisionItems.length} dokumen perlu diupload ulang
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#ff3b30', opacity: 0.8 }}>
              Tim Bilmare menemukan masalah pada beberapa file. Lihat catatan di masing-masing item di bawah.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {activeTab === 'dokumen'
        ? (isT2 ? renderTier2() : renderTier1())
        : renderLaporan()}

      {/* Replace modal */}
      {renderReplaceModal()}
    </div>
  );
};

export default DocumentVault;
