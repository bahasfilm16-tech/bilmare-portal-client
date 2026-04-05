import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { currentUser, bilmareTeam, phases as mockPhases, activities as mockActivities, documents, tasks as mockTasks, gapFindings as mockGapFindings, crossReferenceClaims as mockCrossRef, draftSections as mockDraftSections, draftComments as mockDraftComments, deliverables as mockDeliverables, timeSeriesMetrics as mockTimeSeries, faqs as mockFaqs, users } from '../data/mockData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  user: any;
  project: any;
  team: any[];
  phases: any[];
  activities: any[];
  documents: typeof documents;
  tasks: any[];
  gapFindings: any[];
  crossReferenceClaims: any[];
  draftSections: any[];
  draftComments: any[];
  deliverables: any[];
  timeSeriesMetrics: any[];
  faqs: any[];
  messages: any[];
  users: typeof users;
  toasts: Toast[];
  loadingMessages: boolean;
  loadingProject: boolean;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  updateFindingStatus: (id: string, newStatus: string) => void;
  addDocument: (doc: any) => void;
  sendMessage: (text: string) => Promise<void>;
  approveSection: (id: string) => void;
  fetchMessages: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const mapProject = (p: any) => ({
  id: p.id,
  name: p.name,
  clientId: p.client_id,
  tier: p.tier_label ?? p.tier ?? 'Tier 1',
  status: p.status ?? 'On Track',
  statusReason: p.status_reason ?? '',
  deadlineOJK: p.deadline_ojk ? new Date(p.deadline_ojk) : new Date('2025-04-30'),
  rupsDate: p.rups_date ? new Date(p.rups_date) : null,
  currentPhase: p.current_phase ?? 1,
  overallProgress: p.overall_progress ?? 0,
  contractValue: p.contract_value ?? 0,
  startDate: p.start_date ? new Date(p.start_date) : new Date(),
  scope: p.scope ?? '',
  scopeNotes: p.scope_exclusions ?? '',
  engagementLetterStatus: p.engagement_letter_status ?? 'Pending',
  publicationReadiness: p.publication_readiness ?? 'Not Yet Assessed',
  billingMilestones: p.billing_milestones ?? [],
  teamIds: p.team_ids ?? [],
  leadAnalystId: p.lead_analyst_id ?? '',
});

