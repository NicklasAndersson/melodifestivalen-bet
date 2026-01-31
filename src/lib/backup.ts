import { Entry, User } from './types';

const BACKUP_KEY = 'mello-auto-backup-v2';
const LAST_BACKUP_KEY = 'mello-last-backup-date-v2';
const BACKUP_WARNING_KEY = 'mello-backup-warning-dismissed-v2';

export interface LocalBackup {
  version: number;
  timestamp: number;
  entries: Entry[];
  users: User[];
}

export async function createAutoBackup(entries: Entry[], users: User[]): Promise<void> {
  try {
    const backup: LocalBackup = {
      version: 2,
      timestamp: Date.now(),
      entries,
      users,
    };
    
    await window.spark.kv.set(BACKUP_KEY, backup);
    await window.spark.kv.set(LAST_BACKUP_KEY, Date.now());
  } catch (error) {
    console.error('Failed to create auto backup:', error);
  }
}

export async function getAutoBackup(): Promise<LocalBackup | null> {
  try {
    const backup = await window.spark.kv.get<LocalBackup>(BACKUP_KEY);
    
    if (!backup || !backup.version || !backup.entries || !backup.users) {
      return null;
    }
    
    return backup;
  } catch (error) {
    return null;
  }
}

export async function clearAutoBackup(): Promise<void> {
  try {
    await window.spark.kv.delete(BACKUP_KEY);
    await window.spark.kv.delete(LAST_BACKUP_KEY);
  } catch (error) {
    console.error('Failed to clear auto backup:', error);
  }
}

export async function getLastBackupDate(): Promise<number | null> {
  try {
    const timestamp = await window.spark.kv.get<number>(LAST_BACKUP_KEY);
    return timestamp || null;
  } catch (error) {
    return null;
  }
}

export async function shouldShowBackupWarning(): Promise<boolean> {
  try {
    const dismissed = await window.spark.kv.get<boolean>(BACKUP_WARNING_KEY);
    if (dismissed === true) return false;
    
    const lastBackup = await getLastBackupDate();
    if (!lastBackup) return true;
    
    const daysSinceBackup = (Date.now() - lastBackup) / (1000 * 60 * 60 * 24);
    return daysSinceBackup > 7;
  } catch (error) {
    return true;
  }
}

export async function dismissBackupWarning(): Promise<void> {
  try {
    await window.spark.kv.set(BACKUP_WARNING_KEY, true);
  } catch (error) {
    console.error('Failed to dismiss backup warning:', error);
  }
}

export async function clearBackupWarningDismissal(): Promise<void> {
  try {
    await window.spark.kv.delete(BACKUP_WARNING_KEY);
  } catch (error) {
    console.error('Failed to clear backup warning dismissal:', error);
  }
}

export function hasRatings(entries: Entry[]): boolean {
  return entries.some(entry => entry.userRatings.length > 0);
}

export function getTotalRatingsCount(entries: Entry[]): number {
  return entries.reduce((sum, entry) => sum + entry.userRatings.length, 0);
}
