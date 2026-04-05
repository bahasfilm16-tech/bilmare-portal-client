import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare, CheckCircle2, Clock,
  Send, AlertCircle, GitCompare, Loader2, X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DraftReview = () => {
  const { draftSections, draftComments, approveSection, addToast, project, user } = useAppContext();
  const [selectedReport, setSelectedReport] = useState('AR');
  const [activeSectionId, setActiveSectionId] = useState(draftSections.find(s => s.report === 'AR')?.id || '');
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [comments, setComments] = useState(draftComments);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const filteredSections = draftSections.filter(s => s.report === selectedReport);
  const activeSection = filteredSections.find(s => s.id === activeSectionId);
  const sectionComments = comments.filter(c => c.sectionId === activeSectionId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'Under Review': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case 'Needs Client Input': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Needs Input</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getReadinessBadge = (readiness: string) => {
    switch (readiness) {
      case 'High': return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="High Readiness" />;
      case 'Medium': return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Medium Readiness" />;
      case 'Low': return <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Low Readiness" />;
      default: return null;
    }
  };

  // Tambah komentar ke Supabase
  const handleAddComment = async () => {
    if (!newComment.trim() || !activeSectionId) return;
    setSendingComment(true);
    try {
      const { data, error } = await supabase
        .from('draft_comments')
        .insert([{
          section_id: activeSectionId,
          project_id: project.id,
          author: user?.name ?? 'Client',
          text: newComment.trim(),
          status: 'Open',
          timestamp: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [{
        id: data.id,
        sectionId: data.section_id,
        author: data.author,
        text: data.text,
        status: data.status,
        timestamp: new Date(data.timestamp),
      }, ...prev]);

      setNewComment('');
      addToast('Komentar berhasil ditambahkan.', 'success');
    } catch (err: any) {
      addToast('Gagal menambahkan komentar: ' + err.message, 'error');
    } finally {
      setSendingComment(false);
    }
  };

  // Resolve komentar ke Supabase
  const handleResolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('draft_comments')
        .update({ status: 'Resolved' })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.map(c => c.id === commentId ? { ...c, status: 'Resolved' } : c));
      addToast('Komentar ditandai Resolved.', 'success');
    } catch (err: any) {
      addToast('Gagal resolve komentar.', 'error');
    }
  };

  // Approve section
  const handleApprove = async (sectionId: string) => {
    setApprovingId(sectionId);
    await approveSection(sectionId);
    setApprovingId(null);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Draft Review</h1>
          <p className="text-slate-500 mt-1">Collaborative review and approval of report sections.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedReport}
            onChange={(e) => {
              setSelectedReport(e.target.value);
              setActiveSectionId(draftSections.find(s => s.report === e.target.value)?.id || '');
            }}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="AR">Laporan Tahunan 2024</option>
            <option value="SR">Laporan Keberlanjutan 2024</option>
          </select>
          <Button variant="outline" className="gap-2" onClick={() => setCompareOpen(true)}>
            <GitCompare className="w-4 h-4" /> Compare Versions
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <Card className="w-64 shrink-0 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 shrink-0">
            <CardTitle className="text-sm">Sections</CardTitle>
          </CardHeader>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex flex-col gap-2 ${
                  activeSectionId === section.id
                    ? 'bg-indigo-50 border border-indigo-100'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-medium truncate pr-2 ${activeSectionId === section.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {section.name}
                  </span>
                  {getReadinessBadge(section.readiness)}
                </div>
                {getStatusBadge(section.status)}
              </button>
            ))}
          </div>
        </Card>

        {/* Main Content */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {activeSection ? (
            <>
              <CardHeader className="border-b border-slate-100 shrink-0 flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-lg">{activeSection.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">Readiness:</span>
                    <span className="text-xs font-medium text-slate-700">{activeSection.readiness}</span>
                    {getReadinessBadge(activeSection.readiness)}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{activeSection.version ?? 'v1'}</span>
                  </div>
                </div>
                {activeSection.status !== 'Approved' && (
                  <Button
                    onClick={() => handleApprove(activeSection.id)}
                    className="gap-2"
                    disabled={approvingId === activeSection.id}
                  >
                    {approvingId === activeSection.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle2 className="w-4 h-4" />
                    }
                    {approvingId === activeSection.id ? 'Menyimpan...' : 'Approve Section'}
                  </Button>
                )}
                {activeSection.status === 'Approved' && (
                  <Badge variant="success" className="text-sm px-3 py-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approved
                  </Badge>
                )}
              </CardHeader>

              <div className="flex-1 flex overflow-hidden">
                {/* Document Text */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                  <div className="max-w-2xl mx-auto prose prose-slate prose-sm md:prose-base">
                    <p className="leading-relaxed text-slate-800">{activeSection.content}</p>
                    <p className="leading-relaxed text-slate-800 mt-4">
                      Sejalan dengan visi misi perusahaan, kami terus memperkuat fundamental bisnis melalui diversifikasi portofolio dan digitalisasi layanan. Sepanjang tahun 2024, berbagai inisiatif strategis telah dieksekusi dengan baik, menghasilkan pertumbuhan yang solid di tengah dinamika pasar global.
                    </p>
                    <p className="leading-relaxed text-slate-800 mt-4">
                      Komitmen terhadap prinsip keberlanjutan juga diwujudkan melalui integrasi aspek ESG dalam setiap pengambilan keputusan bisnis. Kami percaya bahwa pertumbuhan jangka panjang hanya dapat dicapai dengan memberikan nilai tambah bagi seluruh pemangku kepentingan.
                    </p>
                  </div>
                </div>

                {/* Comments Sidebar */}
                <div className="w-80 border-l border-slate-100 bg-slate-50 flex flex-col shrink-0">
                  <div className="p-4 border-b border-slate-200 bg-white shrink-0">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Comments ({sectionComments.length})
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sectionComments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        Belum ada komentar di section ini.
                      </div>
                    ) : (
                      sectionComments.map(comment => (
                        <div key={comment.id} className={`bg-white border rounded-lg p-3 shadow-sm ${comment.status === 'Resolved' ? 'border-emerald-200 opacity-70' : 'border-slate-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-900">{comment.author}</span>
                            <span className="text-[10px] text-slate-500">{format(comment.timestamp, 'dd MMM, HH:mm')}</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-3">{comment.text}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant={comment.status === 'Resolved' ? 'success' : 'outline'} className="text-[10px] px-1.5 py-0">
                              {comment.status}
                            </Badge>
                            {comment.status === 'Open' && (
                              <button
                                onClick={() => handleResolveComment(comment.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tambahkan komentar..."
                        className="w-full border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || sendingComment}
                        className="absolute bottom-3 right-3 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-30"
                      >
                        {sendingComment
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Pilih section untuk mulai review
            </div>
          )}
        </Card>
      </div>

      {/* Compare Versions Modal */}
      {compareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setCompareOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Compare Versions</h2>
                <p className="text-sm text-slate-500">{activeSection?.name ?? 'Pilih section'}</p>
              </div>
              <button onClick={() => setCompareOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {activeSection ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* v1 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">v1 — Previous</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 leading-relaxed min-h-[200px]">
                      {activeSection.content}
                    </div>
                  </div>
                  {/* v2 / current */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">v2 — Current</span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed min-h-[200px]">
                      {activeSection.content}
                      <span className="bg-emerald-100 text-emerald-800 rounded px-0.5 ml-1">
                        Sejalan dengan visi misi perusahaan, kami terus memperkuat fundamental bisnis melalui diversifikasi portofolio dan digitalisasi layanan.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-12">Pilih section di halaman utama terlebih dahulu.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};