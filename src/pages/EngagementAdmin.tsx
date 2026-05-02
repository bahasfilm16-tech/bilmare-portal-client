import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Users, Settings, Shield, Key, Mail, Building,
  CheckCircle2, Loader2, RefreshCw, X, AlertTriangle, FileText
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { usePermission } from '../hooks/usePermission';
import { supabase } from '../supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';

interface ClientUser {
  id: string;
  name: string;
  title: string;
  email: string;
  role: string;
  status: string;
  lastAccess: Date | null;
}

const mapUser = (u: any): ClientUser => ({
  id: u.id, name: u.name ?? '', title: u.title ?? '', email: u.email ?? '',
  role: u.role ?? 'Review Only', status: u.status ?? 'Pending',
  lastAccess: u.last_access ? new Date(u.last_access) : null,
});

const ROLES = ['Full Access', 'Review Only', 'Document Submitter'];

export const EngagementAdmin = () => {
  const { project, addToast } = useAppContext();
  const { can } = usePermission();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsUser, setSettingsUser] = useState<ClientUser | null>(null);
  const [newRole, setNewRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [archivalOpen, setArchivalOpen] = useState(false);
  const [archivalConfirm, setArchivalConfirm] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [securitySettings, setSecuritySettings] = useState<{ twoFa: boolean; emailNotif: boolean }>(() => {
    try {
      const stored = localStorage.getItem(`bilmare_security_${project?.id ?? 'default'}`);
      return stored ? JSON.parse(stored) : { twoFa: true, emailNotif: true };
    } catch { return { twoFa: true, emailNotif: true }; }
  });

  const handleToggleSecurity = (key: 'twoFa' | 'emailNotif') => {
    const next = { ...securitySettings, [key]: !securitySettings[key] };
    setSecuritySettings(next);
    localStorage.setItem(`bilmare_security_${project?.id ?? 'default'}`, JSON.stringify(next));
    addToast('Preferensi keamanan disimpan. Tim Bilmare akan dikonfigurasi sesuai pilihan Anda.', 'success');
  };

  const fetchUsers = async () => {
    if (!project?.id) return;
    setLoading(true);
    const { data, error } = await supabase.from('client_users').select('*').eq('project_id', project.id).order('name', { ascending: true });
    if (!error && data) setUsers(data.map(mapUser));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [project?.id]);

  const handleResendInvite = async (user: ClientUser) => {
    setResending(user.id);
    const portalTimUrl = import.meta.env.VITE_PORTAL_TIM_URL;
    if (!portalTimUrl) {
      addToast('VITE_PORTAL_TIM_URL belum dikonfigurasi.', 'error');
      setResending(null);
      return;
    }
    try {
      const res = await fetch(`${portalTimUrl}/api/invite-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          projectId: project?.id,
          resend: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengirim undangan');
      addToast(`Undangan dikirim ulang ke ${user.email}`, 'success');
      await fetchUsers();
    } catch (err: any) {
      addToast('Gagal mengirim undangan: ' + err.message, 'error');
    } finally { setResending(null); }
  };

  const handleSaveRole = async () => {
    if (!settingsUser || !newRole) return;
    setSavingRole(true);
    try {
      const { error } = await supabase.from('client_users').update({ role: newRole }).eq('id', settingsUser.id);
      if (error) throw error;
      addToast(`Role ${settingsUser.name} diubah ke ${newRole}`, 'success');
      setSettingsUser(null);
      await fetchUsers();
    } catch (err: any) {
      addToast('Gagal mengubah role: ' + err.message, 'error');
    } finally { setSavingRole(false); }
  };

  const handleArchival = async () => {
    if (archivalConfirm !== 'ARSIPKAN') return;
    setArchiving(true);
    try {
      const { error } = await supabase.from('projects').update({ status: 'Archived', status_reason: 'Diarsipkan atas permintaan klien.' }).eq('id', project.id);
      if (error) throw error;
      addToast('Permintaan pengarsipan berhasil dikirim.', 'success');
      setArchivalOpen(false);
    } catch (err: any) {
      addToast('Gagal mengarsipkan: ' + err.message, 'error');
    } finally { setArchiving(false); }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Full Access': return <Badge variant="success">Full Access</Badge>;
      case 'Review Only': return <Badge variant="warning">Review Only</Badge>;
      case 'Document Submitter': return <Badge variant="secondary">Submitter</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Engagement & Admin</h1>
          <p className="text-slate-500 mt-1">Manage project settings, team access, and security.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchUsers}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building className="w-5 h-5 text-indigo-600" /> Project Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Project Name</p><p className="text-sm font-medium text-slate-900">{project.name}</p></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Service Tier</p><Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">{project.tier}</Badge></div>
            <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</p><Badge variant={project.status === 'At Risk' ? 'destructive' : 'success'} className="gap-1"><CheckCircle2 className="w-3 h-3" /> {project.status}</Badge></div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Key Dates</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500">Start Date</p><p className="text-sm font-medium text-slate-900">{project.startDate ? format(new Date(project.startDate), 'dd MMM yyyy') : '—'}</p></div>
                <div><p className="text-xs text-slate-500">OJK Deadline</p><p className="text-sm font-medium text-slate-900">{project.deadlineOJK ? format(new Date(project.deadlineOJK), 'dd MMM yyyy') : '—'}</p></div>
                {project.rupsDate && (<div className="col-span-2"><p className="text-xs text-slate-500">RUPS Date</p><p className="text-sm font-medium text-slate-900">{format(new Date(project.rupsDate), 'dd MMM yyyy')}</p></div>)}
              </div>
            </div>
            {project.scope && (<div className="pt-4 border-t border-slate-100"><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Scope</p><p className="text-xs text-slate-600 leading-relaxed">{project.scope}</p></div>)}
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> User Management</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" /><span className="text-sm text-slate-500">Memuat users...</span></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden sm:table-cell">Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none">{user.email}</p>
                              {/* Show role on mobile */}
                              <div className="sm:hidden mt-1">{getRoleBadge(user.role)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-amber-50 text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-slate-500">{user.lastAccess ? format(user.lastAccess, 'dd MMM yyyy, HH:mm') : '—'}</TableCell>
                        {can('manageUsers') && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {user.status === 'Pending' && (
                                <Button variant="outline" size="sm" onClick={() => handleResendInvite(user)} disabled={resending === user.id} className="text-xs h-8 hidden sm:flex">
                                  {resending === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Resend'}
                                </Button>
                              )}
                              {can('changeUserRole') && (
                                <Button variant="outline" size="sm" className="text-xs h-8 px-2" onClick={() => { setSettingsUser(user); setNewRole(user.role); }} title="Ubah Role">
                                  <Settings className="w-4 h-4 text-slate-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {users.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8 text-sm">Belum ada user terdaftar.</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-600" /> Security & Compliance</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {([
                  { key: 'twoFa' as const, icon: Key, title: 'Two-Factor Authentication (2FA)', desc: 'Wajib 2FA untuk semua anggota project.' },
                  { key: 'emailNotif' as const, icon: Mail, title: 'Email Notifications', desc: 'Kirim ringkasan harian update proyek.' },
                ] as const).map(({ key, icon: Icon, title, desc }) => {
                  const enabled = securitySettings[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/[0.08] rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSecurity(key)}
                        className={`w-10 h-5 rounded-full relative shrink-0 ml-3 transition-colors ${enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        aria-pressed={enabled}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-xl">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Data Retention Policy</h4>
                  <p className="text-xs text-slate-600 mb-4">Data proyek akan diarsipkan secara aman 90 hari setelah proyek selesai. Final deliverables tetap dapat diakses.</p>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setPolicyOpen(true)}><FileText className="w-4 h-4" /> View Full Policy</Button>
                </div>
                {can('requestArchival') && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Danger Zone</h4>
                    <p className="text-xs text-red-700 mb-4">Tindakan ini tidak dapat dibatalkan. Harap berhati-hati.</p>
                    <Button variant="destructive" size="sm" className="w-full" onClick={() => { setArchivalOpen(true); setArchivalConfirm(''); }}>Request Project Archival</Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      {settingsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSettingsUser(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">User Settings</h2>
              <button onClick={() => setSettingsUser(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{settingsUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                <div><p className="font-medium text-slate-900">{settingsUser.name}</p><p className="text-sm text-slate-500">{settingsUser.email}</p></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Full Access: semua fitur · Review Only: hanya lihat · Submitter: hanya upload dokumen</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSettingsUser(null)}>Batal</Button>
                <Button onClick={handleSaveRole} disabled={savingRole} className="gap-2">
                  {savingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingRole ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {policyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPolicyOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Data Retention & Security Policy</h2>
              <button onClick={() => setPolicyOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
              {[
                { title: '1. Penyimpanan Data', content: 'Seluruh data proyek disimpan secara aman di infrastruktur Supabase dengan enkripsi at-rest dan in-transit menggunakan standar AES-256.' },
                { title: '2. Retensi Data', content: 'Data aktif proyek tersimpan selama masa engagement berlangsung. Setelah proyek selesai, data akan diarsipkan selama 90 hari sebelum dihapus permanen, kecuali final deliverables yang tetap tersedia.' },
                { title: '3. Akses & Kontrol', content: 'Akses dikendalikan berbasis role (Full Access, Review Only, Document Submitter). Setiap akses tercatat dalam audit log.' },
                { title: '4. Kerahasiaan', content: 'Seluruh informasi yang dibagikan dalam portal ini bersifat rahasia dan dilindungi oleh perjanjian kerahasiaan (NDA) yang ditandatangani saat engagement dimulai.' },
                { title: '5. Hak Klien', content: 'Klien berhak meminta ekspor data kapan saja, meminta penghapusan data sebelum masa retensi berakhir, dan mengajukan pertanyaan terkait keamanan data kepada tim Bilmare.' },
                { title: '6. Insiden Keamanan', content: 'Dalam hal terjadi insiden keamanan, Bilmare berkomitmen untuk memberitahu klien dalam waktu 72 jam sesuai standar GDPR dan regulasi perlindungan data yang berlaku.' },
              ].map(section => (
                <div key={section.title}><h3 className="font-semibold text-slate-900 mb-2">{section.title}</h3><p className="leading-relaxed text-slate-600">{section.content}</p></div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end"><Button onClick={() => setPolicyOpen(false)}>Tutup</Button></div>
          </div>
        </div>
      )}

      {/* Archival Modal */}
      {archivalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setArchivalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200 flex justify-between items-center bg-red-50">
              <h2 className="text-lg font-bold text-red-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Request Project Archival</h2>
              <button onClick={() => setArchivalOpen(false)} className="p-2 text-red-400 hover:text-red-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-800 font-medium mb-2">⚠️ Tindakan ini tidak dapat dibatalkan!</p><p className="text-xs text-red-700 leading-relaxed">Mengarsipkan proyek akan menonaktifkan akses ke semua fitur portal. Data akan disimpan selama 90 hari sebelum dihapus permanen. Final deliverables tetap dapat diakses.</p></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ketik <span className="font-bold text-red-600">ARSIPKAN</span> untuk konfirmasi:</label>
                <input type="text" value={archivalConfirm} onChange={e => setArchivalConfirm(e.target.value)} placeholder="ARSIPKAN" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setArchivalOpen(false)}>Batal</Button>
                <Button onClick={handleArchival} disabled={archivalConfirm !== 'ARSIPKAN' || archiving} className="gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                  {archiving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {archiving ? 'Mengarsipkan...' : 'Ya, Arsipkan Proyek'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
