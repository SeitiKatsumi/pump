import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppSettings, AppUser, CommandCode, CommandEvent, ConnectionStatus, DeviceRecord, UsageSession } from '../types';
import { ALLOWED_COMMANDS, COMMAND_LABELS } from '../constants/commands';
import * as authService from '../services/authService';
import * as bleService from '../services/bleService';
import * as historyService from '../services/historyService';
import * as settingsService from '../services/settingsService';
import * as syncService from '../services/syncService';

interface AppStore {
  user?: AppUser;
  settings: AppSettings;
  connectionStatus: ConnectionStatus;
  connectedDevice?: DeviceRecord;
  activeSession?: UsageSession;
  commands: CommandEvent[];
  sessions: UsageSession[];
  online: boolean;
  lastSync?: string;
  feedback?: string;
  login: typeof authService.loginUser;
  logout: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: CommandCode, label?: string) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  refreshHistory: () => Promise<void>;
  sync: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const AppContext = createContext<AppStore | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | undefined>();
  const [settings, setSettings] = useState<AppSettings>(settingsService.DEFAULT_SETTINGS);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectedDevice, setConnectedDevice] = useState<DeviceRecord | undefined>();
  const [activeSession, setActiveSession] = useState<UsageSession | undefined>();
  const [commands, setCommands] = useState<CommandEvent[]>([]);
  const [sessions, setSessions] = useState<UsageSession[]>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<string | undefined>(localStorage.getItem('pump-last-sync') ?? undefined);
  const [feedback, setFeedback] = useState<string | undefined>();

  const refreshHistory = useCallback(async () => {
    const [nextCommands, nextSessions] = await Promise.all([historyService.listCommands(), historyService.listSessions()]);
    setCommands(nextCommands);
    setSessions(nextSessions);
    if (activeSession) {
      setActiveSession(nextSessions.find((session) => session.id === activeSession.id));
    }
  }, [activeSession]);

  useEffect(() => {
    Promise.all([authService.getCurrentUser(), settingsService.getSettings()]).then(([nextUser, nextSettings]) => {
      setUser(nextUser);
      setSettings(nextSettings);
      bleService.configureBle(nextSettings);
      setConnectionStatus(bleService.getConnectionStatus());
    });
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const login = useCallback(async (...args: Parameters<typeof authService.loginUser>) => {
    const nextUser = await authService.loginUser(...args);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    authService.logoutUser();
    setUser(undefined);
  }, []);

  const connect = useCallback(async () => {
    if (!user) throw new Error('Identifique o utilizador antes de conectar.');
    setConnectionStatus('searching');
    try {
      const bleDevice = await bleService.connectDevice(settings);
      const device = await historyService.ensureDevice(bleDevice.id, bleDevice.name);
      const session = await historyService.startSession(user, device);
      setConnectedDevice(device);
      setActiveSession(session);
      setConnectionStatus('connected');
      setFeedback('Sessao iniciada');
      await refreshHistory();
    } catch (error) {
      setConnectionStatus(bleService.getConnectionStatus() === 'unsupported' ? 'unsupported' : 'error');
      setFeedback(error instanceof Error ? error.message : 'Falha ao conectar.');
      throw error;
    }
  }, [refreshHistory, settings, user]);

  const disconnect = useCallback(async () => {
    await bleService.disconnectDevice();
    if (activeSession) await historyService.finalizeSession(activeSession.id);
    setActiveSession(undefined);
    setConnectedDevice(undefined);
    setConnectionStatus('disconnected');
    setFeedback('Sessao encerrada');
    await refreshHistory();
  }, [activeSession, refreshHistory]);

  const sendCommand = useCallback(
    async (command: CommandCode, label?: string) => {
      if (!ALLOWED_COMMANDS.includes(command)) throw new Error('Comando nao permitido.');
      if (!user) throw new Error('Identifique o utilizador antes de enviar comandos.');
      if (!connectedDevice || !activeSession) throw new Error('Conecte ao aparelho antes de enviar comandos.');
      try {
        await bleService.sendCommand(command);
        await historyService.recordCommand({
          user,
          device: connectedDevice,
          sessionId: activeSession.id,
          command,
          actionLabel: label ?? (command === 'xx' ? settings.extraActionLabel : COMMAND_LABELS[command]),
          success: true,
        });
        setFeedback(`Comando ${command} enviado`);
      } catch (error) {
        await historyService.recordCommand({
          user,
          device: connectedDevice,
          sessionId: activeSession.id,
          command,
          actionLabel: label,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        });
        setFeedback('Erro no envio do comando');
        throw error;
      } finally {
        await refreshHistory();
      }
    },
    [activeSession, connectedDevice, refreshHistory, settings.extraActionLabel, user],
  );

  const saveSettings = useCallback(async (next: AppSettings) => {
    const saved = await settingsService.saveSettings(next);
    setSettings(saved);
    bleService.configureBle(saved);
  }, []);

  const sync = useCallback(async () => {
    const result = await syncService.syncAll(settings);
    setLastSync(localStorage.getItem('pump-last-sync') ?? undefined);
    setFeedback(result.commands.skipped ? 'Sem API configurada: registros continuam pendentes' : 'Sincronizacao concluida');
    await refreshHistory();
  }, [refreshHistory, settings]);

  const clearHistory = useCallback(async () => {
    await historyService.clearLocalHistory();
    await refreshHistory();
  }, [refreshHistory]);

  const value = useMemo<AppStore>(
    () => ({
      user,
      settings,
      connectionStatus,
      connectedDevice,
      activeSession,
      commands,
      sessions,
      online,
      lastSync,
      feedback,
      login,
      logout,
      connect,
      disconnect,
      sendCommand,
      saveSettings,
      refreshHistory,
      sync,
      clearHistory,
    }),
    [activeSession, clearHistory, commands, connect, connectedDevice, connectionStatus, disconnect, feedback, lastSync, login, logout, online, refreshHistory, saveSettings, sendCommand, sessions, settings, sync, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore deve ser usado dentro de AppProvider.');
  return context;
}
