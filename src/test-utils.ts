import { vi } from 'vitest';

type SetterFunction<T> = (prev: T) => T;

/**
 * Creates a mock for the useKV hook from @github/spark/hooks
 * Returns a controlled state that can be inspected and manipulated in tests
 */
export function createMockUseKV<T>(initialValue: T) {
  let currentValue = initialValue;
  
  const setValue = vi.fn((newValueOrFn: T | SetterFunction<T>) => {
    if (typeof newValueOrFn === 'function') {
      currentValue = (newValueOrFn as SetterFunction<T>)(currentValue);
    } else {
      currentValue = newValueOrFn;
    }
    return currentValue;
  });
  
  const getValue = () => currentValue;
  const reset = () => { currentValue = initialValue; };
  
  return {
    hook: () => [currentValue, setValue] as [T, typeof setValue],
    setValue,
    getValue,
    reset,
  };
}

/**
 * Creates a mock store that simulates multiple useKV hooks
 * Useful for testing components that use multiple key-value pairs
 */
export function createMockKVStore() {
  const store = new Map<string, { value: unknown; setValue: ReturnType<typeof vi.fn> }>();
  
  const mockUseKV = <T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
    if (!store.has(key)) {
      const setValue = vi.fn((newValueOrFn: T | ((prev: T) => T)) => {
        const entry = store.get(key)!;
        if (typeof newValueOrFn === 'function') {
          entry.value = (newValueOrFn as (prev: T) => T)(entry.value as T);
        } else {
          entry.value = newValueOrFn;
        }
      });
      store.set(key, { value: initialValue, setValue });
    }
    
    const entry = store.get(key)!;
    return [entry.value as T, entry.setValue];
  };
  
  const getValue = <T>(key: string): T | undefined => {
    return store.get(key)?.value as T | undefined;
  };
  
  const setValue = <T>(key: string, value: T) => {
    if (store.has(key)) {
      store.get(key)!.value = value;
    }
  };
  
  const reset = () => {
    store.clear();
  };
  
  const getSetterMock = (key: string) => {
    return store.get(key)?.setValue;
  };
  
  return {
    useKV: mockUseKV,
    getValue,
    setValue,
    reset,
    getSetterMock,
    store,
  };
}

/**
 * Mock for window.spark.user() SSO authentication
 */
export function createMockSparkUser(overrides: Partial<{
  email: string;
  login: string;
  avatarUrl: string;
  isOwner: boolean;
}> = {}) {
  return {
    email: 'test@example.com',
    login: 'testuser',
    avatarUrl: 'https://example.com/avatar.png',
    isOwner: false,
    ...overrides,
  };
}

/**
 * Creates test fixtures for common data types
 */
export const testFixtures = {
  createUser: (overrides: Partial<{
    id: string;
    email: string;
    githubLogin: string;
    avatarUrl: string;
    createdAt: number;
    profiles: Array<{
      id: string;
      userId: string;
      nickname: string;
      createdAt: number;
    }>;
  }> = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    githubLogin: 'testuser',
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: Date.now(),
    profiles: [],
    ...overrides,
  }),
  
  createProfile: (overrides: Partial<{
    id: string;
    userId: string;
    nickname: string;
    createdAt: number;
  }> = {}) => ({
    id: 'profile-1',
    userId: 'user-1',
    nickname: 'TestProfile',
    createdAt: Date.now(),
    ...overrides,
  }),
  
  createEntry: (overrides: Partial<{
    id: string;
    number: number;
    artist: string;
    song: string;
    heat: string;
    heatDate: string;
    userRatings: Array<{
      profileId: string;
      profileName: string;
      ratings: {
        song: { rating: number; comment: string };
        clothes: { rating: number; comment: string };
        scenography: { rating: number; comment: string };
        vocals: { rating: number; comment: string };
        lyrics: { rating: number; comment: string };
        postcard: { rating: number; comment: string };
      };
      totalScore: number;
    }>;
  }> = {}) => ({
    id: 'entry-1',
    number: 1,
    artist: 'Test Artist',
    song: 'Test Song',
    heat: 'Deltävling 1',
    heatDate: '2026-01-31',
    userRatings: [],
    ...overrides,
  }),
  
  createUserRating: (overrides: Partial<{
    profileId: string;
    profileName: string;
    ratings: {
      song: { rating: number; comment: string };
      clothes: { rating: number; comment: string };
      scenography: { rating: number; comment: string };
      vocals: { rating: number; comment: string };
      lyrics: { rating: number; comment: string };
      postcard: { rating: number; comment: string };
    };
    totalScore: number;
  }> = {}) => ({
    profileId: 'profile-1',
    profileName: 'TestProfile',
    ratings: {
      song: { rating: 0, comment: '' },
      clothes: { rating: 0, comment: '' },
      scenography: { rating: 0, comment: '' },
      vocals: { rating: 0, comment: '' },
      lyrics: { rating: 0, comment: '' },
      postcard: { rating: 0, comment: '' },
    },
    totalScore: 0,
    ...overrides,
  }),
};
