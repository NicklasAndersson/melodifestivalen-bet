import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingView } from './RatingView';
import type { Entry, UserRating, CategoryKey } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('div', props, props.children),
    span: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('span', props, props.children),
  },
}));

// Mock icons
vi.mock('@phosphor-icons/react', () => ({
  ArrowLeft: () => React.createElement('span', { 'data-testid': 'icon-arrow-left' }, 'ArrowLeft'),
  Sparkle: () => React.createElement('span', { 'data-testid': 'icon-sparkle' }, 'Sparkle'),
  MusicNotes: () => React.createElement('span', { 'data-testid': 'icon-music-notes' }, 'MusicNotes'),
  Palette: () => React.createElement('span', { 'data-testid': 'icon-palette' }, 'Palette'),
  Television: () => React.createElement('span', { 'data-testid': 'icon-television' }, 'Television'),
  Microphone: () => React.createElement('span', { 'data-testid': 'icon-microphone' }, 'Microphone'),
  TextAa: () => React.createElement('span', { 'data-testid': 'icon-text-aa' }, 'TextAa'),
  Star: () => React.createElement('span', { 'data-testid': 'icon-star' }, 'Star'),
  Users: () => React.createElement('span', { 'data-testid': 'icon-users' }, 'Users'),
  CalendarBlank: () => React.createElement('span', { 'data-testid': 'icon-calendar' }, 'CalendarBlank'),
  Clock: () => React.createElement('span', { 'data-testid': 'icon-clock' }, 'Clock'),
  LinkSimple: () => React.createElement('span', { 'data-testid': 'icon-link' }, 'LinkSimple'),
  Trash: () => React.createElement('span', { 'data-testid': 'icon-trash' }, 'Trash'),
  ChatCircleText: () => React.createElement('span', { 'data-testid': 'icon-chat' }, 'ChatCircleText'),
  ChartBar: () => React.createElement('span', { 'data-testid': 'icon-chart' }, 'ChartBar'),
}));

// Mock Countdown component
vi.mock('./Countdown', () => ({
  Countdown: ({ heatDate }: { heatDate: string }) => 
    React.createElement('div', { 'data-testid': 'countdown' }, `Countdown to ${heatDate}`),
}));

// Mock StarRating component
vi.mock('./StarRating', () => ({
  StarRating: ({ 
    rating, 
    onChange 
  }: { 
    rating: number; 
    onChange: (rating: number) => void;
  }) => React.createElement('div', { 'data-testid': 'star-rating' },
    React.createElement('span', { 'data-testid': 'current-rating' }, rating),
    React.createElement('button', { onClick: () => onChange(5), 'data-testid': 'rate-5-stars' }, 'Rate 5')
  ),
}));

// Mock melodifestivalen-data functions
vi.mock('@/lib/melodifestivalen-data', () => ({
  isHeatToday: vi.fn(() => false),
  getHeatCity: vi.fn(() => 'Linköping'),
  getHeatVenue: vi.fn(() => 'Saab Arena'),
  getMellopediaUrl: vi.fn((text: string) => `https://mellopedia.svt.se/${text}`),
}));

