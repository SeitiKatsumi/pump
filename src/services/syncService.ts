import type { AppSettings } from '../types';
import { getDb } from './db';

async function postJson(apiBaseUrl: string, path: string, payload: unknown) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Falha ao sincronizar ${path}: ${response.status}`);
}

export async function syncUsers(settings: AppSettings) {
  const db = await getDb();
  const users = (await db.getAll('users')).filter((user) => !user.synced);
  if (!settings.apiBaseUrl) return { skipped: true, count: users.length };
  await Promise.all(users.map((user) => postJson(settings.apiBaseUrl, '/users', user)));
  await Promise.all(users.map((user) => db.put('users', { ...user, synced: true, syncedAt: new Date().toISOString() })));
  return { skipped: false, count: users.length };
}

export async function syncSessions(settings: AppSettings) {
  const db = await getDb();
  const sessions = (await db.getAll('sessions')).filter((session) => !session.synced);
  if (!settings.apiBaseUrl) return { skipped: true, count: sessions.length };
  await Promise.all(sessions.map((session) => postJson(settings.apiBaseUrl, '/sessions', session)));
  await Promise.all(sessions.map((session) => db.put('sessions', { ...session, synced: true, syncedAt: new Date().toISOString() })));
  return { skipped: false, count: sessions.length };
}

export async function syncPendingEvents(settings: AppSettings) {
  const db = await getDb();
  const commands = (await db.getAll('commands')).filter((command) => !command.synced);
  if (!settings.apiBaseUrl) return { skipped: true, count: commands.length };
  await Promise.all(commands.map((command) => postJson(settings.apiBaseUrl, '/commands', command)));
  await Promise.all(commands.map((command) => db.put('commands', { ...command, synced: true, syncedAt: new Date().toISOString() })));
  return { skipped: false, count: commands.length };
}

export async function markAsSynced() {
  const db = await getDb();
  const now = new Date().toISOString();
  await Promise.all((await db.getAll('commands')).map((command) => db.put('commands', { ...command, synced: true, syncedAt: now })));
  await Promise.all((await db.getAll('sessions')).map((session) => db.put('sessions', { ...session, synced: true, syncedAt: now })));
  await Promise.all((await db.getAll('users')).map((user) => db.put('users', { ...user, synced: true, syncedAt: now })));
}

export async function syncAll(settings: AppSettings) {
  const [users, sessions, commands] = await Promise.all([syncUsers(settings), syncSessions(settings), syncPendingEvents(settings)]);
  localStorage.setItem('pump-last-sync', new Date().toISOString());
  return { users, sessions, commands };
}

export async function getCloudHistory(settings: AppSettings) {
  if (!settings.apiBaseUrl) return [];
  const response = await fetch(`${settings.apiBaseUrl}/history`);
  if (!response.ok) throw new Error('Falha ao consultar historico em nuvem.');
  return response.json();
}
