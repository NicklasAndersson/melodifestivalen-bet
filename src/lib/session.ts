import { User, Profile } from './types';

// Session keys for device-local storage (localStorage)
// This ensures each device/browser maintains its own session independently
const SESSION_USER_KEY = 'mello-session-user-id';
const SESSION_PROFILE_KEY = 'mello-session-profile-id';

// Old KV session keys that need to be cleaned up
const OLD_KV_SESSION_USER_KEY = 'mello-session-user-id';
const OLD_KV_SESSION_PROFILE_KEY = 'mello-session-profile-id';

/**
 * Save session to device-local localStorage.
 * This replaces the old spark.kv storage which was shared globally
 * and caused all users to share the same active session.
 */
export function saveSession(userId: string, profileId: string | null): void {
  try {
    localStorage.setItem(SESSION_USER_KEY, userId);
    if (profileId) {
      localStorage.setItem(SESSION_PROFILE_KEY, profileId);
    } else {
      localStorage.removeItem(SESSION_PROFILE_KEY);
    }
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

/**
 * Get the current user ID from device-local localStorage.
 */
export function getSessionUserId(): string | undefined {
  try {
    return localStorage.getItem(SESSION_USER_KEY) ?? undefined;
  } catch (error) {
    console.error('Failed to get session user ID from localStorage:', error);
    return undefined;
  }
}

/**
 * Get the current profile ID from device-local localStorage.
 */
export function getSessionProfileId(): string | undefined {
  try {
    return localStorage.getItem(SESSION_PROFILE_KEY) ?? undefined;
  } catch (error) {
    console.error('Failed to get session profile ID from localStorage:', error);
    return undefined;
  }
}

/**
 * Clear the session from device-local localStorage.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_PROFILE_KEY);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
}

/**
 * Clean up old session data from global spark.kv storage.
 * This migration function removes the old global session keys
 * that were causing all users to share the same active session.
 * Should be called once on app startup.
 */
export async function cleanupOldKVSession(): Promise<void> {
  try {
    // Check if old session keys exist in global KV and remove them
    const oldUserId = await window.spark.kv.get<string>(OLD_KV_SESSION_USER_KEY);
    const oldProfileId = await window.spark.kv.get<string>(OLD_KV_SESSION_PROFILE_KEY);
    
    if (oldUserId !== undefined) {
      await window.spark.kv.delete(OLD_KV_SESSION_USER_KEY);
      console.log('Cleaned up old global session user ID from spark.kv');
    }
    
    if (oldProfileId !== undefined) {
      await window.spark.kv.delete(OLD_KV_SESSION_PROFILE_KEY);
      console.log('Cleaned up old global session profile ID from spark.kv');
    }
  } catch (error) {
    // Non-critical: just log and continue
    console.warn('Failed to clean up old KV session (non-critical):', error);
  }
}

export function findUserById(users: User[], userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function findProfileById(user: User, profileId: string): Profile | undefined {
  return user.profiles.find(p => p.id === profileId);
}