describe('RatingView', () => {
  const user = userEvent.setup();

  const createTestEntry = (overrides: Partial<Entry> = {}): Entry => ({
    id: 'entry-1',
    number: 1,
    artist: 'Test Artist',
    song: 'Test Song',
    heat: 'Deltävling 1',
    heatDate: '2026-01-31',
    userRatings: [],
    ...overrides,
  });

  const createTestUserRating = (overrides: Partial<UserRating> = {}): UserRating => ({
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
  });

  const defaultProps = {
    entry: createTestEntry(),
    currentUserId: 'profile-1',
    onBack: vi.fn(),
    onUpdateRating: vi.fn(),
    onDeleteRating: vi.fn(),
    onShowComparison: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render entry information', () => {
      render(<RatingView {...defaultProps} />);

      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Deltävling 1')).toBeInTheDocument();
    });

    it('should render entry number', () => {
      render(<RatingView {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<RatingView {...defaultProps} />);

      expect(screen.getByRole('button', { name: /tillbaka/i })).toBeInTheDocument();
    });

    it('should show total score when user has ratings', () => {
      const userRating = createTestUserRating({
        ratings: {
          song: { rating: 5, comment: '' },
          clothes: { rating: 4, comment: '' },
          scenography: { rating: 3, comment: '' },
          vocals: { rating: 4, comment: '' },
          lyrics: { rating: 3, comment: '' },
          postcard: { rating: 2, comment: '' },
        },
        totalScore: 21,
      });

      render(<RatingView {...defaultProps} userRating={userRating} />);

      expect(screen.getByText('21')).toBeInTheDocument();
      expect(screen.getByText(/\/ 30 poäng/)).toBeInTheDocument();
    });

    it('should show 0 when user has no ratings', () => {
      render(<RatingView {...defaultProps} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const onBack = vi.fn();
      render(<RatingView {...defaultProps} onBack={onBack} />);

      await user.click(screen.getByRole('button', { name: /tillbaka/i }));

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('Delete Rating Dialog', () => {
    it('should not show delete button when user has no ratings', () => {
      render(<RatingView {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /radera betyg/i })).not.toBeInTheDocument();
    });

    it('should show delete button when user has ratings', () => {
      const userRating = createTestUserRating({
        ratings: {
          song: { rating: 5, comment: 'Great!' },
          clothes: { rating: 0, comment: '' },
          scenography: { rating: 0, comment: '' },
          vocals: { rating: 0, comment: '' },
          lyrics: { rating: 0, comment: '' },
          postcard: { rating: 0, comment: '' },
        },
        totalScore: 5,
      });

      render(<RatingView {...defaultProps} userRating={userRating} />);

      expect(screen.getByRole('button', { name: /radera betyg/i })).toBeInTheDocument();
    });

    it('should open delete confirmation dialog when delete button is clicked', async () => {
      const userRating = createTestUserRating({
        ratings: {
          song: { rating: 5, comment: 'Great!' },
          clothes: { rating: 0, comment: '' },
          scenography: { rating: 0, comment: '' },
          vocals: { rating: 0, comment: '' },
          lyrics: { rating: 0, comment: '' },
          postcard: { rating: 0, comment: '' },
        },
        totalScore: 5,
      });

      render(<RatingView {...defaultProps} userRating={userRating} />);

      await user.click(screen.getByRole('button', { name: /radera betyg/i }));

      await waitFor(() => {
        expect(screen.getByText(/är du säker/i)).toBeInTheDocument();
      });
    });

    it('should call onDeleteRating and onBack when confirming deletion', async () => {
      const onDeleteRating = vi.fn();
      const onBack = vi.fn();
      const userRating = createTestUserRating({
        ratings: {
          song: { rating: 5, comment: 'Great!' },
          clothes: { rating: 0, comment: '' },
          scenography: { rating: 0, comment: '' },
          vocals: { rating: 0, comment: '' },
          lyrics: { rating: 0, comment: '' },
          postcard: { rating: 0, comment: '' },
        },
        totalScore: 5,
      });

      render(
        <RatingView 
          {...defaultProps} 
          userRating={userRating} 
          onDeleteRating={onDeleteRating}
          onBack={onBack}
        />
      );

      // Open dialog
      await user.click(screen.getByRole('button', { name: /radera betyg/i }));

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByText(/är du säker/i)).toBeInTheDocument();
      });

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /^radera$/i }));

      expect(onDeleteRating).toHaveBeenCalled();
      expect(onBack).toHaveBeenCalled();
    });

    it('should close dialog when cancel is clicked', async () => {
      const onDeleteRating = vi.fn();
      const userRating = createTestUserRating({
        ratings: {
          song: { rating: 5, comment: 'Great!' },
          clothes: { rating: 0, comment: '' },
          scenography: { rating: 0, comment: '' },
          vocals: { rating: 0, comment: '' },
          lyrics: { rating: 0, comment: '' },
          postcard: { rating: 0, comment: '' },
        },
        totalScore: 5,
      });

      render(<RatingView {...defaultProps} userRating={userRating} onDeleteRating={onDeleteRating} />);

      // Open dialog
      await user.click(screen.getByRole('button', { name: /radera betyg/i }));

      await waitFor(() => {
        expect(screen.getByText(/är du säker/i)).toBeInTheDocument();
      });

      // Cancel
      await user.click(screen.getByRole('button', { name: /avbryt/i }));

      await waitFor(() => {
        expect(screen.queryByText(/är du säker/i)).not.toBeInTheDocument();
      });

      expect(onDeleteRating).not.toHaveBeenCalled();
    });
  });

  describe('Comparison View', () => {
    it('should show compare button when other users have rated', () => {
      const entry = createTestEntry({
        userRatings: [
          createTestUserRating({ profileId: 'profile-1' }),
          createTestUserRating({ profileId: 'profile-2', profileName: 'OtherUser' }),
        ],
      });

      render(<RatingView {...defaultProps} entry={entry} />);

      expect(screen.getByRole('button', { name: /jämför betyg/i })).toBeInTheDocument();
    });

    it('should not show compare button when only current user has rated', () => {
      const entry = createTestEntry({
        userRatings: [createTestUserRating({ profileId: 'profile-1' })],
      });

      render(<RatingView {...defaultProps} entry={entry} />);

      expect(screen.queryByRole('button', { name: /jämför betyg/i })).not.toBeInTheDocument();
    });

    it('should call onShowComparison when compare button is clicked', async () => {
      const onShowComparison = vi.fn();
      const entry = createTestEntry({
        userRatings: [
          createTestUserRating({ profileId: 'profile-1' }),
          createTestUserRating({ profileId: 'profile-2', profileName: 'OtherUser' }),
        ],
      });

      render(
        <RatingView 
          {...defaultProps} 
          entry={entry}
          onShowComparison={onShowComparison}
        />
      );

      await user.click(screen.getByRole('button', { name: /jämför betyg/i }));

      expect(onShowComparison).toHaveBeenCalled();
    });
  });

  describe('Category Ratings', () => {
    it('should render all category labels', () => {
      render(<RatingView {...defaultProps} />);

      expect(screen.getByText('Låt')).toBeInTheDocument();
      expect(screen.getByText('Kläder')).toBeInTheDocument();
      expect(screen.getByText('Scenografi')).toBeInTheDocument();
      expect(screen.getByText('Sång')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Vykort')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should render Mellopedia links for song and artist', () => {
      render(<RatingView {...defaultProps} />);

      const links = screen.getAllByTestId('icon-link');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });
  });
});
