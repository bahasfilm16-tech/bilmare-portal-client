import React from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, formatDistanceToNow, format } from 'date-fns';
import {
  AlertCircle, CheckCircle2, Clock, UploadCloud,
  FileText, Download, MessageSquare, AlertTriangle,
  FileEdit, Loader2, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const RingChart = ({
  percent,
  size = 72,
  strokeWidth = 6,
  color = '#6366f1',
  trackColor = 'currentColor',
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(percent, 100) / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={trackColor} strokeWidth={strokeWidth}
        className="text-slate-100 dark:text-white/[0.06]"
        style={{ stroke: 'currentColor' }}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
};

const MiniBar = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-slate-500 dark:text-slate-500">{label}</span>
      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{count}</span>
    </div>
    <div className="h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%', backgroundColor: color }}
      />
    </div>
  </div>
);

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'document': return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    case 'finding': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    case 'draft': return <FileEdit className="w-3.5 h-3.5 text-indigo-500" />;
    case 'deliverable': return <Download className="w-3.5 h-3.5 text-emerald-500" />;
    case 'comment': return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
    case 'status': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  }
};

export const ProjectOverview = () => {
  const navigate = useNavigate();
  const { project, phases, gapFindings, documents, activities, team, loadingProject } = useAppContext();

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
        <span className="text-sm text-slate-500 dark:text-slate-400">Memuat data proyek...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tidak ada proyek yang ditemukan.</p>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Hubungi tim Bilmare untuk informasi lebih lanjut.</p>
        </div>
      </div>
    );
  }

  const daysToDeadline = project.deadlineOJK
    ? differenceInDays(new Date(project.deadlineOJK), new Date())
    : null;

  const openFindings = gapFindings.filter(f => f.status === 'Open').length;
  const acknowledgedFindings = gapFindings.filter(f => f.status === 'Client Acknowledged').length;
  const inResolutionFindings = gapFindings.filter(f => f.status === 'In Resolution').length;
  const resolvedFindings = gapFindings.filter(f => f.status === 'Resolved').length;

  const acceptedDocs = documents.filter(d => d.status === 'Active' || d.status === 'Received').length;
  const needsActionDocs = documents.filter(d => d.status === 'Needs Clarification').length;
  const docProgress = documents.length > 0
    ? Math.round((acceptedDocs / documents.length) * 100)
    : 0;

  const completedPhases = phases.filter(p => p.status === 'Completed').length;
  const phaseProgressPct = phases.length > 0
    ? Math.round((completedPhases / phases.length) * 100)
    : 0;

  const deadlineUrgent = daysToDeadline !== null && daysToDeadline < 30;

  return (
    <div className="space-y-5">
      {/* ── HERO PANEL ────────────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden bg-[#1A1F36] dark:bg-[#0D1117] p-6 text-white">
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
        />
        {/* Subtle accent gradient top-right */}
        <div
          className="absolute top-0 right-0 w-80 h-40 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, #635BFF, transparent 70%)' }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#8792A2] mb-2">{project.tier}</p>
            <h1 className="text-[22px] font-bold leading-tight mb-1.5 tracking-[-0.02em]">{project.name}</h1>
            {project.scope && (
              <p className="text-[12px] text-[#8792A2] max-w-md leading-relaxed">{project.scope}</p>
            )}
          </div>

          <div className="flex items-center gap-7 shrink-0">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <RingChart percent={project.overallProgress ?? 0} size={64} strokeWidth={5} color="#635BFF" />
                <span className="absolute text-[13px] font-bold tabular-nums">{project.overallProgress ?? 0}%</span>
              </div>
              <p className="text-[10px] text-[#697386] mt-1.5 font-medium">Progress</p>
            </div>

            {daysToDeadline !== null && (
              <div className="text-center">
                <p className={`text-[28px] font-bold leading-none tabular-nums ${deadlineUrgent ? 'text-[#DF1B41]' : 'text-white'}`}>
                  {daysToDeadline < 0 ? '0' : daysToDeadline}
                </p>
                <p className="text-[10px] text-[#697386] font-medium mt-1.5">hari ke OJK</p>
                {project.deadlineOJK && (
                  <p className="text-[9px] text-[#697386] mt-0.5 tabular-nums">{format(new Date(project.deadlineOJK), 'dd MMM yyyy')}</p>
                )}
              </div>
            )}

            <div className="text-center hidden sm:block">
              <p className={`text-[28px] font-bold leading-none tabular-nums ${openFindings > 0 ? 'text-[#E84E0F]' : 'text-white'}`}>{openFindings}</p>
              <p className="text-[10px] text-[#697386] font-medium mt-1.5">open findings</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative h-px bg-white/[0.08] my-5" />

        {/* Action buttons */}
        <div className="relative flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/document-vault')}
            className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[6px] transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload Dokumen
          </button>
          <button
            onClick={() => navigate('/gap-register')}
            className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[6px] transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Gap Register
          </button>
          <button
            onClick={() => navigate('/communication')}
            className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[6px] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat Tim
          </button>
        </div>
      </div>

      {/* ── 3 STAT CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={project.status === 'At Risk' ? 'border-[#FFC0C9] dark:border-[#DF1B41]/20 bg-[#FFF0F3]/50 dark:bg-[#DF1B41]/5' : ''}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#8792A2] dark:text-slate-500 uppercase tracking-wider">Project Health</p>
              {project.status === 'At Risk'
                ? <AlertCircle className="w-4 h-4 text-red-500" />
                : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <p className={`text-[16px] font-bold tabular-nums ${project.status === 'At Risk' ? 'text-[#DF1B41] dark:text-red-400' : 'text-[#09825D] dark:text-emerald-400'}`}>
              {project.status}
            </p>
            {project.statusReason && (
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">{project.statusReason}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#8792A2] dark:text-slate-500 uppercase tracking-wider">Phase Progress</p>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative inline-flex items-center justify-center">
                <RingChart percent={phaseProgressPct} size={56} strokeWidth={5} color="#635BFF" />
                <span className="absolute text-[11px] font-bold text-slate-800 dark:text-slate-200">{phaseProgressPct}%</span>
              </div>
              <div>
                <p className="text-[12px] text-[#697386] dark:text-slate-500">
                  <span className="text-[17px] font-bold text-[#1A1F36] dark:text-white tabular-nums">{completedPhases}</span>
                  /{phases.length} fase
                </p>
                <p className="text-[11px] text-[#8792A2] dark:text-slate-600 mt-0.5">
                  {phases.find(p => p.id === project.currentPhase)?.name ?? `Fase ${project.currentPhase}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#8792A2] dark:text-slate-500 uppercase tracking-wider">Dokumen</p>
              <button
                onClick={() => navigate('/document-vault')}
                className="text-[#635BFF] hover:text-[#5951E5] transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative inline-flex items-center justify-center">
                <RingChart percent={docProgress} size={56} strokeWidth={5} color="#10b981" />
                <span className="absolute text-[11px] font-bold text-slate-800 dark:text-slate-200">{docProgress}%</span>
              </div>
              <div>
                <p className="text-[12px] text-[#697386] dark:text-slate-500">
                  <span className="text-[17px] font-bold text-[#1A1F36] dark:text-white tabular-nums">{acceptedDocs}</span>
                  /{documents.length} diterima
                </p>
                {needsActionDocs > 0 && (
                  <p className="text-[11px] text-[#C44C08] dark:text-amber-400 mt-0.5 font-medium">{needsActionDocs} perlu klarifikasi</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FINDINGS + ACTIVITY + TEAM ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gap Findings Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Gap Findings</CardTitle>
              <button
                onClick={() => navigate('/gap-register')}
                className="text-[#635BFF] hover:text-[#5951E5] transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {gapFindings.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-600">Tidak ada findings.</p>
            ) : (
              <div className="space-y-3">
                <MiniBar label="Open" count={openFindings} total={gapFindings.length} color="#f59e0b" />
                <MiniBar label="Client Acknowledged" count={acknowledgedFindings} total={gapFindings.length} color="#6366f1" />
                <MiniBar label="In Resolution" count={inResolutionFindings} total={gapFindings.length} color="#3b82f6" />
                <MiniBar label="Resolved" count={resolvedFindings} total={gapFindings.length} color="#10b981" />
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  <p className="text-[11px] text-slate-400 dark:text-slate-600">Total: <span className="font-semibold text-slate-700 dark:text-slate-300">{gapFindings.length}</span> findings</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-600">Belum ada aktivitas.</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity, idx) => (
                  <div key={activity.id} className="flex gap-2.5 relative">
                    {idx < Math.min(activities.length, 5) - 1 && (
                      <div className="absolute left-[13px] top-6 bottom-[-12px] w-px bg-slate-100 dark:bg-white/[0.06]" />
                    )}
                    <div className="w-6.5 h-6.5 w-[26px] h-[26px] rounded-full bg-slate-50 dark:bg-white/[0.05] border border-slate-100 dark:border-white/[0.06] flex items-center justify-center shrink-0 z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-[12px] text-slate-800 dark:text-slate-200 font-medium leading-snug">{activity.description}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                        {activity.actor} · {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Bilmare Team</CardTitle>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-600">Belum ada anggota tim.</p>
            ) : (
              <div className="space-y-3">
                {team.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-2.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/[0.08] object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── PHASE TRACKER ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Workflow Progress</CardTitle>
            <span className="text-[12px] font-semibold text-[#635BFF] dark:text-[#8B85FF] tabular-nums">{project.overallProgress}% selesai</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-[#F6F9FC] dark:bg-white/[0.06] rounded-full h-1.5 mb-6 border border-[#E3E8EF] dark:border-transparent">
            <div
              className="h-1.5 rounded-full transition-all duration-700 bg-[#635BFF]"
              style={{ width: `${project.overallProgress}%` }}
            />
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <div className="relative min-w-[480px]">
              <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 dark:bg-white/[0.06] -translate-y-1/2" />
              <div
                className="absolute top-1/2 left-0 h-px bg-[#635BFF] -translate-y-1/2 transition-all duration-700"
                style={{ width: `${phaseProgressPct}%` }}
              />
              <div className="relative flex justify-between">
                {phases.map((phase: any, index: number) => {
                  const isCompleted = phase.status === 'Completed';
                  const isCurrent = phase.id === project.currentPhase;
                  return (
                    <div key={phase.id} className="flex flex-col items-center group relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-white dark:bg-[#16161F] z-10 transition-all
                        ${isCompleted
                          ? 'border-[#635BFF] text-[#635BFF]'
                          : isCurrent
                          ? 'border-[#635BFF] bg-[#F0EFFE] dark:bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B85FF] ring-4 ring-[#635BFF]/10 dark:ring-[#635BFF]/10'
                          : 'border-[#E3E8EF] dark:border-white/[0.1] text-[#8792A2] dark:text-slate-600'}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      <div className="absolute top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap z-20 pointer-events-none max-w-[120px] text-center shadow-lg">
                        {phase.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <span className="text-[12px] font-medium text-[#697386] dark:text-slate-400">Fase saat ini: </span>
            <span className="text-[12px] text-[#635BFF] dark:text-[#8B85FF] font-semibold">
              {phases.find(p => p.id === project.currentPhase)?.name ?? `Fase ${project.currentPhase}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
