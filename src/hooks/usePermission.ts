import { useAppContext, ClientRole } from '../context/AppContext';

/**
 * Permission matrix per client role.
 *
 * Full Access     — semua operasi
 * Review Only     — baca + komentar, tidak bisa upload atau approve
 * Document Submitter — hanya upload dokumen, tidak bisa komentar atau approve
 */
const PERMISSIONS: Record<ClientRole, Record<string, boolean>> = {
  'Full Access': {
    uploadDocument:      true,
    approveSection:      true,
    addComment:          true,
    resolveComment:      true,
    respondToFinding:    true,
    sendMessage:         true,
    manageUsers:         true,
    changeUserRole:      true,
    requestArchival:     true,
    downloadDeliverable: true,
  },
  'Review Only': {
    uploadDocument:      false,
    approveSection:      false,
    addComment:          true,
    resolveComment:      true,
    respondToFinding:    true,
    sendMessage:         true,
    manageUsers:         false,
    changeUserRole:      false,
    requestArchival:     false,
    downloadDeliverable: true,
  },
  'Document Submitter': {
    uploadDocument:      true,
    approveSection:      false,
    addComment:          false,
    resolveComment:      false,
    respondToFinding:    false,
    sendMessage:         true,
    manageUsers:         false,
    changeUserRole:      false,
    requestArchival:     false,
    downloadDeliverable: true,
  },
  // Fallback — sama dengan Full Access (untuk user lama tanpa role)
  'client': {
    uploadDocument:      true,
    approveSection:      true,
    addComment:          true,
    resolveComment:      true,
    respondToFinding:    true,
    sendMessage:         true,
    manageUsers:         true,
    changeUserRole:      true,
    requestArchival:     true,
    downloadDeliverable: true,
  },
};

export type Permission = keyof typeof PERMISSIONS['Full Access'];

export function usePermission() {
  const { user } = useAppContext();
  const role = user.clientRole ?? 'Full Access';
  const matrix = PERMISSIONS[role] ?? PERMISSIONS['Full Access'];

  const can = (action: Permission): boolean => matrix[action] ?? false;

  return { can, role };
}
