import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Download, FileText, CheckCircle2, Clock,
  AlertCircle, Loader2, RefreshCw, Upload, X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface Deliverable {
  id: string;
  name: string;
  description: string;
  status: string;
  dateAvailable: Date | null;
  progress: number;
  filePath: string | null;
}

const mapDeliverable = (d: any): Deliverable => ({
  id: d.id,
  name: d.name ?? '',
  description: d.description ?? '',
  status: d.status ?? 'Pending',
  dateAvailable: d.date_available ? new Date(d.date_available) : null,
  progress: d.progress ?? 0,
  filePath: d.file_path ?? null,
});

export const Deliverables = () => {
  const { project, addToast } = useAppContext();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ready' | 'progress'>('ready');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDeliverables = async () => {
    if (!project?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', project.id)
      .order('status', { ascending: true });
    if (!error && data) setDeliverables(data.map(mapDeliverable));
    setLoading(false);
  };

  useEffect(() => { fetchDeliverables(); }, [project?.id]);

  const readyDeliverables = deliverables.filter(d => d.status === 'Ready for Download');
  const inProgressDeliverables = deliverables.filter(d => d.status !== 'Ready for Download');
  const displayed = activeTab === 'ready' ? readyDeliverables : inProgressDeliverables;
  const totalAll = deliverables.length;
  const avgProgress = totalAll > 0 ? Math.round(deliverables.reduce((sum, d) => sum + d.progress, 0) / totalAll) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ready for Download': return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Ready</Badge>;
      case 'In Preparation': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> In Preparation</Badge>;
      case 'Pending': return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-indigo-500';
    if (progress >= 30) return 'bg-amber-500';
    return 'bg-red-400';
  };

  const handleDownload = async (deliverable: Deliverable) => {
    if (!deliverable.filePath) { addToast('File belum tersedia untuk diunduh.', 'error'); return; }
    setDownloading(deliverable.id);
    try {
      const { data, error } = await supabase.storage.from('Portal Client').createSignedUrl(deliverable.filePath, 120);
      if (error || !data) throw error ?? new Error('Gagal membuat link unduhan.');
      window.open(data.signedUrl, '_blank');
      addToast('Download dimulai!', 'success');
    } catch (err: any) {
      addToast('Gagal mengunduh: ' + err.message, 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadingFor) return;
    setUploading(true);
    try {
      const ext = uploadFile.name.split('.').pop();
      const fileName = `deliverables/${project.id}/${uploadingFor}_${Date.now()}.${ext}`;
      const { error: storageError } = await supabase.storage.from('Portal Client').upload(fileName, uploadFile, { upsert: true });
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from('deliverables').update({ file_path: fileName, status: 'Ready for Download', progress: 100, date_available: new Date().toISOString().split('T')[0] }).eq('id', uploadingFor);
      if (dbError) throw dbError;
      addToast('File berhasil diupload!', 'success');
      setUploadingFor(null);
      setUploadFile(null);
      await fetchDeliverables();
    } catch (err: any) {
      addToast('Gagal upload: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deliverables Hub</h1>
          <p className="text-slate-500 mt-1">Track and download all project outputs.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchDeliverables}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats — 3 col on all sizes */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card><CardContent className="p-3 md:p-4 flex items-center justify-between"><div><p className="text-xs md:text-sm font-medium text-slate-500">Total</p><p className="text-xl md:text-2xl font-bold text-slate-900">{totalAll}</p></div><FileText className="w-6 h-6 md:w-8 md:h-8 text-slate-200" /></CardContent></Card>
        <Card><CardContent className="p-3 md:p-4 flex items-center justify-between"><div><p className="text-xs md:text-sm font-medium text-slate-500">Ready</p><p className="text-xl md:text-2xl font-bold text-emerald-600">{readyDeliverables.length}</p></div><CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-100" /></CardContent></Card>
        <Card><CardContent className="p-3 md:p-4 flex items-center justify-between"><div><p className="text-xs md:text-sm font-medium text-slate-500">Progress</p><p className="text-xl md:text-2xl font-bold text-indigo-600">{avgProgress}%</p></div><Clock className="w-6 h-6 md:w-8 md:h-8 text-indigo-100" /></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {([['ready', `Ready for Download (${readyDeliverables.length})`], ['progress', `In Progress (${inProgressDeliverables.length})`]] as const).map(([tab, label]) => (
          <button key={tab}
            className={`pb-3 px-2 sm:px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab(tab)}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
          <span className="text-sm text-slate-500">Memuat deliverables...</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Tidak ada deliverable di tab ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(deliverable => (
            <Card key={deliverable.id} className={`hover:shadow-md transition-shadow ${deliverable.status === 'Ready for Download' && deliverable.filePath ? 'border-emerald-100' : ''}`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${deliverable.status === 'Ready for Download' && deliverable.filePath ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                      <FileText className={`w-5 h-5 md:w-6 md:h-6 ${deliverable.status === 'Ready for Download' && deliverable.filePath ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate">{deliverable.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{deliverable.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {getStatusBadge(deliverable.status)}
                        {deliverable.dateAvailable && (
                          <span className="text-xs text-slate-400">Tersedia: {format(deliverable.dateAvailable, 'dd MMM yyyy')}</span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span className="font-medium">{deliverable.progress}%</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${getProgressColor(deliverable.progress)}`} style={{ width: `${deliverable.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 sm:self-center">
                    {deliverable.status === 'Ready for Download' && deliverable.filePath ? (
                      <Button onClick={() => handleDownload(deliverable)} size="sm" className="gap-2 w-full sm:w-auto" disabled={downloading === deliverable.id}>
                        {downloading === deliverable.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {downloading === deliverable.id ? 'Loading...' : 'Download'}
                      </Button>
                    ) : deliverable.status === 'Ready for Download' && !deliverable.filePath ? (
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 block text-center">⏳ Menunggu file dari tim Bilmare</span>
                    ) : (
                      <span className="text-xs text-slate-400 italic block text-center">Belum siap</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setUploadingFor(null); setUploadFile(null); }} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Upload File Deliverable</h2>
              <button onClick={() => { setUploadingFor(null); setUploadFile(null); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">{deliverables.find(d => d.id === uploadingFor)?.name}</p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /><span className="text-sm font-medium text-slate-700">{uploadFile.name}</span></div>
                ) : (
                  <><Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-600">Klik untuk pilih file</p><p className="text-xs text-slate-400 mt-1">PDF, Excel, Word — maks 50MB</p></>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setUploadingFor(null); setUploadFile(null); }}>Batal</Button>
                <Button onClick={handleUpload} disabled={!uploadFile || uploading} className="gap-2">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? 'Mengupload...' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
