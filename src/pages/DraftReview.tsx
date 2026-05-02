import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare, CheckCircle2, Clock,
  Send, AlertCircle, Loader2, ChevronLeft
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { usePermission } from '../hooks/usePermission';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DraftReview = () => {
  const { draftSections, draftComments, approveSection, addToast, project, user } = useAppContext();
  const { can } = usePermission();
  const [selectedReport, setSelectedReport] = useState('AR');
  const [activeSectionId, setActiveSectionId] = useState(draftSections.find(s => s.report === 'AR')?.id || '');
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [comments, setComments] = useState(draftComments);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'content'>('list');

  const filteredSections = draftSections.filter(s => s.report === selectedReport);
  const activeSection = filteredSections.find(s => s.id === activeSectionId);
  const sectionComments = comments.filter(c => c.sectionId === activeSectionId);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setMobileView('content');
  };

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

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeSectionId) return;
    setSendingComment(true);
    try {
      const { data, error } = await supabase
        .from('draft_comments')
        .insert([{ section_id: activeSectionId, project_id: project.id, author: user?.name ?? 'Client', text: newComment.trim(), status: 'Open', timestamp: new Date().toISOString() }])
        .select().single();
      if (error) throw error;
      setComments(prev => [{ id: data.id, sectionId: data.section_id, author: data.author, text: data.text, status: data.status, timestamp: new Date(data.timestamp) }, ...prev]);
      setNewComment('');
      addToast('Komentar berhasil ditambahkan.', 'success');
    } catch (err: any) {
      addToast('Gagal menambahkan komentar: ' + err.message, 'error');
    } finally {
      setSendingComment(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('draft_comments').update({ status: 'Resolved' }).eq('id', commentId);
      if (error) throw error;
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, status: 'Resolved' } : c));
      addToast('Komentar ditandai Resolved.', 'success');
    } catch (err: any) {
      addToast('Gagal resolve komentar.', 'error');
    }
  };

  const handleApprove = async (sectionId: string) => {
    setApprovingId(sectionId);
    await approveSection(sectionId);
    setApprovingId(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Draft Review</h1>
          <p className="text-slate-500 mt-1">Collaborative review and approval of report sections.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={selectedReport} onChange={(e) => { setSelectedReport(e.target.value); setActiveSectionId(draftSections.find(s => s.report === e.target.value)?.id || ''); setMobileView('list'); }}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
            <option value="AR">Laporan Tahunan 2024</option>
            <option value="SR">Laporan Keberlanjutan 2024</option>
          </select>
        </div>
      </div>

      {/* Mobile back button */}
      {mobileView === 'content' && (
        <button onClick={() => setMobileView('list')} className="md:hidden flex items-center gap-2 text-sm text-indigo-600 font-medium">
          <ChevronLeft className="w-4 h-4" /> Kembali ke daftar sections
        </button>
      )}

      <div className="flex gap-6" style={{ minHeight: '60vh' }}>
        {/* Sections Panel */}
        <Card className={`${mobileView === 'content' ? 'hidden' : 'flex'} md:flex w-full md:w-64 shrink-0 flex-col overflow-hidden`}>
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 shrink-0">
            <CardTitle className="text-sm">Sections</CardTitle>
          </CardHeader>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredSections.map(section => (
              <button key={section.id} onClick={() => handleSelectSection(section.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex flex-col gap-2 ${
                  activeSectionId === section.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                <div className="flex items-center justify-between w-full">
                  <span className={`text-sm font-medium truncate pr-2 ${activeSectionId === section.id ? 'text-indigo-900' : 'text-slate-700'}`}>{section.name}</span>
                  {getReadinessBadge(section.readiness)}
                </div>
                {getStatusBadge(section.status)}
              </button>
            ))}
          </div>
        </Card>

        {/* Main Content */}
        <Card className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex-col overflow-hidden min-w-0`}>
          {activeSection ? (
            <>
              <CardHeader className="border-b border-slate-100 shrink-0 flex flex-row items-center justify-between py-4 gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-base md:text-lg">{activeSection.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">Readiness:</span>
                    <span className="text-xs font-medium text-slate-700">{activeSection.readiness}</span>
                    {getReadinessBadge(activeSection.readiness)}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{activeSection.version ?? 'v1'}</span>
                  </div>
                </div>
                {activeSection.status !== 'Approved' ? (
                  can('approveSection') ? (
                    <Button onClick={() => handleApprove(activeSection.id)} className="gap-2 shrink-0" disabled={approvingId === activeSection.id}>
                      {approvingId === activeSection.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {approvingId === activeSection.id ? 'Menyimpan...' : 'Approve'}
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 italic shrink-0">Hanya Full Access yang dapat menyetujui</span>
                  )
                ) : (
                  <Badge variant="success" className="text-sm px-3 py-1 shrink-0"><CheckCircle2 className="w-4 h-4 mr-1" /> Approved</Badge>
                )}
              </CardHeader>

              {/* 2-panel: doc + comments */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Document Text */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                  <div className="max-w-2xl mx-auto prose prose-slate prose-sm md:prose-base">
                    {activeSection.content
                      ? <p className="leading-relaxed text-slate-800 whitespace-pre-wrap">{activeSection.content}</p>
                      : <p className="text-slate-400 italic text-sm">Konten section belum tersedia.</p>
                    }
                  </div>
                </div>

                {/* Comments — full width on mobile (below doc), sidebar on desktop */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50 flex flex-col shrink-0 max-h-[50vh] md:max-h-none">
                  <div className="p-4 border-b border-slate-200 bg-white shrink-0">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Comments ({sectionComments.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sectionComments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">Belum ada komentar di section ini.</div>
                    ) : (
                      sectionComments.map(comment => (
                        <div key={comment.id} className={`bg-white border rounded-lg p-3 shadow-sm ${comment.status === 'Resolved' ? 'border-emerald-200 opacity-70' : 'border-slate-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-900">{comment.author}</span>
                            <span className="text-[10px] text-slate-500">{format(comment.timestamp, 'dd MMM, HH:mm')}</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-3">{comment.text}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant={comment.status === 'Resolved' ? 'success' : 'outline'} className="text-[10px] px-1.5 py-0">{comment.status}</Badge>
                            {comment.status === 'Open' && (<button onClick={() => handleResolveComment(comment.id)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Resolve</button>)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {can('addComment') ? (
                    <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                      <div className="relative">
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Tambahkan komentar..."
                          className="w-full border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" />
                        <button onClick={handleAddComment} disabled={!newComment.trim() || sendingComment}
                          className="absolute bottom-3 right-3 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-30">
                          {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
                      <p className="text-xs text-slate-400 text-center">Role Anda tidak dapat menambahkan komentar.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Pilih section untuk mulai review</div>
          )}
        </Card>
      </div>

    </div>
  );
};
