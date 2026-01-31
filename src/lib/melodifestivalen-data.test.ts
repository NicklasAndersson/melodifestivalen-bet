import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HEAT_DATES,
  MELODIFESTIVALEN_2026,
  isVotingAllowed,
  isHeatToday,
  getHeatCity,
  getHeatVenue,
  getVotingOpensDate,
  getMellopediaUrl,
  getTimeUntilHeat,
} from './melodifestivalen-data';

describe('melodifestivalen-data', () => {
  describe('HEAT_DATES', () => {
    it('should have correct dates for all heats', () => {
      expect(HEAT_DATES['Deltävling 1']).toBe('2026-01-31');
      expect(HEAT_DATES['Deltävling 2']).toBe('2026-02-07');
      expect(HEAT_DATES['Deltävling 3']).toBe('2026-02-14');
      expect(HEAT_DATES['Deltävling 4']).toBe('2026-02-21');
      expect(HEAT_DATES['Deltävling 5']).toBe('2026-02-28');
      expect(HEAT_DATES['Andra chansen']).toBe('2026-03-07');
      expect(HEAT_DATES['Final']).toBe('2026-03-14');
    });
  });

  describe('MELODIFESTIVALEN_2026', () => {
    it('should have 30 entries total (6 per heat x 5 heats)', () => {
      expect(MELODIFESTIVALEN_2026).toHaveLength(30);
    });

    it('should have 6 entries per deltävling', () => {
      const heats = ['Deltävling 1', 'Deltävling 2', 'Deltävling 3', 'Deltävling 4', 'Deltävling 5'];
      heats.forEach(heat => {
        const entriesInHeat = MELODIFESTIVALEN_2026.filter(e => e.heat === heat);
        expect(entriesInHeat).toHaveLength(6);
      });
    });

    it('should have correct structure for each entry', () => {
      MELODIFESTIVALEN_2026.forEach(entry => {
        expect(entry).toHaveProperty('number');
        expect(entry).toHaveProperty('artist');
        expect(entry).toHaveProperty('song');
        expect(entry).toHaveProperty('heat');
        expect(entry).toHaveProperty('heatDate');
        expect(typeof entry.number).toBe('number');
        expect(typeof entry.artist).toBe('string');
        expect(typeof entry.song).toBe('string');
      });
    });

    it('should have entries numbered 1-6 in each heat', () => {
      const heats = ['Deltävling 1', 'Deltävling 2', 'Deltävling 3', 'Deltävling 4', 'Deltävling 5'];
      heats.forEach(heat => {
        const entriesInHeat = MELODIFESTIVALEN_2026.filter(e => e.heat === heat);
        const numbers = entriesInHeat.map(e => e.number).sort((a, b) => a - b);
        expect(numbers).toEqual([1, 2, 3, 4, 5, 6]);
      });
    });
  });

  describe('isVotingAllowed', () => {
    it('should always return true (current implementation)', () => {
      expect(isVotingAllowed('2026-01-31')).toBe(true);
      expect(isVotingAllowed('2025-01-01')).toBe(true);
      expect(isVotingAllowed('2030-12-31')).toBe(true);
    });
  });

  describe('isHeatToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true when heat date is today', () => {
      // Set system time to 2026-01-31 at 15:00 Stockholm time
      vi.setSystemTime(new Date('2026-01-31T15:00:00+01:00'));
      expect(isHeatToday('2026-01-31')).toBe(true);
    });

    it('should return false when heat date is not today', () => {
      vi.setSystemTime(new Date('2026-01-30T15:00:00+01:00'));
      expect(isHeatToday('2026-01-31')).toBe(false);
    });

    it('should return false for past dates', () => {
      vi.setSystemTime(new Date('2026-02-01T15:00:00+01:00'));
      expect(isHeatToday('2026-01-31')).toBe(false);
    });
  });

  describe('getHeatCity', () => {
    it('should return correct city for each heat', () => {
      expect(getHeatCity('Deltävling 1')).toBe('Linköping');
      expect(getHeatCity('Deltävling 2')).toBe('Göteborg');
      expect(getHeatCity('Deltävling 3')).toBe('Kristianstad');
      expect(getHeatCity('Deltävling 4')).toBe('Malmö');
      expect(getHeatCity('Deltävling 5')).toBe('Sundsvall');
      expect(getHeatCity('Andra chansen')).toBe('Stockholm');
      expect(getHeatCity('Final')).toBe('Stockholm');
    });

    it('should return empty string for unknown heat', () => {
      expect(getHeatCity('Unknown Heat')).toBe('');
    });
  });

  describe('getHeatVenue', () => {
    it('should return correct venue for each heat', () => {
      expect(getHeatVenue('Deltävling 1')).toBe('Saab Arena');
      expect(getHeatVenue('Deltävling 2')).toBe('Scandinavium');
      expect(getHeatVenue('Deltävling 3')).toBe('Kristianstad Arena');
      expect(getHeatVenue('Deltävling 4')).toBe('Malmö Arena');
      expect(getHeatVenue('Deltävling 5')).toBe('Gärdehov Arena');
      expect(getHeatVenue('Andra chansen')).toBe('Strawberry Arena');
      expect(getHeatVenue('Final')).toBe('Strawberry Arena');
    });

    it('should return empty string for unknown heat', () => {
      expect(getHeatVenue('Unknown Heat')).toBe('');
    });
  });

  describe('getVotingOpensDate', () => {
    it('should return date 24 hours before heat time (20:00)', () => {
      const votingOpens = getVotingOpensDate('2026-01-31');
      const expected = new Date('2026-01-30T20:00:00');
      
      expect(votingOpens.getFullYear()).toBe(2026);
      expect(votingOpens.getMonth()).toBe(0); // January = 0
      expect(votingOpens.getDate()).toBe(30);
      expect(votingOpens.getHours()).toBe(20);
    });

    it('should handle different heat dates', () => {
      const votingOpens = getVotingOpensDate('2026-02-07');
      expect(votingOpens.getDate()).toBe(6);
      expect(votingOpens.getMonth()).toBe(1); // February = 1
    });
  });

  describe('getMellopediaUrl', () => {
    it('should replace spaces with underscores', () => {
      expect(getMellopediaUrl('Hello World')).toBe('https://mellopedia.svt.se/index.php/Hello_World');
    });

    it('should encode ampersands', () => {
      expect(getMellopediaUrl('A & B')).toBe('https://mellopedia.svt.se/index.php/A_%26_B');
    });

    it('should preserve Swedish characters', () => {
      expect(getMellopediaUrl('Åäö')).toBe('https://mellopedia.svt.se/index.php/Åäö');
      expect(getMellopediaUrl('ÅÄÖ')).toBe('https://mellopedia.svt.se/index.php/ÅÄÖ');
    });

    it('should handle artist names correctly', () => {
      expect(getMellopediaUrl('Sanna Nielsen')).toBe('https://mellopedia.svt.se/index.php/Sanna_Nielsen');
      expect(getMellopediaUrl("A*Teens")).toBe('https://mellopedia.svt.se/index.php/A*Teens');
    });

    it('should handle multiple spaces', () => {
      expect(getMellopediaUrl('Hello   World')).toBe('https://mellopedia.svt.se/index.php/Hello_World');
    });
  });

  describe('getTimeUntilHeat', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return zeros when heat time has passed', () => {
      vi.setSystemTime(new Date('2026-01-31T21:00:00'));
      const result = getTimeUntilHeat('2026-01-31');
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.totalMs).toBe(0);
    });

    it('should calculate correct time remaining', () => {
      // Set time to exactly 1 day, 2 hours, 30 minutes, 15 seconds before heat
      // Heat is at 2026-01-31T20:00:00
      vi.setSystemTime(new Date('2026-01-30T17:29:45'));
      const result = getTimeUntilHeat('2026-01-31');
      
      expect(result.days).toBe(1);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(15);
      expect(result.totalMs).toBeGreaterThan(0);
    });

    it('should return correct hours when less than a day', () => {
      // Set time to 5 hours before heat (2026-01-31 at 15:00)
      vi.setSystemTime(new Date('2026-01-31T15:00:00'));
      const result = getTimeUntilHeat('2026-01-31');
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(5);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    it('should return correct minutes when less than an hour', () => {
      // Set time to 30 minutes before heat (2026-01-31 at 19:30)
      vi.setSystemTime(new Date('2026-01-31T19:30:00'));
      const result = getTimeUntilHeat('2026-01-31');
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(0);
    });

    it('should handle multiple days correctly', () => {
      // Set time to 7 days before heat
      vi.setSystemTime(new Date('2026-01-24T20:00:00'));
      const result = getTimeUntilHeat('2026-01-31');
      
      expect(result.days).toBe(7);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });
});
