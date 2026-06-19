import { useState } from 'react';
import { Shell } from './components/Shell';
import { AppProvider, useAppStore } from './store/useAppStore';
import { AdminPage } from './pages/AdminPage';
import { ControlPage } from './pages/ControlPage';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';

type View = 'home' | 'control' | 'history' | 'admin' | 'settings';

function AppContent() {
  const { user } = useAppStore();
  const [activeView, setActiveView] = useState<View>('home');

  if (!user) return <LoginPage />;

  return (
    <Shell activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'home' && <HomePage />}
      {activeView === 'control' && <ControlPage />}
      {activeView === 'history' && <HistoryPage />}
      {activeView === 'admin' && <AdminPage />}
      {activeView === 'settings' && <SettingsPage />}
    </Shell>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
