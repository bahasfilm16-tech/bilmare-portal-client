import React from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, formatDistanceToNow, format } from 'date-fns';
import {
  AlertCircle, CheckCircle2, Clock, UploadCloud,
  FileText, Download, MessageSquare, AlertTriangle,
  FileEdit, Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ProjectOverview = () => {
  const navigate = useNavigate();
  const { project, phases, gapFindings, documents, activities, team, loadingProject } = useAppContext();

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
        <span className="text-slate-500">Memuat data proyek...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Tidak ada proyek yang ditemukan.</p>
          <p className="text-slate-400 text-sm mt-1">Hubungi tim Bilmare untuk informasi lebih lanjut.</p>
        </div>
      </div>
    );
  }

  const daysToDeadline = project.deadlineOJK
    ? differenceInDays(new Date(project.deadlineOJK), new Date())
    : null;

  const openFindings = gapFindings.filter(f => f.status === 'Open').length;
  const requiredDocs = documents.filter(d => d.required);
  const receivedDocs = requiredDocs.filter(d => d.status !== 'Needs Clarification');
  const docProgress = requiredDocs.length > 0
    ? Math.round((receivedDocs.length / requiredDocs.length) * 100)
    : 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'finding': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'draft': return <FileEdit className="w-4 h-4 text-indigo-500" />;
      case 'deliverable': return <Download className="w-4 h-4 text-emerald-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-slate-500" />;
      case 'status': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Overview</h1>
          <p className="text-slate-500 mt-1">Command center for your reporting project.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/document-vault')} variant="outline" className="gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Document
          </Button>
          <Button onClick={() => navigate('/gap-register')} className="gap-2">
            <AlertTriangle className="w-4 h-4" /> View Findings
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health */}
        <Card className={project.status === 'At Risk' ? 'border-red-200 bg-red-50/30' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">Project Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              {project.status === 'At Risk'
                ? <AlertCircle className="w-8 h-8 text-red-500" />
                : <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              }
              <span className={`text-2xl font-bold ${project.status === 'At Risk' ? 'text-red-700' : 'text-emerald-700'}`}>
                {project.status}
              </span>
            </div>
            {project.statusReason && (
              <p className="text-sm text-slate-600">{project.statusReason}</p>
            )}
          </CardContent>
        </Card>

        {/* Countdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">OJK Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-3xl font-bold ${daysToDeadline !== null && daysToDeadline < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {daysToDeadline ?? '—'}
              </span>
              {daysToDeadline !== null && <span className="text-slate-500 font-medium">hari lagi</span>}
            </div>
            {project.deadlineOJK && (
              <p className="text-sm text-slate-500">
                Target: {format(new Date(project.deadlineOJK), 'dd MMMM yyyy')}
              </p>
            )}
            {project.rupsDate && (
              <p className="text-xs text-slate-400 mt-1">
                RUPS: {format(new Date(project.rupsDate), 'dd MMMM yyyy')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Open Findings */}
        <Card className="cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => navigate('/gap-register')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">Open Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-amber-600">{openFindings}</span>
              <span className="text-slate-500 font-medium">issues</span>
            </div>
            <p className="text-sm text-slate-500">Requires client resolution</p>
          </CardContent>
        </Card>
      </div>

      {/* Phase Tracker */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Workflow Progress</CardTitle>
            <span className="text-sm font-semibold text-indigo-600">{project.overallProgress}% selesai</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
            <div className="bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${project.overallProgress}%` }} />
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${((project.currentPhase - 1) / 7) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(phase => {
                const isCompleted = phase < project.currentPhase;
                const isCurrent = phase === project.currentPhase;
                const phaseInfo = phases.find(p => p.id === phase);

                return (
                  <div key={phase} className="flex flex-col items-center group relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-white z-10 transition-colors
                      ${isCompleted ? 'border-indigo-500 text-indigo-500' :
                        isCurrent ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-100' :
                        'border-slate-200 text-slate-400'}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : phase}
                    </div>
                    {phaseInfo && (
                      <div className="absolute top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-20 pointer-events-none max-w-[150px] text-center">
                        {phaseInfo.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className="text-sm font-medium text-slate-900">Fase saat ini: </span>
            <span className="text-sm text-indigo-600 font-semibold">
              {phases.find(p => p.id === project.currentPhase)?.name ?? `Fase ${project.currentPhase}`}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Completeness */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Document Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Required Documents Received</span>
              <span className="font-bold text-slate-900">{receivedDocs.length} / {requiredDocs.length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${docProgress}%` }} />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              We need all required documents to proceed to the next phase without delay.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/document-vault')}>
              View Documents
            </Button>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle>Bilmare Team</CardTitle>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada anggota tim.</p>
            ) : (
              <div className="space-y-4">
                {team.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`;
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.slice(0, 5).map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {idx !== Math.min(activities.length, 5) - 1 && (
                    <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-slate-200" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-slate-900 font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{activity.actor}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
