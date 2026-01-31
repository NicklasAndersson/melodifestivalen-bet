import { Entry, UserRating } from './types';
import { MELODIFESTIVALEN_2026 } from './melodifestivalen-data';

export interface MigrationResult {
  migratedCount: number;
  lostCount: number;
  totalRatings: number;
  unmatchedEntries: string[];
}

export function createEntryId(artist: string, song: string): string {
  return `${artist}-${song}`.toLowerCase().replace(/\s+/g, '-');
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function migrateEntries(oldEntries: Entry[]): { entries: Entry[], result: MigrationResult } {
  const newEntries: Entry[] = MELODIFESTIVALEN_2026.map((entry) => ({
    id: createEntryId(entry.artist, entry.song),
    number: entry.number,
    artist: entry.artist,
    song: entry.song,
    heat: entry.heat,
    heatDate: entry.heatDate,
    userRatings: [],
  }));

  let migratedCount = 0;
  let lostCount = 0;
  let totalRatings = 0;
  const unmatchedEntries: string[] = [];

  for (const oldEntry of oldEntries) {
    if (oldEntry.userRatings.length === 0) continue;
    
    totalRatings += oldEntry.userRatings.length;

    const matchedNewEntry = findMatchingEntry(oldEntry, newEntries);

    if (matchedNewEntry) {
      matchedNewEntry.userRatings = [...oldEntry.userRatings];
      migratedCount += oldEntry.userRatings.length;
    } else {
      lostCount += oldEntry.userRatings.length;
      unmatchedEntries.push(`${oldEntry.artist} - ${oldEntry.song}`);
    }
  }

  return {
    entries: newEntries,
    result: {
      migratedCount,
      lostCount,
      totalRatings,
      unmatchedEntries,
    },
  };
}

function findMatchingEntry(oldEntry: Entry, newEntries: Entry[]): Entry | null {
  const oldId = oldEntry.id;
  let match = newEntries.find(e => e.id === oldId);
  if (match) return match;

  const oldNormalizedArtist = normalizeText(oldEntry.artist);
  const oldNormalizedSong = normalizeText(oldEntry.song);

  match = newEntries.find(e => 
    normalizeText(e.artist) === oldNormalizedArtist && 
    normalizeText(e.song) === oldNormalizedSong
  );
  if (match) return match;

  match = newEntries.find(e => normalizeText(e.song) === oldNormalizedSong);
  if (match) return match;

  const oldArtistWords = oldNormalizedArtist.split(/\s+/).filter(Boolean);
  const oldSongWords = oldNormalizedSong.split(/\s+/).filter(Boolean);
  
  match = newEntries.find(e => {
    const newArtistWords = normalizeText(e.artist).split(/\s+/).filter(Boolean);
    const newSongWords = normalizeText(e.song).split(/\s+/).filter(Boolean);
    
    const artistOverlap = oldArtistWords.filter(w => newArtistWords.includes(w)).length;
    const songOverlap = oldSongWords.filter(w => newSongWords.includes(w)).length;
    
    return artistOverlap >= Math.min(2, oldArtistWords.length) || 
           songOverlap >= Math.min(2, oldSongWords.length);
  });
  if (match) return match;

  if (oldEntry.number && oldEntry.heat) {
    match = newEntries.find(e => 
      e.number === oldEntry.number && 
      e.heat === oldEntry.heat
    );
    if (match) return match;
  }

  return null;
}

export function mergeUserRatings(existing: UserRating[], incoming: UserRating[]): UserRating[] {
  const merged = [...existing];
  
  for (const incomingRating of incoming) {
    const existingIndex = merged.findIndex(r => r.profileId === incomingRating.profileId);
    
    if (existingIndex >= 0) {
      merged[existingIndex] = incomingRating;
    } else {
      merged.push(incomingRating);
    }
  }
  
  return merged;
}

export function validateEntries(entries: Entry[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.id) {
      errors.push(`Entry missing id: ${entry.artist} - ${entry.song}`);
    }
    
    if (ids.has(entry.id)) {
      errors.push(`Duplicate entry id: ${entry.id}`);
    }
    ids.add(entry.id);
    
    if (!entry.artist || !entry.song) {
      errors.push(`Entry missing artist or song: ${entry.id}`);
    }
    
    if (!entry.heat || !entry.heatDate) {
      errors.push(`Entry missing heat or heatDate: ${entry.id}`);
    }
    
    if (typeof entry.number !== 'number' || entry.number < 1) {
      errors.push(`Entry has invalid number: ${entry.id}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getDataVersion(): number {
  return MELODIFESTIVALEN_2026.length * 1000 + 
         MELODIFESTIVALEN_2026.reduce((sum, e) => sum + e.number, 0);
}
