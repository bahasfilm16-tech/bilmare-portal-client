import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProjectOverview } from './pages/ProjectOverview';
import { DocumentVault } from './pages/DocumentVault';
import { ProjectTracker } from './pages/ProjectTracker';
import { GapRegister } from './pages/GapRegister';
import { CrossReference } from './pages/CrossReference';
import { DraftReview } from './pages/DraftReview';
import { Deliverables } from './pages/Deliverables';
import { TimeSeries } from './pages/TimeSeries';
import { FAQ } from './pages/FAQ';
import { CommunicationHub } from './pages/CommunicationHub';
import { EngagementAdmin } from './pages/EngagementAdmin';
import { Profile } from './pages/Profile';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState<any>(undefined);
  const [initializing, setInitializing] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    let listenerActive = false;

    const init = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          window.history.replaceState({}, document.title, window.location.pathname);

          if (!error && data.session) {
            setSession(data.session);
            if (type === 'invite') setNeedsPassword(true);
            setInitializing(false);
            listenerActive = true;
            return;
          }
        }
      }

      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        window.history.replaceState({}, document.title, window.location.pathname);
        if (!error && data.session) {
          setSession(data.session);
          setInitializing(false);
          listenerActive = true;
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setInitializing(false);
      listenerActive = true;
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!listenerActive) return;
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[#F6F7FB] dark:bg-[#0D0D12] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Loading...</span>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  if (needsPassword) {
    return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<SetPassword onDone={() => setNeedsPassword(false)} />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<ProjectOverview />} />
              <Route path="document-vault" element={<DocumentVault />} />
              <Route path="project-tracker" element={<ProjectTracker />} />
              <Route path="gap-register" element={<GapRegister />} />
              <Route path="cross-reference" element={<CrossReference />} />
              <Route path="draft-review" element={<DraftReview />} />
              <Route path="deliverables" element={<Deliverables />} />
              <Route path="time-series" element={<TimeSeries />} />
              <Route path="faq-databook" element={<FAQ />} />
              <Route path="communication" element={<CommunicationHub />} />
              <Route path="admin" element={<EngagementAdmin />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
