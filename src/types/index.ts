export type CommandCode = 'ss' | 'dd' | 'cc' | 'pp' | 'xx' | 'rr';
export type ConnectionStatus = 'unsupported' | 'disconnected' | 'searching' | 'connected' | 'error';
export type UserRole = 'operator' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  internalCode?: string;
  role: UserRole;
  createdAt: string;
  synced: boolean;
  syncedAt?: string;
}

export interface DeviceRecord {
  id: string;
  bleDeviceId: string;
  name: string;
  model?: string;
  createdAt: string;
  synced: boolean;
  syncedAt?: string;
}

export interface CommandEvent {
  id: string;
  userId: string;
  userName: string;
  deviceId: string;
  deviceName: string;
  command: CommandCode;
  actionLabel: string;
  timestamp: string;
  sessionId: string;
  success: boolean;
  errorMessage?: string;
  synced: boolean;
  syncedAt?: string;
}

export interface CommandCounts {
  ss: number;
  dd: number;
  cc: number;
  pp: number;
  xx: number;
  rr: number;
}

export interface UsageSession {
  id: string;
  userId: string;
  userName: string;
  deviceId: string;
  deviceName: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  totalCommands: number;
  commandsByType: CommandCounts;
  lastCommand?: CommandCode;
  finalStatus?: string;
  synced: boolean;
  syncedAt?: string;
}

export interface AppSettings {
  id: 'app-settings';
  deviceName: string;
  bleNamePrefix: string;
  bleServiceUuid: string;
  bleCharacteristicUuid: string;
  extraActionLabel: string;
  confirmReset: boolean;
  confirmExtraAction: boolean;
  demoMode: boolean;
  apiBaseUrl: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalSessions: number;
  totalUsers: number;
  totalDevices: number;
  accumulatedSeconds: number;
  mostUsedCommand: CommandCode | 'none';
  lastUse?: string;
  connectionErrors: number;
  unsyncedSessions: number;
}
