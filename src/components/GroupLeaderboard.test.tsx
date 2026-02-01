import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GroupLeaderboard } from './GroupLeaderboard';
import { Entry, User } from '@/lib/types';

const mockEntries: Entry[] = [
  {
    id: 'entry-1',
    number: 1,
    artist: 'Test Artist 1',
    song: 'Test Song 1',
    heat: 'Deltävling 1',
    heatDate: '2026-01-31',
    userRatings: [
      {
        profileId: 'profile-1',
        profileName: 'Profile 1',
        ratings: {
          song: { rating: 5, comment: '' },
          scenography: { rating: 5, comment: '' },
          clothes: { rating: 5, comment: '' },
          vocals: { rating: 5, comment: '' },
          lyrics: { rating: 5, comment: '' },
          postcard: { rating: 5, comment: '' },
        },
        totalScore: 30,
      },
    ],
  },
  {
    id: 'entry-2',
    number: 2,
    artist: 'Test Artist 2',
    song: 'Test Song 2',
    heat: 'Deltävling 1',
    heatDate: '2026-01-31',
    userRatings: [
      {
        profileId: 'profile-1',
        profileName: 'Profile 1',
        ratings: {
          song: { rating: 3, comment: '' },
          scenography: { rating: 3, comment: '' },
          clothes: { rating: 3, comment: '' },
          vocals: { rating: 3, comment: '' },
          lyrics: { rating: 3, comment: '' },
          postcard: { rating: 3, comment: '' },
        },
        totalScore: 18,
      },
    ],
  },
];

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'test@example.com',
    githubLogin: 'testuser',
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: Date.now(),
    profiles: [
      {
        id: 'profile-1',
        userId: 'user-1',
        nickname: 'Test Profile',
        createdAt: Date.now(),
      },
    ],
  },
];

describe('GroupLeaderboard', () => {
  it('renders leaderboard with entries', () => {
    render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    expect(screen.getByText('Gruppens topplista')).toBeInTheDocument();
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 1')).toBeInTheDocument();
  });

  it('shows empty state when no ratings exist', () => {
    const emptyEntries: Entry[] = [
      {
        ...mockEntries[0],
        userRatings: [],
      },
    ];
    
    render(<GroupLeaderboard entries={emptyEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    expect(screen.getByText('Ingen grupptopplista än')).toBeInTheDocument();
  });

  it('does not use oklch or oklab color values in className', () => {
    const { container } = render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const className = element.className;
      if (typeof className === 'string') {
        expect(className).not.toMatch(/oklch\(/);
        expect(className).not.toMatch(/oklab\(/);
      }
    });
  });

  it('uses only safe color formats (hex, hsl, named colors)', () => {
    const { container } = render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const className = element.className;
      if (typeof className === 'string' && (className.includes('text-[') || className.includes('border-[') || className.includes('bg-['))) {
        const colorMatch = className.match(/\[(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\]/);
        if (colorMatch) {
          expect(colorMatch[0]).toMatch(/\[#[0-9A-Fa-f]{3,6}\]/);
        }
      }
    });
  });

  it('sorts entries by average score descending', () => {
    const { container } = render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    const songs = Array.from(container.querySelectorAll('.font-heading.font-bold.text-base, .font-heading.font-bold.text-xl'))
      .map(el => el.textContent)
      .filter(text => text && (text.includes('Test Song')));
    
    expect(songs[0]).toBe('Test Song 1');
    expect(songs[1]).toBe('Test Song 2');
  });

  it('displays correct average scores', () => {
    render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    expect(screen.getByText('30.0')).toBeInTheDocument();
    expect(screen.getByText('18.0')).toBeInTheDocument();
  });

  it('displays crown icon for first place', () => {
    const { container } = render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    const crownElements = container.querySelectorAll('.text-gold');
    expect(crownElements.length).toBeGreaterThan(0);
  });

  it('handles inline styles safely for export', () => {
    const { container } = render(<GroupLeaderboard entries={mockEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    const elementsWithInlineStyles = container.querySelectorAll('[style]');
    elementsWithInlineStyles.forEach((element) => {
      const style = (element as HTMLElement).style;
      const backgroundValue = style.background;
      
      if (backgroundValue) {
        expect(backgroundValue).not.toContain('oklch');
        expect(backgroundValue).not.toContain('oklab');
      }
    });
  });

  it('only counts ratings from current account profiles', () => {
    // Entry with ratings from two different accounts
    const multiAccountEntries: Entry[] = [
      {
        id: 'entry-1',
        number: 1,
        artist: 'Test Artist',
        song: 'Test Song',
        heat: 'Deltävling 1',
        heatDate: '2026-01-31',
        userRatings: [
          {
            profileId: 'profile-1', // belongs to mockUsers[0]
            profileName: 'Profile 1',
            ratings: {
              song: { rating: 5, comment: '' },
              scenography: { rating: 5, comment: '' },
              clothes: { rating: 5, comment: '' },
              vocals: { rating: 5, comment: '' },
              lyrics: { rating: 5, comment: '' },
              postcard: { rating: 5, comment: '' },
            },
            totalScore: 30,
          },
          {
            profileId: 'other-profile', // belongs to a different account
            profileName: 'Other Profile',
            ratings: {
              song: { rating: 1, comment: '' },
              scenography: { rating: 1, comment: '' },
              clothes: { rating: 1, comment: '' },
              vocals: { rating: 1, comment: '' },
              lyrics: { rating: 1, comment: '' },
              postcard: { rating: 1, comment: '' },
            },
            totalScore: 6,
          },
        ],
      },
    ];
    
    render(<GroupLeaderboard entries={multiAccountEntries} users={mockUsers} currentUser={mockUsers[0]} />);
    
    // Should show average of 30 (only profile-1), not 18 (average of both)
    expect(screen.getByText('30.0')).toBeInTheDocument();
    expect(screen.queryByText('18.0')).not.toBeInTheDocument();
    expect(screen.getByText('1 betyg')).toBeInTheDocument();
  });
});
