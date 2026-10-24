import { describe, expect, it } from 'vitest';
import { validateEntries, validateUsers, validateKVData } from './validation';

const profile = { id: 'p1', userId: 'u1', nickname: 'Test', createdAt: 1 };
const user = { id: 'u1', email: 'test@example.com', githubLogin: 'test', createdAt: 1, profiles: [profile] };
const category = { rating: 5, comment: '' };
const rating = {
  profileId: 'p1', profileName: 'Test', totalScore: 30,
  ratings: { song: category, clothes: category, scenography: category, vocals: category, lyrics: category, postcard: category },
};
const entry = { id: 'e1', number: 1, artist: 'Artist', song: 'Song', heat: 'Final', heatDate: '2026-03-07', userRatings: [rating] };

describe('stored data validation across Zod upgrades', () => {
  it('accepts valid accounts and complete ratings without losing data', () => {
    const result = validateKVData([user], [entry]);
    expect(result.valid).toBe(true);
    expect(result.validUsers).toEqual([user]);
    expect(result.validEntries).toEqual([entry]);
  });
  it('returns useful errors for malformed persisted accounts', () => {
    const result = validateUsers([{ ...user, email: 'invalid' }]);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('email'))).toBe(true);
  });
  it('rejects scores outside the allowed range', () => {
    expect(validateEntries([{ ...entry, userRatings: [{ ...rating, totalScore: 31 }] }]).valid).toBe(false);
  });
  it('detects duplicate accounts and invalid profile ownership', () => {
    expect(validateUsers([user, user]).valid).toBe(false);
    expect(validateUsers([{ ...user, profiles: [{ ...profile, userId: 'other' }] }]).valid).toBe(false);
  });
  it('preserves orphaned ratings and reports them as warnings', () => {
    const result = validateKVData([{ ...user, profiles: [] }], [entry]);
    expect(result.valid).toBe(true);
    expect(result.orphanedRatings).toHaveLength(1);
    expect(result.warnings).not.toHaveLength(0);
    expect(result.validEntries).toEqual([entry]);
  });
});
