import type { AppUser, UserRole } from '../types';
import { createId } from '../utils/ids';
import { getDb } from './db';

const CURRENT_USER_KEY = 'pump-current-user-id';

export async function getCurrentUser(): Promise<AppUser | undefined> {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return undefined;
  const db = await getDb();
  return db.get('users', id);
}

export async function loginUser(input: {
  name: string;
  email: string;
  phone: string;
  internalCode?: string;
  role?: UserRole;
}): Promise<AppUser> {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  const existing = await db.getFromIndex('users', 'by-email', email);
  const user: AppUser = {
    id: existing?.id ?? createId('user'),
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    internalCode: input.internalCode?.trim(),
    role: input.role ?? existing?.role ?? 'operator',
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    synced: false,
  };
  await db.put('users', user);
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export async function listUsers(): Promise<AppUser[]> {
  const db = await getDb();
  return db.getAll('users');
}
