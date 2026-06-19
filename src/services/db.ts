import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppSettings, AppUser, CommandEvent, DeviceRecord, UsageSession } from '../types';

interface PumpDb extends DBSchema {
  users: {
    key: string;
    value: AppUser;
    indexes: { 'by-email': string };
  };
  devices: {
    key: string;
    value: DeviceRecord;
  };
  sessions: {
    key: string;
    value: UsageSession;
    indexes: { 'by-user': string; 'by-device': string; 'by-started': string };
  };
  commands: {
    key: string;
    value: CommandEvent;
    indexes: { 'by-session': string; 'by-user': string; 'by-command': string; 'by-timestamp': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  errors: {
    key: string;
    value: { id: string; message: string; createdAt: string; synced: boolean };
  };
}

let dbPromise: Promise<IDBPDatabase<PumpDb>> | undefined;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<PumpDb>('pump-ble-control', 1, {
      upgrade(db) {
        const users = db.createObjectStore('users', { keyPath: 'id' });
        users.createIndex('by-email', 'email');

        db.createObjectStore('devices', { keyPath: 'id' });

        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('by-user', 'userId');
        sessions.createIndex('by-device', 'deviceId');
        sessions.createIndex('by-started', 'startedAt');

        const commands = db.createObjectStore('commands', { keyPath: 'id' });
        commands.createIndex('by-session', 'sessionId');
        commands.createIndex('by-user', 'userId');
        commands.createIndex('by-command', 'command');
        commands.createIndex('by-timestamp', 'timestamp');

        db.createObjectStore('settings', { keyPath: 'id' });

        db.createObjectStore('errors', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}
