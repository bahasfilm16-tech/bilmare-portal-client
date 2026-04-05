import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  ListTodo,
  AlertTriangle,
  GitCompare,
  FileEdit,
  DownloadCloud,
  History,
  HelpCircle,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

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

export const Sidebar = () => {
  const { gapFindings } = useAppContext();
  const openFindingsCount = gapFindings.filter(f => f.status === 'Open').length;

  return (
    <aside className="w-60 bg-[#f5f5f7] text-slate-700 flex flex-col h-screen sticky top-0 border-r border-black/[0.06]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-black/[0.06]">
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Bilmare</h1>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium tracking-widest uppercase">Client Portal</p>
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

      <div className="px-5 py-4 border-t border-black/[0.06]">
        <p className="text-[11px] text-slate-400 text-center">&copy; 2025 Bilmare</p>
      </div>
    </aside>
  );
};
