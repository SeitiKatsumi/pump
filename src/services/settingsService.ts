import type { AppSettings } from '../types';
import { getDb } from './db';

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'app-settings',
  deviceName: 'Aparelho BLE',
  bleNamePrefix: '',
  // Substituir pelo UUID real do firmware/equipamento antes do uso em campo.
  bleServiceUuid: '00000000-0000-0000-0000-000000000000',
  // Substituir pelo UUID real da characteristic de escrita do firmware/equipamento.
  bleCharacteristicUuid: '00000000-0000-0000-0000-000000000000',
  extraActionLabel: 'Acao Extra',
  confirmReset: true,
  confirmExtraAction: true,
  demoMode: false,
  apiBaseUrl: '',
  updatedAt: new Date().toISOString(),
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const settings = await db.get('settings', 'app-settings');
  if (settings) return { ...DEFAULT_SETTINGS, ...settings };
  await db.put('settings', DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const db = await getDb();
  const next = { ...settings, updatedAt: new Date().toISOString() };
  await db.put('settings', next);
  return next;
}
