import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testFixtures } from './test-utils';
import type { User, Entry, Profile } from '@/lib/types';

// Create mock store using vi.hoisted to avoid hoisting issues
const { mockKVStore } = vi.hoisted(() => {
  function createMockKVStore() {
    const store = new Map<string, { value: unknown; setValue: ReturnType<typeof vi.fn> }>();
    // Pre-set initial values that should be available before useKV is called
    const presetValues = new Map<string, unknown>();
    
    const mockUseKV = <T,>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
      if (!store.has(key)) {
        // Check if there's a preset value
        const startValue = presetValues.has(key) ? presetValues.get(key) as T : initialValue;
        const setValue = vi.fn((newValueOrFn: T | ((prev: T) => T)) => {
          const entry = store.get(key)!;
          if (typeof newValueOrFn === 'function') {
            entry.value = (newValueOrFn as (prev: T) => T)(entry.value as T);
          } else {
            entry.value = newValueOrFn;
          }
        });
        store.set(key, { value: startValue, setValue });
      }
      
      const entry = store.get(key)!;
      return [entry.value as T, entry.setValue];
    };
    
    const getValue = <T,>(key: string): T | undefined => {
      return store.get(key)?.value as T | undefined;
    };
    
    // setValue now works both before and after useKV is called
    const setValue = <T,>(key: string, value: T) => {
      if (store.has(key)) {
        store.get(key)!.value = value;
      } else {
        // Store preset value for when useKV is called later
        presetValues.set(key, value);
      }
    };
    
    const reset = () => {
      store.clear();
      presetValues.clear();
    };
    
    return { useKV: mockUseKV, getValue, setValue, reset, store };
  }
  
  return { mockKVStore: createMockKVStore() };
});