const mapTeamMember = (t: any) => ({
  id: t.id,
  name: t.name,
  role: t.title ?? t.role ?? '',
  specialty: t.specialty ?? '',
  avatar: t.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`,
});

const mapPhase = (p: any) => ({
  id: p.id,
  name: p.name,
  status: p.status,
  targetDate: p.target_date ? new Date(p.target_date) : null,
  actualDate: p.actual_date ? new Date(p.actual_date) : null,
});

const mapActivity = (a: any) => ({
  id: a.id,
  type: a.type,
  description: a.description,
  actor: a.actor,
  timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
});

const mapFinding = (f: any) => ({
  id: f.id,
  riskLevel: f.risk_level,
  report: f.report,
  section: f.section,
  description: f.description,
  type: f.type,
  status: f.status,
  dateFound: f.date_found ? new Date(f.date_found) : new Date(),
  detail: f.detail,
  recommendation: f.recommendation,
});

const mapCrossRef = (c: any) => ({
  id: c.id,
  claim: c.claim ?? '',
  report: c.report ?? '',
  category: c.category ?? '',
  sourceDoc: c.source_doc ?? '',
  sourcePage: c.source_page ?? '',
  verificationDate: c.verification_date ? new Date(c.verification_date) : new Date(),
  verifier: c.verifier ?? '',
  status: c.status ?? 'Unverified',
  currentYearValue: c.current_year_value ?? '',
  lastYearValue: c.last_year_value ?? '',
  lastYearSource: c.last_year_source ?? '',
});

const mapDraftSection = (s: any) => ({
  id: s.id,
  report: s.report ?? '',
  name: s.name ?? '',
  status: s.status ?? '',
  readiness: s.readiness ?? '',
  content: s.content ?? '',
  version: s.version ?? 'v1',
});

const mapDraftComment = (c: any) => ({
  id: c.id,
  sectionId: c.section_id ?? '',
  author: c.author ?? '',
  text: c.text ?? c.comment_text ?? '',
  status: c.status ?? 'Open',
  timestamp: c.timestamp ? new Date(c.timestamp) : new Date(),
});

const mapDeliverable = (d: any) => ({
  id: d.id,
  name: d.name ?? '',
  description: d.description ?? '',
  status: d.status ?? 'Pending',
  dateAvailable: d.date_available ? new Date(d.date_available) : null,
  progress: d.progress ?? 0,
});

const mapTimeSeries = (m: any) => ({
  id: m.id,
  name: m.name ?? '',
  definition: m.definition ?? '',
  unit: m.unit ?? '',
  methodology: m.methodology ?? '',
  yearEffective: m.year_effective ?? 2020,
  data: m.data ?? {},
  category: m.category ?? '',
});

const mapFaq = (f: any) => ({
  id: f.id,
  category: f.category ?? '',
  question: f.question ?? '',
  answer: f.answer ?? '',
  reference: f.reference ?? '',
  sensitivity: f.sensitivity ?? 'Normal',
  status: f.status ?? 'Draft',
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectData, setProjectData] = useState<any>(null);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [phasesData, setPhasesData] = useState<any[]>([]);
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [gapFindingsData, setGapFindingsData] = useState<any[]>([]);
  const [crossRefData, setCrossRefData] = useState<any[]>([]);
  const [draftSectionsData, setDraftSectionsData] = useState<any[]>([]);
  const [draftCommentsData, setDraftCommentsData] = useState<any[]>([]);
  const [deliverablesData, setDeliverablesData] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [faqsData, setFaqsData] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [state, setState] = useState({
    documents,
    tasks: mockTasks,
    users,
    toasts: [] as Toast[],
  });

  useEffect(() => {
    const loadAll = async () => {
      setLoadingProject(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      if (!sessionUser) { setLoadingProject(false); return; }
      setAuthUser(sessionUser);

      const { data: allProjects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let projectRow = allProjects;

      if (!projectRow) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', sessionUser.email)
          .single();

        if (profile?.company) {
          const { data: clientRow } = await supabase
            .from('clients')
            .select('id')
            .ilike('name', `%${profile.company}%`)
            .single();

          if (clientRow?.id) {
            const { data: proj } = await supabase
              .from('projects')
              .select('*')
              .eq('client_id', clientRow.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            projectRow = proj;
          }
        }
      }

      if (projectRow) {
        setProjectData(mapProject(projectRow));
        setActiveProjectId(projectRow.id);
        const pid = projectRow.id;

        // Fetch semua data paralel
        const [
          phaseRes, activityRes, findingRes, crossRes,
          sectionRes, commentRes, deliverableRes, timeRes, faqRes, teamRes
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
        ]);

        if (phaseRes.data?.length) setPhasesData(phaseRes.data.map(mapPhase));
        if (activityRes.data?.length) setActivitiesData(activityRes.data.map(mapActivity));
        if (findingRes.data?.length) setGapFindingsData(findingRes.data.map(mapFinding));
        if (crossRes.data?.length) setCrossRefData(crossRes.data.map(mapCrossRef));
        if (sectionRes.data?.length) setDraftSectionsData(sectionRes.data.map(mapDraftSection));
        if (commentRes.data?.length) setDraftCommentsData(commentRes.data.map(mapDraftComment));
        if (deliverableRes.data?.length) setDeliverablesData(deliverableRes.data.map(mapDeliverable));
        if (timeRes.data?.length) setTimeSeriesData(timeRes.data.map(mapTimeSeries));
        if (faqRes.data?.length) setFaqsData(faqRes.data.map(mapFaq));
        if (teamRes.data?.length) setTeamData(teamRes.data.map(mapTeamMember));
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
      setMessages(data.map((m: any) => ({
        id: m.id,
        sender: m.sender ?? '',
        avatar: m.avatar ?? '',
        text: m.text ?? '',
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(m.inserted_at),
        isBilmare: m.is_bilmare ?? false,
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

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({ ...prev, toasts: [...prev.toasts, { id, message, type }] }));
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  };

  const updateFindingStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('gap_findings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) { addToast('Gagal update status: ' + error.message, 'error'); return; }

    setGapFindingsData(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    addToast(`Status temuan ${id} berhasil diperbarui.`);
  };

  const addDocument = (doc: any) => {
    const newDoc = { id: `d_${Date.now()}`, ...doc, uploadDate: new Date(), status: 'Received', version: 'v1' };
    setState(prev => ({ ...prev, documents: [newDoc, ...prev.documents] }));
    addToast('Dokumen berhasil diunggah.');
  };

  const sendMessage = async (text: string) => {
    if (!activeProjectId) return;
    const senderName = authUser?.email?.split('@')[0] ?? currentUser.name;
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
  };

  const user = authUser ? {
    ...currentUser,
    name: authUser.email?.split('@')[0] ?? currentUser.name,
    email: authUser.email,
  } : currentUser;

  const project = projectData ?? {
    id: 'mock', name: 'Laporan Tahunan 2024', tier: 'Tier 1',
    status: 'On Track', statusReason: '',
    deadlineOJK: new Date('2025-04-30'), rupsDate: new Date('2025-05-15'),
    currentPhase: 1, overallProgress: 0, contractValue: 0,
    startDate: new Date(), scope: '', billingMilestones: [], teamIds: [],
  };

  return (
    <AppContext.Provider value={{
      ...state,
      user,
      project,
      team: teamData.length > 0 ? teamData : bilmareTeam,
      phases: phasesData.length > 0 ? phasesData : mockPhases,
      activities: activitiesData.length > 0 ? activitiesData : mockActivities,
      gapFindings: gapFindingsData.length > 0 ? gapFindingsData : mockGapFindings,
      crossReferenceClaims: crossRefData.length > 0 ? crossRefData : mockCrossRef,
      draftSections: draftSectionsData.length > 0 ? draftSectionsData : mockDraftSections,
      draftComments: draftCommentsData.length > 0 ? draftCommentsData : mockDraftComments,
      deliverables: deliverablesData.length > 0 ? deliverablesData : mockDeliverables,
      timeSeriesMetrics: timeSeriesData.length > 0 ? timeSeriesData : mockTimeSeries,
      faqs: faqsData.length > 0 ? faqsData : mockFaqs,
      messages,
      loadingMessages,
      loadingProject,
      addToast,
      removeToast,
      updateFindingStatus,
      addDocument,
      sendMessage,
      approveSection,
      fetchMessages,
    }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {state.toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
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