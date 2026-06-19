import { BarChart3, Bluetooth, Clock3, Home, Settings, SlidersHorizontal, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';

type View = 'home' | 'control' | 'history' | 'admin' | 'settings';

interface ShellProps {
  activeView: View;
  setActiveView: (view: View) => void;
  children: ReactNode;
}

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'control', label: 'Controle', icon: SlidersHorizontal },
  { id: 'history', label: 'Historico', icon: Clock3 },
  { id: 'admin', label: 'Admin', icon: BarChart3 },
  { id: 'settings', label: 'Ajustes', icon: Settings },
] as const;

export function Shell({ activeView, setActiveView, children }: ShellProps) {
  const { user, online, connectionStatus } = useAppStore();
  return (
    <div className="min-h-screen bg-field-50 text-field-900">
      <header className="sticky top-0 z-20 border-b border-field-100 bg-field-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-field-900 text-white">
              <Bluetooth className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">BLE Control Center</p>
              <p className="text-xs text-field-700">Controle operacional PWA</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm md:flex">
            <span className={`status-dot ${online ? 'bg-signal' : 'bg-safety'}`} />
            <span>{online ? 'Online' : 'Offline'}</span>
            <span className="mx-2 h-5 w-px bg-field-100" />
            <span className={`rounded px-2 py-1 text-xs font-semibold ${connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-700'}`}>
              {connectionStatus}
            </span>
            {user && (
              <>
                <span className="mx-2 h-5 w-px bg-field-100" />
                <UserRound className="h-4 w-4" />
                <span>{user.name}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr]">
        <nav className="hidden rounded-md border border-field-100 bg-white p-2 shadow-panel md:block">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`nav-button ${activeView === item.id ? 'nav-button-active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <main>{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-field-100 bg-white md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${activeView === item.id ? 'text-field-900' : 'text-field-500'}`}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
