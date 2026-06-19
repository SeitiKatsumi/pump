import type { AppUser, CommandCode, CommandEvent, DashboardSummary, DeviceRecord, UsageSession } from '../types';
import { COMMAND_LABELS, emptyCommandCounts } from '../constants/commands';
import { createId } from '../utils/ids';
import { getDb } from './db';

export async function ensureDevice(bleDeviceId: string, name: string): Promise<DeviceRecord> {
  const db = await getDb();
  const devices = await db.getAll('devices');
  const existing = devices.find((device) => device.bleDeviceId === bleDeviceId);
  if (existing) return existing;
  const device: DeviceRecord = {
    id: createId('device'),
    bleDeviceId,
    name,
    createdAt: new Date().toISOString(),
    synced: false,
  };
  await db.put('devices', device);
  return device;
}

export async function startSession(user: AppUser, device: DeviceRecord): Promise<UsageSession> {
  const db = await getDb();
  const session: UsageSession = {
    id: createId('session'),
    userId: user.id,
    userName: user.name,
    deviceId: device.id,
    deviceName: device.name,
    startedAt: new Date().toISOString(),
    totalCommands: 0,
    commandsByType: emptyCommandCounts(),
    finalStatus: 'ativa',
    synced: false,
  };
  await db.put('sessions', session);
  return session;
}

export async function finalizeSession(sessionId: string, finalStatus = 'encerrada'): Promise<UsageSession | undefined> {
  const db = await getDb();
  const session = await db.get('sessions', sessionId);
  if (!session || session.endedAt) return session;
  const endedAt = new Date().toISOString();
  const durationSeconds = Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(session.startedAt)) / 1000));
  const next = { ...session, endedAt, durationSeconds, finalStatus, synced: false };
  await db.put('sessions', next);
  return next;
}

export async function recordCommand(input: {
  user: AppUser;
  device: DeviceRecord;
  sessionId: string;
  command: CommandCode;
  actionLabel?: string;
  success: boolean;
  errorMessage?: string;
}): Promise<CommandEvent> {
  const db = await getDb();
  const event: CommandEvent = {
    id: createId('command'),
    userId: input.user.id,
    userName: input.user.name,
    deviceId: input.device.id,
    deviceName: input.device.name,
    command: input.command,
    actionLabel: input.actionLabel ?? COMMAND_LABELS[input.command],
    timestamp: new Date().toISOString(),
    sessionId: input.sessionId,
    success: input.success,
    errorMessage: input.errorMessage,
    synced: false,
  };
  await db.put('commands', event);

  const session = await db.get('sessions', input.sessionId);
  if (session) {
    const commandsByType = { ...session.commandsByType, [input.command]: session.commandsByType[input.command] + 1 };
    await db.put('sessions', {
      ...session,
      totalCommands: session.totalCommands + 1,
      commandsByType,
      lastCommand: input.command,
      synced: false,
    });
  }

  return event;
}

export async function listSessions(): Promise<UsageSession[]> {
  const db = await getDb();
  return (await db.getAll('sessions')).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function listCommands(): Promise<CommandEvent[]> {
  const db = await getDb();
  return (await db.getAll('commands')).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function listDevices(): Promise<DeviceRecord[]> {
  const db = await getDb();
  return db.getAll('devices');
}

export async function clearLocalHistory(): Promise<void> {
  const db = await getDb();
  await db.clear('commands');
  await db.clear('sessions');
}

export async function buildDashboardSummary(): Promise<DashboardSummary> {
  const [sessions, commands, users, devices] = await Promise.all([listSessions(), listCommands(), import('./authService').then((m) => m.listUsers()), listDevices()]);
  const counts = emptyCommandCounts();
  commands.forEach((event) => {
    counts[event.command] += 1;
  });
  const sortedCommands = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return {
    totalSessions: sessions.length,
    totalUsers: users.length,
    totalDevices: devices.length,
    accumulatedSeconds: sessions.reduce((total, session) => total + (session.durationSeconds ?? 0), 0),
    mostUsedCommand: sortedCommands[0]?.[1] ? (sortedCommands[0][0] as CommandCode) : 'none',
    lastUse: sessions[0]?.startedAt,
    connectionErrors: commands.filter((event) => !event.success).length,
    unsyncedSessions: sessions.filter((session) => !session.synced).length,
  };
}
