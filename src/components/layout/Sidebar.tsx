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
    <aside className="w-[220px] bg-white dark:bg-[#0F0F18] flex flex-col h-screen border-r border-[#E3E8EF] dark:border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-[#635BFF] flex items-center justify-center shrink-0 shadow-sm shadow-[#635BFF]/40">
            <span className="text-white text-[11px] font-bold tracking-tight">B</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-[#1A1F36] dark:text-white tracking-tight leading-none">Bilmare</h1>
            <p className="text-[10px] text-[#8792A2] dark:text-slate-500 font-medium tracking-wide mt-0.5">Client Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] text-[#8792A2]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-[#E3E8EF] dark:bg-white/[0.05] mx-4 mb-2" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[10px] font-semibold text-[#8792A2] dark:text-slate-600 tracking-widest uppercase px-2 mb-1.5">Menu</p>
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
                    `flex items-center gap-3 px-3 py-[7px] rounded-[6px] transition-all text-[13px] font-medium group ${
                      isActive
                        ? 'bg-[#F0EFFE] dark:bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B85FF]'
                        : 'text-[#697386] dark:text-slate-400 hover:bg-[#F6F9FC] dark:hover:bg-white/[0.04] hover:text-[#1A1F36] dark:hover:text-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-[15px] h-[15px] shrink-0 ${
                        isActive
                          ? 'text-[#635BFF] dark:text-[#8B85FF]'
                          : 'text-[#8792A2] dark:text-slate-500 group-hover:text-[#697386] dark:group-hover:text-slate-400'
                      }`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.path === '/gap-register' && openFindingsCount > 0 && (
                        <span className="bg-[#DF1B41] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 tabular-nums">
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
      <div className="h-px bg-[#E3E8EF] dark:bg-white/[0.05] mx-4 mt-1" />
      <div className="px-3 py-3 space-y-0.5">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-[7px] rounded-[6px] transition-all text-[13px] font-medium ${
              isActive
                ? 'bg-[#F0EFFE] dark:bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B85FF]'
                : 'text-[#697386] dark:text-slate-400 hover:bg-[#F6F9FC] dark:hover:bg-white/[0.04] hover:text-[#1A1F36] dark:hover:text-slate-200'
            }`
          }
        >
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-[18px] h-[18px] rounded-full object-cover bg-[#E3E8EF] dark:bg-slate-700 shrink-0 border border-[#E3E8EF] dark:border-white/10"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
            }}
          />
          <span className="flex-1 truncate">{user.name}</span>
          <UserCircle className="w-3.5 h-3.5 shrink-0 text-[#C0CADB] dark:text-slate-600" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-[7px] rounded-[6px] text-[13px] font-medium text-[#697386] dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-[#DF1B41] dark:hover:text-red-400 transition-all"
        >
          <LogOut className="w-[15px] h-[15px] shrink-0" />
          <span>Keluar</span>
        </button>

        <p className="text-[10px] text-[#C0CADB] dark:text-slate-700 text-center pt-1.5">&copy; 2025 Bilmare</p>
      </div>
    </aside>
  );
};
