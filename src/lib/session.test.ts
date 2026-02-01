import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSession, getSessionUserId, getSessionProfileId, clearSession, findUserById, findProfileById, cleanupOldKVSession } from './session';
import { User, Profile } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

// Mock spark.kv for cleanupOldKVSession
const mockKV = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  
  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  // Mock window.spark for cleanupOldKVSession
  (global as any).window = {
    spark: {
      kv: mockKV,
    },
  };
});

describe('session', () => {
  describe('saveSession', () => {
    it('should save user id and profile id to localStorage', () => {
      saveSession('user-1', 'profile-1');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('mello-session-user-id', 'user-1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('mello-session-profile-id', 'profile-1');
    });

    it('should remove profile id when null', () => {
      saveSession('user-1', null);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('mello-session-user-id', 'user-1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mello-session-profile-id');
    });
  });

  describe('getSessionUserId', () => {
    it('should retrieve user id from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('user-1');
      
      const result = getSessionUserId();
      
      expect(result).toBe('user-1');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('mello-session-user-id');
    });

    it('should return undefined when no user id stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getSessionUserId();
      
      expect(result).toBeUndefined();
    });
  });

  describe('getSessionProfileId', () => {
    it('should retrieve profile id from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('profile-1');
      
      const result = getSessionProfileId();
      
      expect(result).toBe('profile-1');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('mello-session-profile-id');
    });

    it('should return undefined when no profile id stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getSessionProfileId();
      
      expect(result).toBeUndefined();
    });
  });

  describe('clearSession', () => {
    it('should remove both session keys from localStorage', () => {
      clearSession();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mello-session-user-id');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mello-session-profile-id');
    });
  });

  describe('cleanupOldKVSession', () => {
    it('should delete old session keys from spark.kv if they exist', async () => {
      mockKV.get.mockResolvedValueOnce('old-user-id');
      mockKV.get.mockResolvedValueOnce('old-profile-id');
      
      await cleanupOldKVSession();
      
      expect(mockKV.delete).toHaveBeenCalledWith('mello-session-user-id');
      expect(mockKV.delete).toHaveBeenCalledWith('mello-session-profile-id');
    });

    it('should not delete if no old session keys exist', async () => {
      mockKV.get.mockResolvedValue(undefined);
      
      await cleanupOldKVSession();
      
      expect(mockKV.delete).not.toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should find user by id', () => {
      const users: User[] = [
        {
          id: 'user-1',
          email: 'test@example.com',
          githubLogin: 'testuser',
          createdAt: Date.now(),
          profiles: [],
        },
        {
          id: 'user-2',
          email: 'test2@example.com',
          githubLogin: 'testuser2',
          createdAt: Date.now(),
          profiles: [],
        },
      ];

      const result = findUserById(users, 'user-2');

      expect(result).toBe(users[1]);
    });

    it('should return undefined if user not found', () => {
      const users: User[] = [];
      const result = findUserById(users, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findProfileById', () => {
    it('should find profile by id', () => {
      const profile1: Profile = {
        id: 'profile-1',
        userId: 'user-1',
        nickname: 'Alice',
        createdAt: Date.now(),
      };
      const profile2: Profile = {
        id: 'profile-2',
        userId: 'user-1',
        nickname: 'Bob',
        createdAt: Date.now(),
      };
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        githubLogin: 'testuser',
        createdAt: Date.now(),
        profiles: [profile1, profile2],
      };

      const result = findProfileById(user, 'profile-2');

      expect(result).toBe(profile2);
    });

    it('should return undefined if profile not found', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        githubLogin: 'testuser',
        createdAt: Date.now(),
        profiles: [],
      };

      const result = findProfileById(user, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });
});
