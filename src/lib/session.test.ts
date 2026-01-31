import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSession, getSessionUserId, getSessionProfileId, clearSession, findUserById, findProfileById } from './session';
import { User, Profile } from './types';

const mockKV = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (global as any).window = {
    spark: {
      kv: mockKV,
    },
  };
});

describe('session', () => {
  describe('saveSession', () => {
    it('should save user id and profile id', async () => {
      await saveSession('user-1', 'profile-1');
      
      expect(mockKV.set).toHaveBeenCalledWith('mello-session-user-id', 'user-1');
      expect(mockKV.set).toHaveBeenCalledWith('mello-session-profile-id', 'profile-1');
    });

    it('should delete profile id when null', async () => {
      await saveSession('user-1', null);
      
      expect(mockKV.set).toHaveBeenCalledWith('mello-session-user-id', 'user-1');
      expect(mockKV.delete).toHaveBeenCalledWith('mello-session-profile-id');
    });
  });

  describe('getSessionUserId', () => {
    it('should retrieve user id', async () => {
      mockKV.get.mockResolvedValue('user-1');
      
      const result = await getSessionUserId();
      
      expect(result).toBe('user-1');
      expect(mockKV.get).toHaveBeenCalledWith('mello-session-user-id');
    });
  });

  describe('getSessionProfileId', () => {
    it('should retrieve profile id', async () => {
      mockKV.get.mockResolvedValue('profile-1');
      
      const result = await getSessionProfileId();
      
      expect(result).toBe('profile-1');
      expect(mockKV.get).toHaveBeenCalledWith('mello-session-profile-id');
    });
  });

  describe('clearSession', () => {
    it('should delete both session keys', async () => {
      await clearSession();
      
      expect(mockKV.delete).toHaveBeenCalledWith('mello-session-user-id');
      expect(mockKV.delete).toHaveBeenCalledWith('mello-session-profile-id');
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
