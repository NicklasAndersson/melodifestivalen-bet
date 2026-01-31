import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Countdown } from './Countdown';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('div', props, props.children),
    span: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('span', props, props.children),
  },
}));

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render countdown with correct time remaining', () => {
    // Set time to 1 day, 2 hours, 30 minutes, 15 seconds before heat (heat is at 20:00)
    vi.setSystemTime(new Date('2026-01-30T17:29:45'));

    render(<Countdown heatDate="2026-01-31" />);

    // Check that the countdown values are rendered
    expect(screen.getByText('01')).toBeInTheDocument(); // days
    expect(screen.getByText('02')).toBeInTheDocument(); // hours
    expect(screen.getByText('30')).toBeInTheDocument(); // minutes
    expect(screen.getByText('15')).toBeInTheDocument(); // seconds
  });

  it('should display correct labels for singular values', () => {
    // Set time to exactly 1 day, 1 hour, 1 minute, 1 second before heat
    vi.setSystemTime(new Date('2026-01-30T18:58:59'));

    render(<Countdown heatDate="2026-01-31" />);

    expect(screen.getByText('dag')).toBeInTheDocument();
    expect(screen.getByText('timme')).toBeInTheDocument();
    expect(screen.getByText('minut')).toBeInTheDocument();
    expect(screen.getByText('sekund')).toBeInTheDocument();
  });

  it('should display correct labels for plural values', () => {
    // Set time to 2 days, 5 hours, 30 minutes, 45 seconds before heat
    vi.setSystemTime(new Date('2026-01-29T14:29:15'));

    render(<Countdown heatDate="2026-01-31" />);

    expect(screen.getByText('dagar')).toBeInTheDocument();
    expect(screen.getByText('timmar')).toBeInTheDocument();
    expect(screen.getByText('minuter')).toBeInTheDocument();
    expect(screen.getByText('sekunder')).toBeInTheDocument();
  });

  it('should return null when heat time has passed', () => {
    // Set time to after the heat
    vi.setSystemTime(new Date('2026-01-31T21:00:00'));

    const { container } = render(<Countdown heatDate="2026-01-31" />);

    expect(container.firstChild).toBeNull();
  });

  it('should update countdown every second', async () => {
    // Set initial time to 5 seconds before some time
    vi.setSystemTime(new Date('2026-01-31T19:59:55'));

    render(<Countdown heatDate="2026-01-31" />);

    // Initial state: 5 seconds remaining
    expect(screen.getByText('05')).toBeInTheDocument();

    // Advance time by 1 second using act to trigger React updates
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('04')).toBeInTheDocument();

    // Advance by another second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('should clean up interval on unmount', () => {
    vi.setSystemTime(new Date('2026-01-30T12:00:00'));

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<Countdown heatDate="2026-01-31" />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should handle different heat dates', () => {
    // Heat date for Deltävling 2
    vi.setSystemTime(new Date('2026-02-06T20:00:00'));

    render(<Countdown heatDate="2026-02-07" />);

    // 24 hours before
    expect(screen.getByText('01')).toBeInTheDocument(); // 1 day
    expect(screen.getByText('dag')).toBeInTheDocument();
  });

  it('should pad single digit numbers with leading zero', () => {
    // Set time to have single digit values
    vi.setSystemTime(new Date('2026-01-31T19:55:55'));

    render(<Countdown heatDate="2026-01-31" />);

    // 4 minutes and 5 seconds remaining should be displayed as "04" and "05"
    expect(screen.getByText('04')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('should display all zeros just before reaching zero', () => {
    // Set time to very close to heat time
    vi.setSystemTime(new Date('2026-01-31T19:59:59'));

    render(<Countdown heatDate="2026-01-31" />);

    // Should show 00 days, 00 hours, 00 minutes, and some seconds
    expect(screen.getAllByText('00').length).toBeGreaterThanOrEqual(3);
  });
});
