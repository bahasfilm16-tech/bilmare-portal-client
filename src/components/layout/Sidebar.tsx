import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X, LayoutDashboard, FolderOpen, ListTodo, AlertTriangle,
  GitCompare, FileEdit, DownloadCloud, History,
  HelpCircle, MessageSquare, Settings, UserCircle, LogOut
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/document-vault', label: 'Document Vault', icon: FolderOpen },
  { path: '/project-tracker', label: 'Project Tracker', icon: ListTodo },
  { path: '/gap-register', label: 'Gap Register', icon: AlertTriangle },
  { path: '/cross-reference', label: 'Cross-Reference', icon: GitCompare },
  { path: '/draft-review', label: 'Draft Review', icon: FileEdit },
  { path: '/deliverables', label: 'Deliverables', icon: DownloadCloud },
  { path: '/time-series', label: 'Time-Series', icon: History },
  { path: '/faq-databook', label: 'FAQ Databook', icon: HelpCircle },
  { path: '/communication', label: 'Communication', icon: MessageSquare },
  { path: '/admin', label: 'Engagement & Admin', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { gapFindings, user } = useAppContext();
  const openFindingsCount = gapFindings.filter(f => f.status === 'Open').length;
  const avatarSrc = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="w-56 bg-white dark:bg-[#0F0F18] flex flex-col h-screen border-r border-slate-100 dark:border-white/[0.05]">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">B</span>
            </div>
            <h1 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Bilmare</h1>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5 ml-8 font-medium tracking-widest uppercase">Client Portal</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:bg-white/[0.05] mx-4" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-600 tracking-widest uppercase px-2 mb-2">Menu</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[12px] font-medium group relative ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-800 dark:hover:text-slate-300'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r-full" />
                      )}
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.path === '/gap-register' && openFindingsCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {openFindingsCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="h-px bg-slate-100 dark:bg-white/[0.05] mx-4" />
      <div className="px-3 py-3 space-y-0.5">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-[12px] font-medium ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-800 dark:hover:text-slate-300'
            }`
          }
        >
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-4 h-4 rounded-full object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
            }}
          />
          <span className="flex-1 truncate">{user.name}</span>
          <UserCircle className="w-3 h-3 shrink-0 opacity-40" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-400 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Keluar</span>
        </button>

        <p className="text-[10px] text-slate-300 dark:text-slate-700 text-center pt-1">&copy; 2025 Bilmare</p>
      </div>
    </aside>
  );
};
