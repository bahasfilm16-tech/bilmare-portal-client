// ─── Auth & User ──────────────────────────────────────────────────────────────

export type ClientRole = 'Full Access' | 'Review Only' | 'Document Submitter' | 'client';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  clientRole: ClientRole;
  avatar: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  clientId: string;
  tier: string;
  tierLabel: string;
  status: string;
  statusReason: string;
  deadlineOJK: Date | null;
  rupsDate: Date | null;
  currentPhase: number;
  overallProgress: number;
  contractValue: number;
  startDate: Date;
  scope: string;
  scopeNotes: string;
  engagementLetterStatus: string;
  publicationReadiness: string;
  billingMilestones: BillingMilestone[];
  teamIds: string[];
  leadAnalystId: string;
}

export interface BillingMilestone {
  label: string;
  amount: number;
  status: string;
  dueDate?: string;
}

// ─── Phase & Activity ─────────────────────────────────────────────────────────

export interface Phase {
  id: string | number;
  name: string;
  status: string;
  targetDate: Date | null;
  actualDate: Date | null;
}

export interface Activity {
  id: string;
  type: 'document' | 'finding' | 'draft' | 'deliverable' | 'comment' | 'status' | string;
  description: string;
  actor: string;
  timestamp: Date;
}

// ─── Gap Register ─────────────────────────────────────────────────────────────

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'Open' | 'In Resolution' | 'Client Acknowledged' | 'Resolved';

export interface GapFinding {
  id: string;
  riskLevel: RiskLevel;
  report: string;
  section: string;
  description: string;
  type: string;
  status: FindingStatus;
  dateFound: Date;
  detail: string;
  recommendation: string;
  clientResponse: string;
}

// ─── Cross Reference ──────────────────────────────────────────────────────────

export type CrossRefStatus = 'Verified' | 'Unverified' | 'Mismatch' | 'Confirmed';

export interface CrossReference {
  id: string;
  claim: string;
  report: string;
  category: string;
  sourceDoc: string;
  sourcePage: string;
  verificationDate: Date;
  verifier: string;
  status: CrossRefStatus;
  currentYearValue: string;
  lastYearValue: string;
  lastYearSource: string;
}

// ─── Draft Review ─────────────────────────────────────────────────────────────

export type SectionStatus = 'Approved' | 'Under Review' | 'Needs Client Input' | string;
export type CommentStatus = 'Open' | 'Resolved';

export interface DraftSection {
  id: string;
  report: string;
  name: string;
  status: SectionStatus;
  readiness: string;
  content: string;
  version: string;
}

export interface DraftComment {
  id: string;
  sectionId: string;
  author: string;
  text: string;
  status: CommentStatus;
  timestamp: Date;
}

// ─── Deliverables ─────────────────────────────────────────────────────────────

export type DeliverableStatus = 'Ready for Download' | 'In Preparation' | 'Pending' | string;

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  status: DeliverableStatus;
  dateAvailable: Date | null;
  progress: number;
}

// ─── Time Series ──────────────────────────────────────────────────────────────

export interface TimeSeriesMetric {
  id: string;
  name: string;
  definition: string;
  unit: string;
  methodology: string;
  yearEffective: number;
  data: Record<string, number | string>;
  category: string;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  reference: string;
  sensitivity: 'Normal' | 'Sensitive' | string;
  status: 'Draft' | 'Published' | string;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: Date;
  isBilmare: boolean;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
}

// ─── Documents (raw DB row — no mapper in context) ────────────────────────────

export interface DbDocument {
  id: string;
  project_id: string;
  document_name: string;
  doc_type: string;
  category: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  status: 'Received' | 'Active' | 'Needs Clarification' | 'Processing' | string;
  version: string;
  upload_date: string;
  clarification: string | null;
  created_at: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
