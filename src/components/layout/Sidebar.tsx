import React from 'react';
import { NavLink } from 'react-router-dom';
import { X,
  LayoutDashboard, FolderOpen, ListTodo, AlertTriangle,
  GitCompare, FileEdit, DownloadCloud, History,
  HelpCircle, MessageSquare, Settings, UserCircle, LogOut
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';

const navItems = [
  { path: '/', label: 'Project Overview', icon: LayoutDashboard },
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const avatarSrc = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  return (
    <aside className="w-60 bg-[#f5f5f7] text-slate-700 flex flex-col h-screen border-r border-black/[0.06]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Bilmare</h1>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium tracking-widest uppercase">Client Portal</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-black/[0.06] text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] font-medium ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm shadow-black/[0.08]'
                        : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.path === '/gap-register' && openFindingsCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {openFindingsCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile + logout */}
      <div className="px-3 py-3 border-t border-black/[0.06] space-y-1">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] font-medium ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm shadow-black/[0.08]'
                : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
            }`
          }
        >
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-5 h-5 rounded-full object-cover bg-slate-200 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
            }}
          />
          <span className="flex-1 truncate">{user.name}</span>
          <UserCircle className="w-3.5 h-3.5 shrink-0 opacity-50" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center pt-1">&copy; 2025 Bilmare</p>
      </div>
    </aside>
  );
};
