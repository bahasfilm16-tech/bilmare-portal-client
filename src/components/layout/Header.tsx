import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Menu, Sun, Moon, FileText, AlertTriangle, MessageSquare, Download, CheckCircle2, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  onMenuClick?: () => void;
}

const getNotifIcon = (type: string) => {
  switch (type) {
    case 'document': return <FileText className="w-3.5 h-3.5 text-[#635BFF]" />;
    case 'finding': return <AlertTriangle className="w-3.5 h-3.5 text-[#E84E0F]" />;
    case 'comment': return <MessageSquare className="w-3.5 h-3.5 text-[#635BFF]" />;
    case 'deliverable': return <Download className="w-3.5 h-3.5 text-[#09825D]" />;
    case 'status': return <CheckCircle2 className="w-3.5 h-3.5 text-[#09825D]" />;
    default: return <Clock className="w-3.5 h-3.5 text-[#8792A2]" />;
  }
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, project, activities } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<number>(() => {
    return parseInt(localStorage.getItem('bilmare_notif_read') ?? '0', 10);
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const recentNotifs = activities.slice(0, 8);
  const unreadCount = recentNotifs.filter(a => a.timestamp.getTime() > lastReadAt).length;

  const handleOpenNotif = () => {
    setIsNotifOpen(v => {
      if (!v) {
        const now = Date.now();
        setLastReadAt(now);
        localStorage.setItem('bilmare_notif_read', String(now));
      }
      return !v;
    });
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = 'https://bilmare.vercel.app/login';
  };

  const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  return (
    <header className="h-[52px] bg-white dark:bg-[#0F0F18] border-b border-[#E3E8EF] dark:border-white/[0.06] flex items-center justify-between px-5 sticky top-0 z-30 gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-[6px] hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] text-[#697386] dark:text-slate-400 shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-[#1A1F36] dark:text-white truncate max-w-[140px] sm:max-w-[220px] md:max-w-none tracking-[-0.01em]">
            {project?.name ?? '—'}
          </span>
          {project?.tier && (
            <span className="text-[11px] font-medium text-[#697386] dark:text-slate-500 hidden sm:inline px-2 py-0.5 rounded-full border border-[#E3E8EF] dark:border-white/[0.08] bg-transparent">
              {project.tier}
            </span>
          )}
          {project?.status && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${
              project.status === 'At Risk'
                ? 'bg-[#FFF0F3] dark:bg-[#DF1B41]/10 text-[#DF1B41] dark:text-red-400'
                : project.status === 'On Track'
                ? 'bg-[#EDFAF4] dark:bg-emerald-500/10 text-[#09825D] dark:text-emerald-400'
                : 'bg-[#FFF5EB] dark:bg-amber-500/10 text-[#C44C08] dark:text-amber-400'
            }`}>
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[6px] hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] text-[#8792A2] dark:text-slate-500 transition-colors"
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotif}
            className="relative p-2 rounded-[6px] hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] text-[#8792A2] dark:text-slate-500 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-[5px] right-[5px] min-w-[14px] h-[14px] bg-[#635BFF] text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-[46px] z-50 w-80 bg-white dark:bg-[#1A1A28] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-black/40 border border-[#E3E8EF] dark:border-white/[0.08] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E3E8EF] dark:border-white/[0.06] flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#1A1F36] dark:text-white">Notifikasi</p>
                {recentNotifs.length > 0 && (
                  <span className="text-[11px] text-[#8792A2] dark:text-slate-500">{recentNotifs.length} terbaru</span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {recentNotifs.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-6 h-6 text-[#C0CADB] dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-[12px] text-[#8792A2] dark:text-slate-600">Belum ada aktivitas.</p>
                  </div>
                ) : (
                  recentNotifs.map(notif => {
                    const isUnread = notif.timestamp.getTime() > lastReadAt;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-[#F6F9FC] dark:border-white/[0.04] last:border-0 ${
                          isUnread ? 'bg-[#F0EFFE]/60 dark:bg-[#635BFF]/5' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-[#F6F9FC] dark:bg-white/[0.06] border border-[#E3E8EF] dark:border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-[#1A1F36] dark:text-slate-200 leading-snug">{notif.description}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] shrink-0" />}
                            <p className="text-[10px] text-[#8792A2] dark:text-slate-600">
                              {notif.actor} · {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-[#E3E8EF] dark:border-white/[0.06]">
                <button
                  onClick={() => { setIsNotifOpen(false); navigate('/'); }}
                  className="text-[11px] text-[#635BFF] dark:text-[#8B85FF] hover:underline font-medium"
                >
                  Lihat semua di Project Overview →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2 hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] px-2.5 py-1.5 rounded-[6px] transition-colors"
          >
            <img
              src={avatarSrc}
              alt={user?.name ?? 'User'}
              className="w-6 h-6 rounded-full border border-[#E3E8EF] dark:border-white/10 shrink-0 object-cover bg-[#F6F9FC] dark:bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;
              }}
            />
            <span className="text-[13px] font-medium text-[#1A1F36] dark:text-slate-300 hidden sm:inline truncate max-w-[90px]">
              {user?.name ?? '—'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8792A2] transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[46px] z-50 w-48 bg-white dark:bg-[#1A1A28] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-black/40 border border-[#E3E8EF] dark:border-white/[0.08] py-1 overflow-hidden">
              <div className="px-3.5 py-3 border-b border-[#E3E8EF] dark:border-white/[0.06]">
                <p className="text-[13px] font-semibold text-[#1A1F36] dark:text-white truncate">{user?.name ?? '—'}</p>
                <p className="text-[11px] text-[#8792A2] dark:text-slate-500 truncate mt-0.5">{user?.email ?? ''}</p>
              </div>
              <div className="py-1 px-1">
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#1A1F36] dark:text-slate-300 hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] rounded-[6px] transition-colors"
                  onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                >
                  <User className="w-3.5 h-3.5 text-[#8792A2]" />
                  Profil Saya
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#DF1B41] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {loggingOut ? 'Keluar...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
