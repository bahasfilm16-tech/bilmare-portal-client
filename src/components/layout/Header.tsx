import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Menu, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, project } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
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
    <header className="h-12 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between px-4 md:px-5 sticky top-0 z-30 gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-400 shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[220px] md:max-w-none">
            {project?.name ?? '—'}
          </span>
          {project?.tier && (
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline tracking-wide uppercase">{project.tier}</span>
          )}
          {project?.status && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${
              project.status === 'At Risk'
                ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400'
                : project.status === 'On Track'
                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
            }`}>
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-slate-400 dark:text-slate-500 transition-colors"
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light'
            ? <Moon className="w-4 h-4" />
            : <Sun className="w-4 h-4" />
          }
        </button>

        {/* Bell */}
        <button className="relative p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-slate-400 dark:text-slate-500 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] px-2 py-1.5 rounded-lg transition-colors"
          >
            <img
              src={avatarSrc}
              alt={user?.name ?? 'User'}
              className="w-6 h-6 rounded-full border border-black/10 dark:border-white/10 shrink-0 object-cover bg-slate-100 dark:bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;
              }}
            />
            <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300 hidden sm:inline truncate max-w-[90px]">
              {user?.name ?? '—'}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-10 z-50 w-48 bg-white dark:bg-[#1C1C2A] backdrop-blur-xl rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-black/[0.06] dark:border-white/[0.08] py-1 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06]">
                <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{user?.name ?? '—'}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email ?? ''}</p>
              </div>
              <div className="py-1 px-1">
                <button
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                  onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Profil Saya
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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
