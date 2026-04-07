import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  FileText, Upload, Download, Eye, AlertCircle,
  CheckCircle2, Clock, Filter, Loader2, X, Trash2, ChevronDown
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

interface DocRow {
  id: string;
  name: string;
  category: string;
  uploadDate: Date;
  size: string;
  status: string;
  version: string;
  clarification?: string;
  filePath?: string;
}

const CATEGORIES = [
  'Laporan Keuangan Audited',
  'Laporan Tahunan dan Keberlanjutan Tahun Sebelumnya',
  'Laporan Operasional',
  'Database ESG dan Metrik Lingkungan',
  'Notulen Rapat Direksi',
  'Laporan Audit Internal',
  'Lainnya',
];

const mapDoc = (d: any): DocRow => ({
  id: String(d.id),
  name: d.document_name ?? '',
  category: d.category ?? '',
  uploadDate: d.upload_date ? new Date(d.upload_date) : new Date(),
  size: d.file_size
    ? d.file_size > 1024 * 1024
      ? `${(d.file_size / 1024 / 1024).toFixed(1)} MB`
      : `${(d.file_size / 1024).toFixed(0)} KB`
    : '—',
  status: d.status ?? 'Received',
  version: d.version ?? 'v1',
  clarification: d.clarification ?? '',
  filePath: d.file_path ?? '',
});

export const DocumentVault = () => {
  const { addToast, project } = useAppContext();
  const projectId = project?.id ?? '';

  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DocRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Upload form
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[0]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('upload_date', { ascending: false });

    if (!error && data && data.length > 0) {
      setDocs(data.map(mapDoc));
    } else {
      setDocs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (projectId) fetchDocs();
  }, [projectId]);

  const categories = ['All', ...Array.from(new Set([...CATEGORIES, ...docs.map(d => d.category)]))];
  const filteredDocs = selectedCategory === 'All'
    ? docs
    : docs.filter(d => d.category === selectedCategory);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) { setUploadError('Nama dokumen wajib diisi.'); return; }
    if (!uploadFile) { setUploadError('Pilih file terlebih dahulu.'); return; }

    setUploading(true);
    setUploadError('');

    try {
      const ext = uploadFile.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}_${uploadName.trim().replace(/\s+/g, '_')}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('Portal Client')
        .upload(fileName, uploadFile, { upsert: false });

      if (storageError) throw storageError;

      const sizeStr = uploadFile.size > 1024 * 1024
        ? `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB`
        : `${(uploadFile.size / 1024).toFixed(0)} KB`;

      const { error: dbError } = await supabase.from('documents').insert([{
        project_id: projectId,
        document_name: `${uploadName.trim()}.${ext}`,
        category: uploadCategory,
        file_path: fileName,
        file_name: uploadFile.name,
        file_size: uploadFile.size,
        file_type: uploadFile.type,
        status: 'Received',
        version: 'v1',
        upload_date: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;

      addToast('Dokumen berhasil diunggah!', 'success');
      setIsUploadOpen(false);
      setUploadName('');
      setUploadFile(null);
      setUploadCategory(CATEGORIES[0]);
      await fetchDocs();

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message ?? 'Gagal mengunggah dokumen.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      if (deleteConfirm.filePath) {
        await supabase.storage.from('Portal Client').remove([deleteConfirm.filePath]);
      }
      const { error } = await supabase.from('documents').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      addToast('Dokumen berhasil dihapus.', 'success');
      setDeleteConfirm(null);
      await fetchDocs();
    } catch (err: any) {
      addToast(err.message ?? 'Gagal menghapus dokumen.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (doc: DocRow) => {
    if (!doc.filePath) { addToast('File tidak tersedia untuk diunduh.', 'error'); return; }
    const { data, error } = await supabase.storage.from('Portal Client').createSignedUrl(doc.filePath, 60);
    if (error || !data) { addToast('Gagal membuat link unduhan.', 'error'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Received': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Received</Badge>;
      case 'Under Review': return <Badge variant="warning"><Eye className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case 'Verified': return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'Needs Clarification': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Needs Clarification</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const CategorySidebar = () => (
    <div className="flex flex-col">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => { setSelectedCategory(cat); setSidebarOpen(false); }}
          className={`text-left px-4 py-2.5 text-sm transition-colors border-l-2 ${
            selectedCategory === cat
              ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-600'
              : 'text-slate-600 hover:bg-slate-50 border-transparent'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Vault</h1>
          <p className="text-slate-500 mt-1">Secure repository for all source documents.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" /> Upload
        </Button>
      </div>

      {/* Mobile: category dropdown */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {selectedCategory}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
        {sidebarOpen && (
          <div className="mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
            <CategorySidebar />
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CategorySidebar />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {filteredDocs.some(d => d.status === 'Needs Clarification') && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Action Required</h3>
                  <p className="text-sm text-red-600 mt-1">Beberapa dokumen memerlukan klarifikasi sebelum verifikasi dapat dilanjutkan.</p>
                </div>
              </div>
            </div>
          )}

          <Card>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                <span className="text-sm text-slate-500">Memuat dokumen...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada dokumen.</p>
                <p className="text-sm mt-1">Klik "Upload" untuk mengunggah.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Dokumen</TableHead>
                      <TableHead className="hidden md:table-cell">Kategori</TableHead>
                      <TableHead className="hidden sm:table-cell">Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map(doc => (
                      <React.Fragment key={doc.id}>
                        <TableRow className={doc.status === 'Needs Clarification' ? 'bg-red-50/30' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-slate-400 shrink-0 hidden sm:block" />
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate max-w-[160px] sm:max-w-none">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.size} · {doc.version}</p>
                                <p className="text-xs text-slate-400 md:hidden mt-0.5">{doc.category}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-slate-600">{doc.category}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-slate-600">
                            {format(doc.uploadDate, 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {doc.filePath && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDownload(doc)} title="Download">
                                  <Download className="w-4 h-4 text-slate-500" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => setDeleteConfirm(doc)} title="Hapus">
                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {doc.status === 'Needs Clarification' && doc.clarification && (
                          <TableRow className="bg-red-50/30 border-t-0">
                            <TableCell colSpan={5} className="pt-0 pb-4 pl-4 sm:pl-14">
                              <div className="bg-white border border-red-100 rounded-lg p-4 shadow-sm">
                                <p className="text-sm font-medium text-red-800 mb-2">Catatan dari Bilmare:</p>
                                <p className="text-sm text-slate-700 mb-4">{doc.clarification}</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ketik respons atau klarifikasi Anda..."
                                    className="flex-1 text-sm border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                                  />
                                  <Button size="sm">Kirim</Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hapus Dokumen</h2>
                <p className="text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm font-medium text-slate-700">{deleteConfirm.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{deleteConfirm.category} · {deleteConfirm.size}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Batal</Button>
              <Button onClick={handleDelete} disabled={deleting} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsUploadOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Upload Dokumen</h2>
              <button onClick={() => setIsUploadOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Dokumen</label>
                <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Dokumen *</label>
                <input type="text" value={uploadName} onChange={e => setUploadName(e.target.value)}
                  placeholder="cth: Data Emisi GRK 2024 Final"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File *</label>
                <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.doc,.pptx,.csv"
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">{uploadFile.name}</span>
                      <span className="text-xs text-slate-400">({(uploadFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Klik untuk pilih file</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, Excel, Word, PowerPoint, CSV — maks 50MB</p>
                    </>
                  )}
                </div>
              </div>
              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{uploadError}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Batal</Button>
                <Button type="submit" disabled={uploading} className="gap-2">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? 'Mengunggah...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
