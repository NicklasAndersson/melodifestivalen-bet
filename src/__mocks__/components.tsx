/**
 * Mock components for App.test.tsx
 * Separated to avoid JSX hoisting issues with vi.mock
 */
import React from 'react';
import type { User, Entry, Profile } from '@/lib/types';

export function MockSSOLoginScreen({ onSSOLogin }: { onSSOLogin: () => void }) {
  return React.createElement('div', { 'data-testid': 'sso-login-screen' },
    React.createElement('button', { onClick: onSSOLogin, 'data-testid': 'sso-login-button' }, 'Logga in med GitHub')
  );
}

export function MockProfileSelector({ 
  user, 
  onSelectProfile, 
  onCreateProfile, 
  onLogout 
}: { 
  user: User; 
  onSelectProfile: (profile: Profile) => void; 
  onCreateProfile: (nickname: string) => void; 
  onLogout: () => void;
}) {
  return React.createElement('div', { 'data-testid': 'profile-selector' },
    React.createElement('span', { 'data-testid': 'user-email' }, user.email),
    React.createElement('button', { onClick: () => onCreateProfile('TestProfile'), 'data-testid': 'create-profile-button' }, 'Skapa profil'),
    ...user.profiles.map((profile) =>
      React.createElement('button', { 
        key: profile.id, 
        onClick: () => onSelectProfile(profile), 
        'data-testid': `select-profile-${profile.id}` 
      }, profile.nickname)
    ),
    React.createElement('button', { onClick: onLogout, 'data-testid': 'logout-button' }, 'Logga ut')
  );
}

export function MockEntryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  return React.createElement('div', { 'data-testid': `entry-card-${entry.id}`, onClick },
    `${entry.artist} - ${entry.song}`
  );
}

export function MockRatingView({ 
  entry, 
  onBack, 
  onUpdateRating,
  onDeleteRating 
}: { 
  entry: Entry; 
  onBack: () => void; 
  onUpdateRating: (category: string, rating: number, comment: string) => void;
  onDeleteRating: () => void;
}) {
  return React.createElement('div', { 'data-testid': 'rating-view' },
    React.createElement('span', { 'data-testid': 'rating-entry-artist' }, entry.artist),
    React.createElement('button', { onClick: onBack, 'data-testid': 'back-button' }, 'Tillbaka'),
    React.createElement('button', { 
      onClick: () => onUpdateRating('song', 5, 'Great song!'), 
      'data-testid': 'rate-song-button' 
    }, 'Betygsätt låt'),
    React.createElement('button', { onClick: onDeleteRating, 'data-testid': 'delete-rating-button' }, 'Radera betyg')
  );
}

export function MockProfileComparisonView({ entry, onBack }: { entry: Entry; onBack: () => void }) {
  return React.createElement('div', { 'data-testid': 'profile-comparison-view' },
    React.createElement('span', null, entry.artist),
    React.createElement('button', { onClick: onBack, 'data-testid': 'comparison-back-button' }, 'Tillbaka')
  );
}

export function MockGlobalLeaderboard({ entries }: { entries: Entry[] }) {
  return React.createElement('div', { 'data-testid': 'global-leaderboard' },
    React.createElement('span', { 'data-testid': 'entries-count' }, `${entries.length} bidrag`)
  );
}

export function MockPersonalLeaderboard({ userId }: { entries: Entry[]; userId: string }) {
  return React.createElement('div', { 'data-testid': 'personal-leaderboard' },
    React.createElement('span', { 'data-testid': 'user-id' }, userId)
  );
}

export function MockGroupLeaderboard({ currentUserId }: { entries: Entry[]; users: User[]; currentUserId: string }) {
  return React.createElement('div', { 'data-testid': 'group-leaderboard' },
    React.createElement('span', { 'data-testid': 'current-user-id' }, currentUserId)
  );
}

export function MockExportRatingsDialog() {
  return React.createElement('div', { 'data-testid': 'export-dialog' });
}

export function MockMigrationDebug() {
  return React.createElement('div', { 'data-testid': 'migration-debug' });
}

// Mock toast functions
export const mockToast = {
  success: () => {},
  error: () => {},
  warning: () => {},
};
