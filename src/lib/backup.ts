import { Entry, User } from './types';

const BACKUP_KEY = 'mello-local-backup-v2';
const LAST_BACKUP_KEY = 'mello-last-backup-date-v2';
const BACKUP_WARNING_KEY = 'mello-backup-warning-dismissed-v2';

export interface LocalBackup {
  version: number;
  timestamp: number;
  entries: Entry[];
  users: User[];
}

export function createLocalBackup(entries: Entry[], users: User[]): void {
  try {
    const backup: LocalBackup = {
      version: 2,
      timestamp: Date.now(),
      entries,
      users,
    };
    
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()));
  } catch (error) {
    console.error('Failed to create local backup:', error);
  }
}

export function getLocalBackup(): LocalBackup | null {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (!backupStr) return null;
    
    const backup = JSON.parse(backupStr) as LocalBackup;
    
    if (!backup.version || !backup.entries || !backup.users) {
      return null;
    }
    
    return backup;
  } catch (error) {
    console.error('Failed to get local backup:', error);
    return null;
  }
}

export function clearLocalBackup(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(LAST_BACKUP_KEY);
  } catch (error) {
    console.error('Failed to clear local backup:', error);
  }
}

export function getLastBackupDate(): number | null {
  try {
    const dateStr = localStorage.getItem(LAST_BACKUP_KEY);
    if (!dateStr) return null;
    return parseInt(dateStr, 10);
  } catch (error) {
    console.error('Failed to get last backup date:', error);
    return null;
  }
}

export function shouldShowBackupWarning(): boolean {
  try {
    const dismissed = localStorage.getItem(BACKUP_WARNING_KEY);
    if (dismissed === 'true') return false;
    
    const lastBackup = getLastBackupDate();
    if (!lastBackup) return true;
    
    const daysSinceBackup = (Date.now() - lastBackup) / (1000 * 60 * 60 * 24);
    return daysSinceBackup > 7;
  } catch (error) {
    console.error('Failed to check backup warning:', error);
    return true;
  }
}

export function dismissBackupWarning(): void {
  try {
    localStorage.setItem(BACKUP_WARNING_KEY, 'true');
  } catch (error) {
    console.error('Failed to dismiss backup warning:', error);
  }
}

export function clearBackupWarningDismissal(): void {
  try {
    localStorage.removeItem(BACKUP_WARNING_KEY);
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
