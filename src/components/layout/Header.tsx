import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, project } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 gap-3">
      {/* Left: hamburger + project info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — hanya mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-black/[0.04] text-slate-500 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
            {project?.name ?? '—'}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">{project?.tier ?? ''}</span>
          {project?.status && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline ${
              project.status === 'At Risk'
                ? 'bg-red-100 text-red-600'
                : project.status === 'On Track'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors p-1">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 hover:bg-black/[0.04] px-2 py-1.5 rounded-lg transition-colors"
          >
            <img
              src={user?.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt={user?.name ?? 'User'}
              className="w-7 h-7 rounded-full border border-black/10 shrink-0"
            />
            <span className="text-[13px] font-medium text-slate-800 hidden sm:inline truncate max-w-[100px]">
              {user?.name ?? '—'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-11 z-50 w-52 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-black/[0.06] py-1.5 overflow-hidden">
              <div className="px-4 py-3 border-b border-black/[0.06]">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{user?.name ?? '—'}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email ?? user?.role ?? ''}</p>
              </div>
              <div className="py-1 px-1.5">
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-700 hover:bg-black/[0.04] rounded-lg transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profil Saya
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
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
