import { User, Profile } from './types';

const SESSION_USER_KEY = 'mello-session-user-id';
const SESSION_PROFILE_KEY = 'mello-session-profile-id';

export async function saveSession(userId: string, profileId: string | null) {
  await window.spark.kv.set(SESSION_USER_KEY, userId);
  if (profileId) {
    await window.spark.kv.set(SESSION_PROFILE_KEY, profileId);
  } else {
    await window.spark.kv.delete(SESSION_PROFILE_KEY);
  }
}

export async function getSessionUserId(): Promise<string | undefined> {
  return await window.spark.kv.get<string>(SESSION_USER_KEY);
}

export async function getSessionProfileId(): Promise<string | undefined> {
  return await window.spark.kv.get<string>(SESSION_PROFILE_KEY);
}

export async function clearSession() {
  await window.spark.kv.delete(SESSION_USER_KEY);
  await window.spark.kv.delete(SESSION_PROFILE_KEY);
}

export function findUserById(users: User[], userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function findProfileById(user: User, profileId: string): Profile | undefined {
  return user.profiles.find(p => p.id === profileId);
}
