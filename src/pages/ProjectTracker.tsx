import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo, Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface Task {
  id: string;
  phaseId: number;
  name: string;
  status: string;
  assignee: string;
  dueDate: Date;
}

const mapTask = (t: any): Task => ({
  id: t.id,
  phaseId: t.phase_id,
  name: t.name,
  status: t.status,
  assignee: t.assignee,
  dueDate: t.due_date ? new Date(t.due_date) : new Date(),
});

export const ProjectTracker = () => {
  const { phases, project } = useAppContext();
  // BUG FIX: project bisa null saat useState dijalankan
  const [expandedPhase, setExpandedPhase] = useState<number | null>(project?.currentPhase ?? null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('due_date', { ascending: true });

      if (!error && data && data.length > 0) {
        setTasks(data.map(mapTask));
      }
      setLoadingTasks(false);
    };

    if (project?.id) fetchTasks();
  }, [project?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Done': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'Blocked by Client':
      case 'Blocked by Bilmare': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-slate-300" />;
    }
  };

  const getTaskBadge = (status: string) => {
    switch (status) {
      case 'Done': return <Badge variant="success">Done</Badge>;
      case 'In Progress': return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">In Progress</Badge>;
      case 'Blocked by Client': return <Badge variant="destructive">Blocked by Client</Badge>;
      case 'Blocked by Bilmare': return <Badge variant="warning">Blocked by Bilmare</Badge>;
      default: return <Badge variant="outline">To Do</Badge>;
    }
  };

  const hasBlockers = tasks.some(t => t.status.includes('Blocked'));
  const selectedPhase = phases.find(p => p.id === expandedPhase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Tracker</h1>
        <p className="text-slate-500 mt-1">Detailed view of project phases and tasks.</p>
      </div>

      {hasBlockers && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Blocker Alert</h3>
            <p className="text-sm text-red-700 mt-1">
              There are tasks blocked waiting for client input. This may impact the final deadline.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phases Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle>Phases</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {phases.map((phase) => {
                const isCurrent = phase.id === project?.currentPhase;
                const isCompleted = phase.status === 'Completed';
                const isSelected = expandedPhase === phase.id;

                return (
                  <button
                    key={phase.id}
                    onClick={() => setExpandedPhase(isSelected ? null : phase.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-slate-50
                      ${isSelected ? 'bg-indigo-50 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                      ${isCompleted ? 'bg-emerald-500 text-white' :
                        isCurrent ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' :
                        'bg-slate-100 text-slate-500'}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : phase.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrent ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {phase.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                          ${isCompleted ? 'bg-emerald-100 text-emerald-700' :
                            isCurrent ? 'bg-indigo-100 text-indigo-700' :
                            'bg-slate-100 text-slate-500'}`}>
                          {phase.status}
                        </span>
                        {phase.targetDate && (
                          <span className="text-xs text-slate-400">
                            {format(phase.targetDate, 'dd MMM')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle>
              {selectedPhase ? `Tasks — ${selectedPhase.name}` : 'Pilih fase untuk melihat tasks'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {!expandedPhase ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                <ListTodo className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm">Klik fase di sebelah kiri untuk melihat detail tasks.</p>
              </div>
            ) : loadingTasks ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                <span className="text-sm text-slate-500">Memuat tasks...</span>
              </div>
            ) : tasks.filter(t => t.phaseId === expandedPhase).length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Belum ada tasks untuk fase ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.filter(t => t.phaseId === expandedPhase).map(task => (
                  <div key={task.id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 transition-all hover:shadow-sm
                      ${task.status.includes('Blocked') ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">{getStatusIcon(task.status)}</div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900">{task.name}</h4>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                              {task.assignee.charAt(0)}
                            </div>
                            {task.assignee}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {format(task.dueDate, 'dd MMM yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">{getTaskBadge(task.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
