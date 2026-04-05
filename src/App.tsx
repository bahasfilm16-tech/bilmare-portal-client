import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState<any>(undefined);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let listenerActive = false;

    const init = async () => {
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
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
  );
}

export default App;
