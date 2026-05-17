import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare, CheckCircle2, Clock, Send, AlertCircle,
  Loader2, ChevronLeft, FileText, ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { usePermission } from '../hooks/usePermission';
import { supabase } from '../supabase';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// ─── Parse finding blocks from content string ──────────────────────────────
interface FindingBlock {
  severity: 'High' | 'Medium' | 'Low' | string;
  section: string;
  body: string;
  recommendation: string;
}

function parseFindings(content: string): FindingBlock[] | null {
  if (!content.includes('[High]') && !content.includes('[Medium]') && !content.includes('[Low]')) {
    return null;
  }
  const blocks = content.split(/\n\n+/).filter(b => b.trim().startsWith('•'));
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const header = lines[0] ?? '';
    const rec = lines.find(l => l.startsWith('→')) ?? '';
    const severityMatch = header.match(/\[(High|Medium|Low)\]/);
    const severity = severityMatch ? severityMatch[1] : 'Medium';
    const afterBracket = header.replace(/^•\s*/, '').replace(/\[(High|Medium|Low)\]\s*/, '');
    const colonIdx = afterBracket.indexOf(':');
    const section = colonIdx !== -1 ? afterBracket.slice(0, colonIdx).trim() : '';
    const body = colonIdx !== -1 ? afterBracket.slice(colonIdx + 1).trim() : afterBracket.trim();
    const recommendation = rec.replace(/^→\s*/, '').trim();
    return { severity, section, body, recommendation };
  });
}

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; badge: string; dot: string; label: string }> = {
  High:   { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500',    label: 'High' },
  Medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500',  label: 'Medium' },
  Low:    { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400',   label: 'Low' },
};

function getSeverityConfig(s: string) {
  return SEVERITY_CONFIG[s] ?? SEVERITY_CONFIG['Medium'];
}

// ─── Status helpers ─────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  switch (status) {
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    case 'Needs Review':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" /> Needs Review
        </span>
      );
    case 'Under Review':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
          <Clock className="w-3 h-3" /> Under Review
        </span>
      );
    case 'Needs Client Input':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3" /> Needs Input
        </span>
      );
    default:
      return (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
          {status}
        </span>
      );
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export const DraftReview = () => {
  const { draftSections, draftComments, approveSection, addToast, project, user } = useAppContext();
  const { can } = usePermission();
  const [activeSectionId, setActiveSectionId] = useState(draftSections[0]?.id || '');
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [comments, setComments] = useState(draftComments);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'content'>('list');

  useEffect(() => {
    if (draftSections.length > 0 && !activeSectionId) {
      setActiveSectionId(draftSections[0].id);
    }
  }, [draftSections]);

  useEffect(() => {
    setComments(draftComments);
  }, [draftComments]);

  const activeSection = draftSections.find(s => s.id === activeSectionId);
  const sectionComments = comments.filter(c => c.sectionId === activeSectionId);
  const findings = activeSection ? parseFindings(activeSection.content) : null;

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setMobileView('content');
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeSectionId || !project) return;
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
        id: data.id, sectionId: data.section_id, author: data.author,
        text: data.text, status: data.status, timestamp: new Date(data.timestamp),
      }, ...prev]);
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

  if (draftSections.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Draft Review</h1>
          <p className="text-slate-500 mt-1 text-sm">Collaborative review and approval of report sections.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-700 font-semibold">Belum ada section untuk direview</p>
            <p className="text-slate-400 text-sm mt-1">Tim Bilmare akan mengirimkan draft sections saat tersedia.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" style={{ minHeight: '80vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Draft Review</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Collaborative review and approval of report sections.</p>
        </div>
        <span className="text-xs text-slate-400 pb-0.5">{draftSections.length} section tersedia</span>
      </div>

      {/* Mobile back */}
      {mobileView === 'content' && (
        <button onClick={() => setMobileView('list')} className="md:hidden flex items-center gap-1.5 text-sm text-indigo-600 font-medium w-fit">
          <ChevronLeft className="w-4 h-4" /> Kembali ke daftar
        </button>
      )}

      <div className="flex gap-5 flex-1 min-h-0" style={{ minHeight: '70vh' }}>
        {/* ── Sidebar ── */}
        <div className={`${mobileView === 'content' ? 'hidden' : 'flex'} md:flex w-full md:w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden`}>
          <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sections</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {draftSections.map(section => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section.id)}
                  className={`w-full text-left px-3 py-3.5 rounded-xl transition-all flex items-start justify-between gap-2 group ${
                    isActive
                      ? 'bg-indigo-600 shadow-sm'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {section.name}
                    </p>
                    <div className="mt-1.5">
                      <StatusChip status={section.status} />
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-opacity ${isActive ? 'text-white/70 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main panel ── */}
        <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-w-0`}>
          {activeSection ? (
            <>
              {/* Section header */}
              <div className="px-6 py-4 border-b border-slate-100 flex flex-row items-start justify-between gap-4 flex-wrap shrink-0 bg-white">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 leading-snug">{activeSection.name}</h2>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <StatusChip status={activeSection.status} />
                    <span className="text-xs text-slate-400">{activeSection.version ?? 'v1'}</span>
                  </div>
                </div>
                {activeSection.status !== 'Approved' ? (
                  can('approveSection') ? (
                    <Button
                      onClick={() => handleApprove(activeSection.id)}
                      className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={approvingId === activeSection.id}
                    >
                      {approvingId === activeSection.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                        : <><CheckCircle2 className="w-4 h-4" /> Approve Section</>
                      }
                    </Button>
                  ) : (
                    <p className="text-xs text-slate-400 italic shrink-0 self-center">Hanya Full Access yang dapat menyetujui</p>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Approved
                  </span>
                )}
              </div>

              {/* Content + Comments split */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* ── Content area ── */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
                  {findings ? (
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {findings.length} Temuan
                        </p>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                      {findings.map((f, i) => {
                        const cfg = getSeverityConfig(f.severity);
                        return (
                          <div key={i} className={`rounded-xl border p-5 ${cfg.bg} ${cfg.border}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                {f.section && (
                                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{f.section}</p>
                                )}
                                <p className="text-sm font-medium text-slate-800 leading-relaxed">{f.body}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {f.severity}
                              </span>
                            </div>
                            {f.recommendation && (
                              <div className="mt-3 pt-3 border-t border-slate-200/70">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Rekomendasi Tim Bilmare</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{f.recommendation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto">
                      {activeSection.content
                        ? <p className="leading-relaxed text-slate-800 text-sm whitespace-pre-wrap">{activeSection.content}</p>
                        : <p className="text-slate-400 italic text-sm text-center py-12">Konten section belum tersedia.</p>
                      }
                    </div>
                  )}
                </div>

                {/* ── Comments sidebar ── */}
                <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/60 flex flex-col shrink-0 max-h-[48vh] md:max-h-none">
                  <div className="px-4 py-3.5 border-b border-slate-100 bg-white shrink-0">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      Comments
                      {sectionComments.length > 0 && (
                        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {sectionComments.length}
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {sectionComments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                        <MessageSquare className="w-6 h-6 text-slate-300" />
                        <p className="text-xs text-slate-400">Belum ada komentar di section ini.</p>
                      </div>
                    ) : (
                      sectionComments.map(comment => (
                        <div
                          key={comment.id}
                          className={`bg-white border rounded-xl p-3.5 shadow-sm transition-opacity ${
                            comment.status === 'Resolved' ? 'border-emerald-200 opacity-60' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-800">{comment.author}</span>
                            <span className="text-[10px] text-slate-400">{format(comment.timestamp, 'dd MMM, HH:mm')}</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed mb-3">{comment.text}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              comment.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {comment.status}
                            </span>
                            {comment.status === 'Open' && (
                              <button
                                onClick={() => handleResolveComment(comment.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {can('addComment') ? (
                    <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                      <div className="relative">
                        <textarea
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Tambahkan komentar..."
                          className="w-full border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 bg-slate-50 placeholder-slate-400"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || sendingComment}
                          className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {sendingComment
                            ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            : <Send className="w-3.5 h-3.5 text-white" />
                          }
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                      <p className="text-xs text-slate-400 text-center">Role Anda tidak dapat menambahkan komentar.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
              <FileText className="w-8 h-8 text-slate-300" />
              <p className="text-slate-500 text-sm">Pilih section untuk mulai review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
