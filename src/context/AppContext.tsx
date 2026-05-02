import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import type {
  AppUser, Project, Phase, Activity, GapFinding, CrossReference,
  DraftSection, DraftComment, Deliverable, TimeSeriesMetric, FAQ,
  Message, TeamMember, DbDocument, Toast, ClientRole,
  BillingMilestone,
} from '../types';

// Re-export ClientRole so hooks can import from a single place
export type { ClientRole };

interface AppState {
  user: AppUser;
  project: Project | null;
  team: TeamMember[];
  phases: Phase[];
  activities: Activity[];
  documents: DbDocument[];
  gapFindings: GapFinding[];
  crossReferenceClaims: CrossReference[];
  draftSections: DraftSection[];
  draftComments: DraftComment[];
  deliverables: Deliverable[];
  timeSeriesMetrics: TimeSeriesMetric[];
  faqs: FAQ[];
  messages: Message[];
  toasts: Toast[];
  loadingMessages: boolean;
  loadingProject: boolean;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  updateFindingStatus: (id: string, newStatus: string) => void;
  sendMessage: (text: string) => Promise<void>;
  approveSection: (id: string) => void;
  fetchMessages: () => Promise<void>;
  updateUserProfile: (displayName: string, avatarUrl: string) => void;
  logActivity: (type: string, description: string, entityId?: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapProject = (p: Record<string, unknown>): Project => ({
  id: p.id as string,
  name: p.name as string,
  clientId: (p.client_id as string) ?? '',
  tier: (p.tier as string) ?? 'Tier 1',
  tierLabel: (p.tier_label as string) ?? '',
  status: (p.status as string) ?? 'On Track',
  statusReason: (p.status_reason as string) ?? '',
  deadlineOJK: p.deadline_ojk ? new Date(p.deadline_ojk as string) : null,
  rupsDate: p.rups_date ? new Date(p.rups_date as string) : null,
  currentPhase: (p.current_phase as number) ?? 1,
  overallProgress: (p.overall_progress as number) ?? 0,
  contractValue: (p.contract_value as number) ?? 0,
  startDate: p.start_date ? new Date(p.start_date as string) : new Date(),
  scope: (p.scope as string) ?? '',
  scopeNotes: (p.scope_exclusions as string) ?? '',
  engagementLetterStatus: (p.engagement_letter_status as string) ?? 'Pending',
  publicationReadiness: (p.publication_readiness as string) ?? 'Not Yet Assessed',
  billingMilestones: (p.billing_milestones as BillingMilestone[]) ?? [],
  teamIds: (p.team_ids as string[]) ?? [],
  leadAnalystId: (p.lead_analyst_id as string) ?? '',
});

const mapTeamMember = (t: Record<string, unknown>): TeamMember => ({
  id: t.id as string,
  name: t.name as string,
  role: ((t.title ?? t.role) as string) ?? '',
  specialty: (t.specialty as string) ?? '',
  avatar: (t.avatar as string) ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`,
});

const mapPhase = (p: Record<string, unknown>): Phase => ({
  id: p.id as string,
  name: p.name as string,
  status: p.status as string,
  targetDate: p.target_date ? new Date(p.target_date as string) : null,
  actualDate: p.actual_date ? new Date(p.actual_date as string) : null,
});

const mapActivity = (a: Record<string, unknown>): Activity => ({
  id: a.id as string,
  type: (a.type as string) ?? 'status',
  description: (a.description as string) ?? '',
  actor: (a.actor as string) ?? '',
  timestamp: a.timestamp ? new Date(a.timestamp as string) : new Date(),
});

const mapFinding = (f: Record<string, unknown>): GapFinding => ({
  id: f.id as string,
  riskLevel: f.risk_level as GapFinding['riskLevel'],
  report: (f.report as string) ?? '',
  section: (f.section as string) ?? '',
  description: (f.description as string) ?? '',
  type: (f.type as string) ?? '',
  status: (f.status as GapFinding['status']) ?? 'Open',
  dateFound: f.date_found ? new Date(f.date_found as string) : new Date(),
  detail: (f.detail as string) ?? '',
  recommendation: (f.recommendation as string) ?? '',
  clientResponse: (f.client_response as string) ?? '',
});

const mapCrossRef = (c: Record<string, unknown>): CrossReference => ({
  id: c.id as string,
  claim: (c.claim as string) ?? '',
  report: (c.report as string) ?? '',
  category: (c.category as string) ?? '',
  sourceDoc: (c.source_doc as string) ?? '',
  sourcePage: (c.source_page as string) ?? '',
  verificationDate: c.verification_date ? new Date(c.verification_date as string) : new Date(),
  verifier: (c.verifier as string) ?? '',
  status: (c.status as CrossReference['status']) ?? 'Unverified',
  currentYearValue: (c.current_year_value as string) ?? '',
  lastYearValue: (c.last_year_value as string) ?? '',
  lastYearSource: (c.last_year_source as string) ?? '',
});

const mapDraftSection = (s: Record<string, unknown>): DraftSection => ({
  id: s.id as string,
  report: (s.report as string) ?? '',
  name: (s.name as string) ?? '',
  status: (s.status as string) ?? '',
  readiness: (s.readiness as string) ?? '',
  content: (s.content as string) ?? '',
  version: (s.version as string) ?? 'v1',
});

const mapDraftComment = (c: Record<string, unknown>): DraftComment => ({
  id: c.id as string,
  sectionId: (c.section_id as string) ?? '',
  author: (c.author as string) ?? '',
  text: ((c.text ?? c.comment_text) as string) ?? '',
  status: (c.status as DraftComment['status']) ?? 'Open',
  timestamp: c.timestamp ? new Date(c.timestamp as string) : new Date(),
});

const mapDeliverable = (d: Record<string, unknown>): Deliverable => ({
  id: d.id as string,
  name: (d.name as string) ?? '',
  description: (d.description as string) ?? '',
  status: (d.status as string) ?? 'Pending',
  dateAvailable: d.date_available ? new Date(d.date_available as string) : null,
  progress: (d.progress as number) ?? 0,
});

const mapTimeSeries = (m: Record<string, unknown>): TimeSeriesMetric => ({
  id: m.id as string,
  name: (m.name as string) ?? '',
  definition: (m.definition as string) ?? '',
  unit: (m.unit as string) ?? '',
  methodology: (m.methodology as string) ?? '',
  yearEffective: (m.year_effective as number) ?? 2020,
  data: (m.data as Record<string, number | string>) ?? {},
  category: (m.category as string) ?? '',
});

const mapFaq = (f: Record<string, unknown>): FAQ => ({
  id: f.id as string,
  category: (f.category as string) ?? '',
  question: (f.question as string) ?? '',
  answer: (f.answer as string) ?? '',
  reference: (f.reference as string) ?? '',
  sensitivity: (f.sensitivity as FAQ['sensitivity']) ?? 'Normal',
  status: (f.status as FAQ['status']) ?? 'Draft',
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<{
    displayName?: string;
    avatarUrl?: string;
    clientRole?: ClientRole;
  }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [phasesData, setPhasesData] = useState<Phase[]>([]);
  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [gapFindingsData, setGapFindingsData] = useState<GapFinding[]>([]);
  const [crossRefData, setCrossRefData] = useState<CrossReference[]>([]);
  const [draftSectionsData, setDraftSectionsData] = useState<DraftSection[]>([]);
  const [draftCommentsData, setDraftCommentsData] = useState<DraftComment[]>([]);
  const [deliverablesData, setDeliverablesData] = useState<Deliverable[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesMetric[]>([]);
  const [faqsData, setFaqsData] = useState<FAQ[]>([]);
  const [documentsData, setDocumentsData] = useState<DbDocument[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      setLoadingProject(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      if (!sessionUser) { setLoadingProject(false); return; }
      setAuthUser({ id: sessionUser.id, email: sessionUser.email ?? '' });

      const { data: clientUserRow } = await supabase
        .from('client_users')
        .select('project_id, display_name, avatar_url, role')
        .eq('email', sessionUser.email)
        .single();

      if (clientUserRow) {
        setUserProfile({
          displayName: clientUserRow.display_name ?? undefined,
          avatarUrl: clientUserRow.avatar_url ?? undefined,
          clientRole: (clientUserRow.role as ClientRole) ?? 'Full Access',
        });
      }

      let projectRow: Record<string, unknown> | null = null;

      if (clientUserRow?.project_id) {
        const { data: proj } = await supabase
          .from('projects')
          .select('*')
          .eq('id', clientUserRow.project_id)
          .single();
        projectRow = proj;
      }

      if (!projectRow) {
        const { data: proj } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        projectRow = proj;
      }

      if (projectRow) {
        setProjectData(mapProject(projectRow));
        setActiveProjectId(projectRow.id as string);
        const pid = projectRow.id as string;

        const [
          phaseRes, activityRes, findingRes, crossRes,
          sectionRes, commentRes, deliverableRes, timeRes, faqRes, teamRes, docRes,
        ] = await Promise.all([
          supabase.from('phases').select('*').eq('project_id', pid).order('id', { ascending: true }),
          supabase.from('activities').select('*').eq('project_id', pid).order('timestamp', { ascending: false }).limit(20),
          supabase.from('gap_findings').select('*').eq('project_id', pid).order('date_found', { ascending: false }),
          supabase.from('cross_references').select('*').eq('project_id', pid).order('no', { ascending: true }),
          supabase.from('draft_sections').select('*').eq('project_id', pid),
          supabase.from('draft_comments').select('*').eq('project_id', pid).order('timestamp', { ascending: false }),
          supabase.from('deliverables').select('*').eq('project_id', pid),
          supabase.from('time_series_metrics').select('*').eq('project_id', pid),
          supabase.from('faqs').select('*').eq('project_id', pid),
          supabase.from('bilmare_team_members').select('*'),
          supabase.from('documents').select('*').eq('project_id', pid).order('created_at', { ascending: false }),
        ]);

        if (phaseRes.data?.length)      setPhasesData(phaseRes.data.map(mapPhase));
        if (activityRes.data?.length)   setActivitiesData(activityRes.data.map(mapActivity));
        if (findingRes.data?.length)    setGapFindingsData(findingRes.data.map(mapFinding));
        if (crossRes.data?.length)      setCrossRefData(crossRes.data.map(mapCrossRef));
        if (sectionRes.data?.length)    setDraftSectionsData(sectionRes.data.map(mapDraftSection));
        if (commentRes.data?.length)    setDraftCommentsData(commentRes.data.map(mapDraftComment));
        if (deliverableRes.data?.length) setDeliverablesData(deliverableRes.data.map(mapDeliverable));
        if (timeRes.data?.length)       setTimeSeriesData(timeRes.data.map(mapTimeSeries));
        if (faqRes.data?.length)        setFaqsData(faqRes.data.map(mapFaq));
        if (teamRes.data?.length)       setTeamData(teamRes.data.map(mapTeamMember));
        if (docRes.data?.length)        setDocumentsData(docRes.data as DbDocument[]);
      }

      setLoadingProject(false);
    };

    loadAll();
  }, []);

  const fetchMessages = async () => {
    if (!activeProjectId) return;
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', activeProjectId)
      .order('timestamp', { ascending: true });

    if (!error && data) {
      setMessages(data.map((m) => ({
        id: m.id as string,
        sender: (m.sender as string) ?? '',
        avatar: (m.avatar as string) ?? '',
        text: (m.text as string) ?? '',
        timestamp: m.timestamp ? new Date(m.timestamp as string) : new Date(m.inserted_at as string),
        isBilmare: (m.is_bilmare as boolean) ?? false,
      })));
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (!activeProjectId) return;
    fetchMessages();

    const channel = supabase
      .channel(`messages-${activeProjectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${activeProjectId}`,
      }, () => { fetchMessages(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeProjectId]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateUserProfile = (displayName: string, avatarUrl: string) => {
    setUserProfile(prev => ({ ...prev, displayName, avatarUrl }));
  };

  const logActivity = async (type: string, description: string, entityId?: string) => {
    if (!activeProjectId || !authUser) return;
    const actorName = userProfile.displayName ?? authUser.email.split('@')[0] ?? 'Klien';
    const entry = {
      project_id: activeProjectId,
      type,
      description,
      actor: actorName,
      entity_id: entityId ?? null,
      timestamp: new Date().toISOString(),
    };
    const { data } = await supabase.from('activities').insert([entry]).select().single();
    if (data) {
      setActivitiesData(prev => [mapActivity(data as Record<string, unknown>), ...prev].slice(0, 20));
    }
  };

  const updateFindingStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('gap_findings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) { addToast('Gagal update status: ' + error.message, 'error'); return; }
    setGapFindingsData(prev => prev.map(f => f.id === id ? { ...f, status: newStatus as GapFinding['status'] } : f));
    addToast('Status temuan berhasil diperbarui.');
  };

  const sendMessage = async (text: string) => {
    if (!activeProjectId) return;
    const senderName = userProfile.displayName ?? authUser?.email.split('@')[0] ?? 'Klien';
    const { error } = await supabase.from('messages').insert([{
      project_id: activeProjectId,
      sender: senderName,
      text: text.trim(),
      topic: 'Client Communication',
      is_bilmare: false,
      thread_type: 'client',
      timestamp: new Date().toISOString(),
    }]);
    if (error) {
      addToast('Gagal mengirim pesan: ' + error.message, 'error');
    } else {
      await fetchMessages();
    }
  };

  const approveSection = async (id: string) => {
    const { error } = await supabase
      .from('draft_sections')
      .update({ status: 'Approved' })
      .eq('id', id);

    if (error) { addToast('Gagal approve section.', 'error'); return; }
    setDraftSectionsData(prev => prev.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
    addToast('Section berhasil disetujui.');
    await logActivity('draft', 'Section draft disetujui oleh klien.', id);
  };

  const emailName = authUser?.email.split('@')[0] ?? 'Klien';
  const user: AppUser = authUser
    ? {
        id: authUser.id,
        name: userProfile.displayName ?? emailName,
        email: authUser.email,
        role: 'client',
        clientRole: userProfile.clientRole ?? 'Full Access',
        avatar: userProfile.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`,
      }
    : {
        id: '',
        name: 'Klien',
        email: '',
        role: 'client',
        clientRole: 'Full Access',
        avatar: '',
      };

  return (
    <AppContext.Provider value={{
      user,
      project: projectData,
      team: teamData,
      phases: phasesData,
      activities: activitiesData,
      documents: documentsData,
      gapFindings: gapFindingsData,
      crossReferenceClaims: crossRefData,
      draftSections: draftSectionsData,
      draftComments: draftCommentsData,
      deliverables: deliverablesData,
      timeSeriesMetrics: timeSeriesData,
      faqs: faqsData,
      messages,
      toasts,
      loadingMessages,
      loadingProject,
      addToast,
      removeToast,
      updateFindingStatus,
      sendMessage,
      approveSection,
      fetchMessages,
      updateUserProfile,
      logActivity,
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error'   ? 'bg-red-600'     : 'bg-blue-600'
          }`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
