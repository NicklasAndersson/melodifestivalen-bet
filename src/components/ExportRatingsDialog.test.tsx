import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportRatingsDialog } from './ExportRatingsDialog';
import { Entry, User, Profile } from '@/lib/types';

const mockToast = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToast('success', ...args),
    error: (...args: any[]) => mockToast('error', ...args),
  },
  Toaster: () => null,
}));

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ExportRatingsDialog - Multi-Profile Backup', () => {
  let mockUser: User;
  let mockProfiles: Profile[];
  let mockEntries: Entry[];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockProfiles = [
      {
        id: 'profile-1',
        userId: 'user-1',
        nickname: 'Alice',
        createdAt: Date.now(),
      },
      {
        id: 'profile-2',
        userId: 'user-1',
        nickname: 'Bob',
        createdAt: Date.now(),
      },
      {
        id: 'profile-3',
        userId: 'user-1',
        nickname: 'Charlie',
        createdAt: Date.now(),
      },
    ];

    mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      githubLogin: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: Date.now(),
      profiles: mockProfiles,
    };

    mockEntries = [
      {
        id: 'entry-1',
        number: 1,
        artist: 'Artist 1',
        song: 'Song 1',
        heat: 'Deltävling 1',
        heatDate: '2026-01-31',
        userRatings: [
          {
            profileId: 'profile-1',
            profileName: 'Alice',
            ratings: {
              song: { rating: 5, comment: 'Great!' },
              clothes: { rating: 4, comment: '' },
              scenography: { rating: 3, comment: '' },
              vocals: { rating: 5, comment: '' },
              lyrics: { rating: 4, comment: '' },
              postcard: { rating: 3, comment: '' },
            },
            totalScore: 24,
          },
          {
            profileId: 'profile-2',
            profileName: 'Bob',
            ratings: {
              song: { rating: 3, comment: 'Okay' },
              clothes: { rating: 3, comment: '' },
              scenography: { rating: 2, comment: '' },
              vocals: { rating: 4, comment: '' },
              lyrics: { rating: 3, comment: '' },
              postcard: { rating: 2, comment: '' },
            },
            totalScore: 17,
          },
        ],
      },
      {
        id: 'entry-2',
        number: 2,
        artist: 'Artist 2',
        song: 'Song 2',
        heat: 'Deltävling 1',
        heatDate: '2026-01-31',
        userRatings: [
          {
            profileId: 'profile-3',
            profileName: 'Charlie',
            ratings: {
              song: { rating: 4, comment: 'Nice' },
              clothes: { rating: 5, comment: '' },
              scenography: { rating: 4, comment: '' },
              vocals: { rating: 4, comment: '' },
              lyrics: { rating: 5, comment: '' },
              postcard: { rating: 4, comment: '' },
            },
            totalScore: 26,
          },
        ],
      },
    ];
  });

  it('should export all profiles ratings in backup', async () => {
    const mockOnOpenChange = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement');

    render(
      <ExportRatingsDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        entries={mockEntries}
        userId="profile-1"
        userName="Alice"
        currentUser={mockUser}
      />
    );

    const backupTab = screen.getByRole('tab', { name: /säkerhetskopiera/i });
    fireEvent.click(backupTab);

    const exportButton = screen.getByRole('button', { name: /exportera alla betyg/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    const linkElement = createElementSpy.mock.results.find(
      (result) => result.value?.tagName === 'A'
    )?.value as HTMLAnchorElement;

    expect(linkElement).toBeDefined();
    expect(linkElement?.download).toMatch(/melodifestivalen-2026-backup-testuser-/);

    const blobCall = (global.Blob as any).mock?.calls?.[0];
    if (blobCall) {
      const backupJson = blobCall[0][0];
      const backupData = JSON.parse(backupJson);

      expect(backupData.version).toBe(2);
      expect(backupData.accountId).toBe('user-1');
      expect(backupData.githubLogin).toBe('testuser');
      expect(backupData.profiles).toHaveLength(3);
      
      expect(backupData.profiles[0].nickname).toBe('Alice');
      expect(backupData.profiles[1].nickname).toBe('Bob');
      expect(backupData.profiles[2].nickname).toBe('Charlie');

      expect(backupData.entries).toHaveLength(2);
      
      const entry1 = backupData.entries.find((e: any) => e.id === 'entry-1');
      expect(entry1.userRatings).toHaveLength(2);
      expect(entry1.userRatings.some((ur: any) => ur.profileName === 'Alice')).toBe(true);
      expect(entry1.userRatings.some((ur: any) => ur.profileName === 'Bob')).toBe(true);

      const entry2 = backupData.entries.find((e: any) => e.id === 'entry-2');
      expect(entry2.userRatings).toHaveLength(1);
      expect(entry2.userRatings[0].profileName).toBe('Charlie');
    }

    expect(mockToast).toHaveBeenCalledWith(
      'success',
      'Backup nedladdad!',
      expect.objectContaining({
        description: '3 profil(er) och 3 betyg exporterade',
      })
    );
  });

  it('should show all profiles count in export description', () => {
    render(
      <ExportRatingsDialog
        open={true}
        onOpenChange={vi.fn()}
        entries={mockEntries}
        userId="profile-1"
        userName="Alice"
        currentUser={mockUser}
      />
    );

    const backupTab = screen.getByRole('tab', { name: /säkerhetskopiera/i });
    fireEvent.click(backupTab);

    expect(screen.getByText(/alla dina profiler \(3 st\)/i)).toBeInTheDocument();
  });

  it('should not export ratings from other users', async () => {
    const entriesWithOtherUsers: Entry[] = [
      {
        ...mockEntries[0],
        userRatings: [
          ...mockEntries[0].userRatings,
          {
            profileId: 'other-profile',
            profileName: 'Other User',
            ratings: {
              song: { rating: 5, comment: '' },
              clothes: { rating: 5, comment: '' },
              scenography: { rating: 5, comment: '' },
              vocals: { rating: 5, comment: '' },
              lyrics: { rating: 5, comment: '' },
              postcard: { rating: 5, comment: '' },
            },
            totalScore: 30,
          },
        ],
      },
    ];

    const createElementSpy = vi.spyOn(document, 'createElement');

    render(
      <ExportRatingsDialog
        open={true}
        onOpenChange={vi.fn()}
        entries={entriesWithOtherUsers}
        userId="profile-1"
        userName="Alice"
        currentUser={mockUser}
      />
    );

    const backupTab = screen.getByRole('tab', { name: /säkerhetskopiera/i });
    fireEvent.click(backupTab);

    const exportButton = screen.getByRole('button', { name: /exportera alla betyg/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    const blobCall = (global.Blob as any).mock?.calls?.[0];
    if (blobCall) {
      const backupJson = blobCall[0][0];
      const backupData = JSON.parse(backupJson);

      const entry = backupData.entries[0];
      expect(entry.userRatings).toHaveLength(2);
      expect(entry.userRatings.every((ur: any) => 
        mockProfiles.some(p => p.id === ur.profileId)
      )).toBe(true);
      expect(entry.userRatings.some((ur: any) => ur.profileName === 'Other User')).toBe(false);
    }
  });
});
