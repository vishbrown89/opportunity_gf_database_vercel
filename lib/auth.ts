import { supabase } from './supabase';

const bcrypt = require('bcryptjs');

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (!admin) {
    return false;
  }

  return verifyPassword(password, admin.password_hash);
}

export function setAdminSession(email: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('adminEmail', email);
    sessionStorage.setItem('adminAuth', 'true');
  }
}

export function getAdminSession(): string | null {
  if (typeof window !== 'undefined') {
    const isAuth = sessionStorage.getItem('adminAuth');
    const email = sessionStorage.getItem('adminEmail');
    return isAuth === 'true' && email ? email : null;
  }
  return null;
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminAuth');
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}