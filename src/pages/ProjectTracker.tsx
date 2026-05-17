import React from 'react';
import { CheckCircle2, Lock, Circle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

type StepDef = { num: number; name: string; gateLabel?: string };

const TIER1_STEPS: StepDef[] = [
  { num: 1,  name: 'Document Control Log' },
  { num: 2,  name: 'Parsing & Structuring' },
  { num: 3,  name: 'Cross-Verification Matrix', gateLabel: 'Gate 4' },
  { num: 4,  name: 'Gap Register' },
  { num: 5,  name: 'Draft Review' },
  { num: 6,  name: 'Risk Register' },
  { num: 7,  name: 'Issue Log' },
  { num: 8,  name: 'Senior Sign-off', gateLabel: 'Gate 10' },
  { num: 9,  name: 'Deliverables' },
  { num: 10, name: 'Institutional Memory' },
  { num: 11, name: 'Audit Trail' },
];

const TIER2_STEPS: StepDef[] = [
  { num: 1,  name: 'Document Control Log' },
  { num: 2,  name: 'Parsing & Structuring' },
  { num: 3,  name: 'Master Matrix', gateLabel: 'Gate 4' },
  { num: 4,  name: 'Draft Review' },
  { num: 5,  name: 'Gap Register' },
  { num: 6,  name: 'Risk Register' },
  { num: 7,  name: 'QC Checklist', gateLabel: 'Gate 9' },
  { num: 8,  name: 'Senior Sign-off', gateLabel: 'Gate 10' },
  { num: 9,  name: 'Deliverables' },
  { num: 10, name: 'Institutional Memory' },
  { num: 11, name: 'Audit Trail' },
];

const GATE_KEYS: Record<string, string> = {
  'Gate 4': 'gate_4',
  'Gate 9': 'gate_9',
  'Gate 10': 'gate_10',
};

export const ProjectTracker = () => {
  const { project } = useAppContext();

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Memuat data proyek...
      </div>
    );
  }

  const tier = project.tier ?? '';
  const steps = tier.toLowerCase().includes('2') ? TIER2_STEPS : TIER1_STEPS;
  const completedSteps: number[] = project.completedSteps ?? [];
  const currentStep: number = project.currentStep ?? 1;
  const gateStatuses: Record<string, string> = project.gateStatuses ?? {};
  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Progress real-time pipeline engagement — diperbarui otomatis oleh Tim Bilmare.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-[#1A1A28] rounded-2xl border border-slate-200 dark:border-white/[0.08] p-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Overall Progress</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">{progressPercent}%</p>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-1">
            {completedSteps.length} / {steps.length} step selesai
          </p>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? '#1a8f3c' : '#0071e3' }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="bg-white dark:bg-[#1A1A28] rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.num);
          const isActive = step.num === currentStep && !isCompleted;
          const isLocked = !isCompleted && !isActive;
          const gateKey = step.gateLabel ? GATE_KEYS[step.gateLabel] : null;
          const gatePassed = gateKey ? gateStatuses[gateKey] === 'passed' : false;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={step.num}
              className={`flex items-center gap-4 px-6 py-4 ${!isLast ? 'border-b border-slate-100 dark:border-white/[0.05]' : ''} ${
                isActive ? 'bg-blue-50/60 dark:bg-[#0071e3]/5' : ''
              }`}
            >
              {/* Step icon */}
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-[#1a8f3c]" />
                ) : isActive ? (
                  <Circle className="w-6 h-6 text-[#0071e3] fill-[#0071e3]/20" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              {/* Step number + name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold tabular-nums ${
                    isCompleted ? 'text-[#1a8f3c]' : isActive ? 'text-[#0071e3]' : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    Step {step.num}
                  </span>
                  {step.gateLabel && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      gatePassed
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                    }`}>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {step.gateLabel} {gatePassed ? '✓' : ''}
                    </span>
                  )}
                </div>
                <p className={`text-sm font-medium mt-0.5 ${
                  isCompleted ? 'text-slate-700 dark:text-slate-300' :
                  isActive ? 'text-slate-900 dark:text-white font-semibold' :
                  'text-slate-400 dark:text-slate-600'
                }`}>
                  {step.name}
                </p>
              </div>

              {/* Status badge */}
              <div className="shrink-0">
                {isCompleted ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                    Selesai
                  </span>
                ) : isActive ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-[#0071e3]/10 text-[#0071e3]">
                    Sedang Berjalan
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-600">
                    Belum Dimulai
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
