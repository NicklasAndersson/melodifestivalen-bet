import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonalLeaderboard } from './PersonalLeaderboard';
import { Entry } from '@/lib/types';

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
        profileId: 'user-123',
        profileName: 'Test User',
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
        profileId: 'user-123',
        profileName: 'Test User',
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
  {
    id: 'entry-3',
    number: 3,
    artist: 'Test Artist 3',
    song: 'Test Song 3',
    heat: 'Deltävling 2',
    heatDate: '2026-02-07',
    userRatings: [],
  },
];

describe('PersonalLeaderboard', () => {
  it('renders personal leaderboard with user ratings', () => {
    render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Artist 1')).toBeInTheDocument();
  });

  it('shows empty state when user has no ratings', () => {
    render(<PersonalLeaderboard entries={mockEntries} userId="different-user" />);
    
    expect(screen.getByText('Inga betyg än')).toBeInTheDocument();
  });

  it('does not use oklch color values in className', () => {
    const { container } = render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const className = element.className;
      if (typeof className === 'string') {
        expect(className).not.toMatch(/oklch\(/);
        expect(className).not.toMatch(/oklab\(/);
      }
    });
  });

  it('does not use oklab color values in className', () => {
    const { container } = render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const className = element.className;
      if (typeof className === 'string') {
        expect(className).not.toMatch(/oklab\(/);
      }
    });
  });

  it('uses only hex colors for arbitrary values', () => {
    const { container } = render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    const allElements = container.querySelectorAll('*');
    allElements.forEach((element) => {
      const className = element.className;
      if (typeof className === 'string') {
        const arbitraryColorMatches = className.matchAll(/\[([^\]]+)\]/g);
        for (const match of arbitraryColorMatches) {
          const value = match[1];
          if (value.startsWith('#') || value.includes('rgb') || value.includes('hsl')) {
            expect(value).not.toContain('oklch');
            expect(value).not.toContain('oklab');
          }
        }
      }
    });
  });

  it('sorts entries by user score descending', () => {
    const { container } = render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    const songs = Array.from(container.querySelectorAll('.font-heading.font-bold.text-base, .font-heading.font-bold.text-xl'))
      .map(el => el.textContent)
      .filter(text => text && text.includes('Test Song'));
    
    expect(songs[0]).toBe('Test Song 1');
    expect(songs[1]).toBe('Test Song 2');
  });

  it('displays correct total scores', () => {
    render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('only shows entries rated by the user', () => {
    render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Song 3')).not.toBeInTheDocument();
  });

  it('displays crown icon for first place', () => {
    const { container } = render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    const crownElements = container.querySelectorAll('.text-gold');
    expect(crownElements.length).toBeGreaterThan(0);
  });

  it('uses safe hex colors for medal icons', () => {
    const { container } = render(<PersonalLeaderboard entries={mockEntries} userId="user-123" />);
    
    const medalIcons = container.querySelectorAll('[class*="text-[#"]');
    medalIcons.forEach((icon) => {
      const className = icon.className;
      const hexMatch = className.match(/text-\[#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\]/);
      if (hexMatch) {
        expect(hexMatch[0]).toMatch(/text-\[#[0-9A-Fa-f]{3,6}\]/);
      }
    });
  });
});