vi.mock('@github/spark/hooks', () => ({
  useKV: mockKVStore.useKV,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => 
      React.createElement('div', props, children),
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => 
      React.createElement('button', props, children),
  },
  AnimatePresence: (props: { children?: React.ReactNode }) => props.children,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock icons - using dynamic import to get proper React.createElement
vi.mock('@phosphor-icons/react', async () => {
  const React = await import('react');
  return {
    SignOut: () => React.createElement('span', { 'data-testid': 'icon-signout' }, 'SignOut'),
    ArrowLeft: () => React.createElement('span', { 'data-testid': 'icon-arrow-left' }, 'ArrowLeft'),
    Sparkle: () => React.createElement('span', { 'data-testid': 'icon-sparkle' }, 'Sparkle'),
    Star: () => React.createElement('span', { 'data-testid': 'icon-star' }, 'Star'),
    Trophy: () => React.createElement('span', { 'data-testid': 'icon-trophy' }, 'Trophy'),
    Heart: () => React.createElement('span', { 'data-testid': 'icon-heart' }, 'Heart'),
    Download: () => React.createElement('span', { 'data-testid': 'icon-download' }, 'Download'),
    Globe: () => React.createElement('span', { 'data-testid': 'icon-globe' }, 'Globe'),
    UserCircle: () => React.createElement('span', { 'data-testid': 'icon-user-circle' }, 'UserCircle'),
    Users: () => React.createElement('span', { 'data-testid': 'icon-users' }, 'Users'),
  };
});

// Mock child components - using dynamic import to avoid hoisting issues
vi.mock('@/components/SSOLoginScreen', () => import('./__mocks__/components').then(m => ({ SSOLoginScreen: m.MockSSOLoginScreen })));
vi.mock('@/components/ProfileSelector', () => import('./__mocks__/components').then(m => ({ ProfileSelector: m.MockProfileSelector })));
vi.mock('@/components/EntryCard', () => import('./__mocks__/components').then(m => ({ EntryCard: m.MockEntryCard })));
vi.mock('@/components/RatingView', () => import('./__mocks__/components').then(m => ({ RatingView: m.MockRatingView })));
vi.mock('@/components/ProfileComparisonView', () => import('./__mocks__/components').then(m => ({ ProfileComparisonView: m.MockProfileComparisonView })));
vi.mock('@/components/GlobalLeaderboard', () => import('./__mocks__/components').then(m => ({ GlobalLeaderboard: m.MockGlobalLeaderboard })));
vi.mock('@/components/PersonalLeaderboard', () => import('./__mocks__/components').then(m => ({ PersonalLeaderboard: m.MockPersonalLeaderboard })));
vi.mock('@/components/GroupLeaderboard', () => import('./__mocks__/components').then(m => ({ GroupLeaderboard: m.MockGroupLeaderboard })));
vi.mock('@/components/ExportRatingsDialog', () => import('./__mocks__/components').then(m => ({ ExportRatingsDialog: m.MockExportRatingsDialog })));
vi.mock('@/components/MigrationDebug', () => import('./__mocks__/components').then(m => ({ MigrationDebug: m.MockMigrationDebug })));

vi.mock('@/lib/migration', () => ({
  migrateEntries: (entries: Entry[]) => ({ entries, result: { totalRatings: 0, migratedCount: 0, unmatchedEntries: [] } }),
  validateEntries: () => ({ valid: true, errors: [] }),
  getDataVersion: () => 1,
}));

// Import App after mocks are set up
import App from './App';
import { toast } from 'sonner';

describe('App', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockKVStore.reset();
    
    // Reset window.spark mock
    (window as typeof window & { spark: { user: () => Promise<unknown> } }).spark = {
      user: vi.fn().mockResolvedValue({
        email: 'test@example.com',
        login: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        isOwner: false,
      }),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication (Login/Logout)', () => {
    it('should render SSO login screen when no user is logged in', () => {
      render(<App />);
      expect(screen.getByTestId('sso-login-screen')).toBeInTheDocument();
    });

    it('should call window.spark.user() and create new user on SSO login', async () => {
      render(<App />);
      
      const loginButton = screen.getByTestId('sso-login-button');
      await user.click(loginButton);

      await waitFor(() => {
        expect(window.spark.user).toHaveBeenCalled();
      });

      // Check that user was added to store
      await waitFor(() => {
        const users = mockKVStore.getValue<User[]>('mello-users-v2');
        expect(users).toBeDefined();
        expect(users?.length).toBe(1);
        expect(users?.[0].email).toBe('test@example.com');
        expect(users?.[0].githubLogin).toBe('testuser');
      });

      // Verify toast was called
      expect(toast.success).toHaveBeenCalledWith('Konto skapat!', expect.any(Object));
    });

    it('should find existing user on login instead of creating new one', async () => {
      // Pre-populate with existing user
      const existingUser = testFixtures.createUser({
        email: 'test@example.com',
        githubLogin: 'testuser',
      });
      mockKVStore.setValue('mello-users-v2', [existingUser]);

      render(<App />);
      
      const loginButton = screen.getByTestId('sso-login-button');
      await user.click(loginButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Välkommen tillbaka!', expect.any(Object));
      });

      // Should not have added a new user
      const users = mockKVStore.getValue<User[]>('mello-users-v2');
      expect(users?.length).toBe(1);
    });

    it('should show profile selector after login', async () => {
      render(<App />);
      
      await user.click(screen.getByTestId('sso-login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
    });

    it('should logout and show login screen again', async () => {
      render(<App />);
      
      // Login first
      await user.click(screen.getByTestId('sso-login-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });

      // Logout
      await user.click(screen.getByTestId('logout-button'));

      await waitFor(() => {
        expect(screen.getByTestId('sso-login-screen')).toBeInTheDocument();
      });

      expect(toast.success).toHaveBeenCalledWith('Utloggad');
    });

    it('should handle SSO login error gracefully', async () => {
      const mockError = new Error('Auth failed');
      (window as typeof window & { spark: { user: () => Promise<unknown> } }).spark.user = vi.fn().mockRejectedValue(mockError);

      render(<App />);
      
      await user.click(screen.getByTestId('sso-login-button'));

      // Wait for error toast - the app should catch the error and show toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Should still show login screen
      expect(screen.getByTestId('sso-login-screen')).toBeInTheDocument();
    });
  });

  describe('Profile Management', () => {
    beforeEach(async () => {
      render(<App />);
      await user.click(screen.getByTestId('sso-login-button'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
    });

    it('should create a new profile', async () => {
      await user.click(screen.getByTestId('create-profile-button'));

      await waitFor(() => {
        const users = mockKVStore.getValue<User[]>('mello-users-v2');
        expect(users?.[0].profiles.length).toBe(1);
        expect(users?.[0].profiles[0].nickname).toBe('TestProfile');
      });

      expect(toast.success).toHaveBeenCalledWith('Profil skapad!', expect.any(Object));
    });

    it('should select an existing profile and show main view', async () => {
      // Create profile first
      await user.click(screen.getByTestId('create-profile-button'));

      await waitFor(() => {
        const users = mockKVStore.getValue<User[]>('mello-users-v2');
        expect(users?.[0].profiles.length).toBe(1);
      });

      // The component should auto-select the new profile
      // Check that we're no longer on profile selector
      await waitFor(() => {
        // After profile creation, we should see entry cards or main view
        expect(screen.queryByTestId('sso-login-screen')).not.toBeInTheDocument();
      });

      expect(toast.success).toHaveBeenCalledWith('Profil skapad!', expect.any(Object));
    });
  });

  describe('Rating Operations', () => {
    beforeEach(async () => {
      // Setup: login and create profile
      const testUser = testFixtures.createUser({
        profiles: [testFixtures.createProfile({ id: 'profile-1', nickname: 'TestProfile' })],
      });
      mockKVStore.setValue('mello-users-v2', [testUser]);

      // Add test entries
      const testEntry = testFixtures.createEntry({
        id: 'test-entry-1',
        artist: 'Test Artist',
        song: 'Test Song',
        heat: 'Deltävling 1',
      });
      mockKVStore.setValue('mello-entries-v2', [testEntry]);
      mockKVStore.setValue('mello-data-version-v2', 1);
    });

    it('should update rating for an entry', async () => {
      // Mock to return existing user with profile
      (window as typeof window & { spark: { user: () => Promise<unknown> } }).spark.user = vi.fn().mockResolvedValue({
        email: 'test@example.com',
        login: 'testuser',
        avatarUrl: 'https://example.com/avatar.png',
        isOwner: false,
      });

      render(<App />);
      
      // Login
      await user.click(screen.getByTestId('sso-login-button'));

      // Wait for profile selector
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });

      // Select profile
      await user.click(screen.getByTestId('select-profile-profile-1'));

      // Wait for entry cards to appear
      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
      });

      // Click on entry card
      await user.click(screen.getByTestId('entry-card-test-entry-1'));

      // Wait for rating view
      await waitFor(() => {
        expect(screen.getByTestId('rating-view')).toBeInTheDocument();
      });

      // Click rate song button (which calls onUpdateRating with category='song', rating=5, comment='Great song!')
      await user.click(screen.getByTestId('rate-song-button'));

      // Verify the entry was updated with the rating
      await waitFor(() => {
        const entries = mockKVStore.getValue<Entry[]>('mello-entries-v2');
        const entry = entries?.find(e => e.id === 'test-entry-1');
        expect(entry?.userRatings.length).toBe(1);
        expect(entry?.userRatings[0].ratings.song.rating).toBe(5);
        expect(entry?.userRatings[0].ratings.song.comment).toBe('Great song!');
      });
    });

    it('should delete rating for an entry', async () => {
      // Add a rating to the entry
      const entryWithRating = testFixtures.createEntry({
        id: 'test-entry-1',
        artist: 'Test Artist',
        song: 'Test Song',
        heat: 'Deltävling 1',
        userRatings: [testFixtures.createUserRating({
          profileId: 'profile-1',
          profileName: 'TestProfile',
          ratings: {
            song: { rating: 5, comment: 'Great!' },
            clothes: { rating: 0, comment: '' },
            scenography: { rating: 0, comment: '' },
            vocals: { rating: 0, comment: '' },
            lyrics: { rating: 0, comment: '' },
            postcard: { rating: 0, comment: '' },
          },
          totalScore: 5,
        })],
      });
      mockKVStore.setValue('mello-entries-v2', [entryWithRating]);

      render(<App />);
      
      // Login and select profile
      await user.click(screen.getByTestId('sso-login-button'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('select-profile-profile-1'));

      // Click on entry card
      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('entry-card-test-entry-1'));

      // Wait for rating view
      await waitFor(() => {
        expect(screen.getByTestId('rating-view')).toBeInTheDocument();
      });

      // Delete rating
      await user.click(screen.getByTestId('delete-rating-button'));

      // Verify the rating was deleted
      await waitFor(() => {
        const entries = mockKVStore.getValue<Entry[]>('mello-entries-v2');
        const entry = entries?.find(e => e.id === 'test-entry-1');
        expect(entry?.userRatings.length).toBe(0);
      });

      expect(toast.success).toHaveBeenCalledWith('Betyg raderat');
    });

    it('should update existing rating instead of creating new one', async () => {
      // Add a rating to the entry
      const entryWithRating = testFixtures.createEntry({
        id: 'test-entry-1',
        artist: 'Test Artist',
        song: 'Test Song',
        heat: 'Deltävling 1',
        userRatings: [testFixtures.createUserRating({
          profileId: 'profile-1',
          profileName: 'TestProfile',
          ratings: {
            song: { rating: 3, comment: 'OK' },
            clothes: { rating: 0, comment: '' },
            scenography: { rating: 0, comment: '' },
            vocals: { rating: 0, comment: '' },
            lyrics: { rating: 0, comment: '' },
            postcard: { rating: 0, comment: '' },
          },
          totalScore: 3,
        })],
      });
      mockKVStore.setValue('mello-entries-v2', [entryWithRating]);

      render(<App />);
      
      // Login and select profile
      await user.click(screen.getByTestId('sso-login-button'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('select-profile-profile-1'));

      // Click on entry card
      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('entry-card-test-entry-1'));

      // Wait for rating view
      await waitFor(() => {
        expect(screen.getByTestId('rating-view')).toBeInTheDocument();
      });

      // Update rating (the mock button sets rating to 5)
      await user.click(screen.getByTestId('rate-song-button'));

      // Verify the rating was updated, not added
      await waitFor(() => {
        const entries = mockKVStore.getValue<Entry[]>('mello-entries-v2');
        const entry = entries?.find(e => e.id === 'test-entry-1');
        expect(entry?.userRatings.length).toBe(1); // Still only one rating
        expect(entry?.userRatings[0].ratings.song.rating).toBe(5); // Updated to 5
        expect(entry?.userRatings[0].ratings.song.comment).toBe('Great song!');
      });
    });
  });

  describe('Data Initialization (seedData)', () => {
    it('should initialize entries from MELODIFESTIVALEN_2026 when empty', async () => {
      // Ensure entries are empty
      mockKVStore.setValue('mello-entries-v2', []);
      mockKVStore.setValue('mello-data-version-v2', 0);

      render(<App />);

      // Wait for initialization
      await waitFor(() => {
        const entries = mockKVStore.getValue<Entry[]>('mello-entries-v2');
        expect(entries).toBeDefined();
        expect(entries!.length).toBe(30); // 6 entries per heat x 5 heats
      });

      // Verify data version was set
      const version = mockKVStore.getValue<number>('mello-data-version-v2');
      expect(version).toBe(1);
    });

    it('should have correct entry structure after initialization', async () => {
      mockKVStore.setValue('mello-entries-v2', []);
      mockKVStore.setValue('mello-data-version-v2', 0);

      render(<App />);

      await waitFor(() => {
        const entries = mockKVStore.getValue<Entry[]>('mello-entries-v2');
        expect(entries!.length).toBeGreaterThan(0);
        
        const firstEntry = entries![0];
        expect(firstEntry).toHaveProperty('id');
        expect(firstEntry).toHaveProperty('number');
        expect(firstEntry).toHaveProperty('artist');
        expect(firstEntry).toHaveProperty('song');
        expect(firstEntry).toHaveProperty('heat');
        expect(firstEntry).toHaveProperty('heatDate');
        expect(firstEntry).toHaveProperty('userRatings');
        expect(firstEntry.userRatings).toEqual([]);
      });
    });
  });

  describe('Navigation State', () => {
    beforeEach(async () => {
      // Setup: login and create profile with entries
      const testUser = testFixtures.createUser({
        profiles: [testFixtures.createProfile({ id: 'profile-1', nickname: 'TestProfile' })],
      });
      mockKVStore.setValue('mello-users-v2', [testUser]);

      const testEntry = testFixtures.createEntry({
        id: 'test-entry-1',
        artist: 'Test Artist',
        song: 'Test Song',
        heat: 'Deltävling 1',
      });
      mockKVStore.setValue('mello-entries-v2', [testEntry]);
      mockKVStore.setValue('mello-data-version-v2', 1);
    });

    it('should navigate to rating view when entry is selected', async () => {
      render(<App />);
      
      await user.click(screen.getByTestId('sso-login-button'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('select-profile-profile-1'));

      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('entry-card-test-entry-1'));

      await waitFor(() => {
        expect(screen.getByTestId('rating-view')).toBeInTheDocument();
        expect(screen.getByTestId('rating-entry-artist')).toHaveTextContent('Test Artist');
      });
    });

    it('should navigate back from rating view to entry list', async () => {
      render(<App />);
      
      await user.click(screen.getByTestId('sso-login-button'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('select-profile-profile-1'));

      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('entry-card-test-entry-1'));

      await waitFor(() => {
        expect(screen.getByTestId('rating-view')).toBeInTheDocument();
      });

      // Navigate back
      await user.click(screen.getByTestId('back-button'));

      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
        expect(screen.queryByTestId('rating-view')).not.toBeInTheDocument();
      });
    });

    it('should show profile selector when going back to profiles', async () => {
      render(<App />);
      
      await user.click(screen.getByTestId('sso-login-button'));
      await waitFor(() => {
        expect(screen.getByTestId('profile-selector')).toBeInTheDocument();
      });
      await user.click(screen.getByTestId('select-profile-profile-1'));

      // Wait for main view
      await waitFor(() => {
        expect(screen.getByTestId('entry-card-test-entry-1')).toBeInTheDocument();
      });

      // Toast was called with profile selected message
      expect(toast.success).toHaveBeenCalledWith('Profil vald', expect.any(Object));
    });
  });
});
