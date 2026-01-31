import { Entry } from './types';
import { migrateEntries, validateEntries, createEntryId, normalizeText } from './migration';

export function createMockEntry(artist: string, song: string, heat: string, number: number, ratingsCount: number = 0): Entry {
  const entry: Entry = {
    id: createEntryId(artist, song),
    number,
    artist,
    song,
    heat,
    heatDate: '2026-01-31',
    userRatings: [],
  };

  for (let i = 0; i < ratingsCount; i++) {
    entry.userRatings.push({
      profileId: `profile-${i}`,
      profileName: `User ${i}`,
      ratings: {
        song: { rating: 8, comment: '' },
        clothes: { rating: 7, comment: '' },
        scenography: { rating: 9, comment: '' },
        vocals: { rating: 8, comment: '' },
        lyrics: { rating: 7, comment: '' },
        postcard: { rating: 6, comment: '' },
      },
      totalScore: 45,
    });
  }

  return entry;
}

export function testMigrationScenarios() {
  console.log('=== Testing Migration Scenarios ===\n');

  console.log('Scenario 1: Exact Match');
  const oldEntries1: Entry[] = [
    createMockEntry('Greczula', 'Half of Me', 'Deltävling 1', 1, 2),
  ];
  const { entries: new1, result: result1 } = migrateEntries(oldEntries1);
  console.log(`Result: ${result1.migratedCount}/${result1.totalRatings} ratings migrated`);
  console.log(`Status: ${result1.migratedCount === result1.totalRatings ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Scenario 2: Artist Name Changed');
  const oldEntries2: Entry[] = [
    createMockEntry('A-Teens', 'Iconic', 'Deltävling 1', 6, 3),
  ];
  const { entries: new2, result: result2 } = migrateEntries(oldEntries2);
  console.log(`Result: ${result2.migratedCount}/${result2.totalRatings} ratings migrated`);
  console.log(`Status: ${result2.migratedCount === result2.totalRatings ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Scenario 3: Accents and Normalization');
  const oldEntries3: Entry[] = [
    createMockEntry('Laila Adele', 'Oxygen', 'Deltävling 2', 2, 2),
  ];
  const { entries: new3, result: result3 } = migrateEntries(oldEntries3);
  console.log(`Result: ${result3.migratedCount}/${result3.totalRatings} ratings migrated`);
  console.log(`Status: ${result3.migratedCount === result3.totalRatings ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Scenario 4: Number and Heat Match');
  const oldEntries4: Entry[] = [
    createMockEntry('Unknown Artist', 'Unknown Song', 'Deltävling 1', 1, 1),
  ];
  const { entries: new4, result: result4 } = migrateEntries(oldEntries4);
  console.log(`Result: ${result4.migratedCount}/${result4.totalRatings} ratings migrated`);
  console.log(`Status: ${result4.migratedCount === result4.totalRatings ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Scenario 5: Complete Mismatch');
  const oldEntries5: Entry[] = [
    createMockEntry('Totally Wrong', 'Not Real', 'Deltävling 1', 99, 2),
  ];
  const { entries: new5, result: result5 } = migrateEntries(oldEntries5);
  console.log(`Result: ${result5.migratedCount}/${result5.totalRatings} ratings migrated`);
  console.log(`Lost: ${result5.lostCount} ratings`);
  console.log(`Unmatched: ${result5.unmatchedEntries.join(', ')}`);
  console.log(`Status: ${result5.lostCount === result5.totalRatings ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Scenario 6: Multiple Entries with Mixed Results');
  const oldEntries6: Entry[] = [
    createMockEntry('Greczula', 'Half of Me', 'Deltävling 1', 1, 2),
    createMockEntry('Jacqline', 'Woman', 'Deltävling 1', 2, 3),
    createMockEntry('Wrong Artist', 'Wrong Song', 'Deltävling 1', 99, 1),
    createMockEntry('Robin Bengtsson', 'Honey Honey', 'Deltävling 2', 3, 2),
  ];
  const { entries: new6, result: result6 } = migrateEntries(oldEntries6);
  console.log(`Result: ${result6.migratedCount}/${result6.totalRatings} ratings migrated`);
  console.log(`Lost: ${result6.lostCount} ratings`);
  console.log(`Unmatched: ${result6.unmatchedEntries.join(', ')}`);
  console.log(`Status: ${result6.migratedCount > 0 && result6.lostCount > 0 ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Scenario 7: Entry Validation');
  const { entries: validatedEntries } = migrateEntries([]);
  const validation = validateEntries(validatedEntries);
  console.log(`Validation: ${validation.valid ? '✓ PASS' : '✗ FAIL'}`);
  if (!validation.valid) {
    console.log('Errors:', validation.errors);
  }
  console.log();

  console.log('=== All Tests Complete ===');
}

export function debugMigration(oldEntries: Entry[]) {
  console.log('=== Migration Debug ===');
  console.log(`Input entries: ${oldEntries.length}`);
  console.log(`Total ratings: ${oldEntries.reduce((sum, e) => sum + e.userRatings.length, 0)}`);
  
  const { entries: newEntries, result } = migrateEntries(oldEntries);
  
  console.log('\nMigration Result:');
  console.log(`- Migrated: ${result.migratedCount} ratings`);
  console.log(`- Lost: ${result.lostCount} ratings`);
  console.log(`- Success Rate: ${((result.migratedCount / result.totalRatings) * 100).toFixed(1)}%`);
  
  if (result.unmatchedEntries.length > 0) {
    console.log('\nUnmatched Entries:');
    result.unmatchedEntries.forEach(entry => console.log(`  - ${entry}`));
  }
  
  console.log('\nOutput entries:', newEntries.length);
  console.log('Entries with ratings:', newEntries.filter(e => e.userRatings.length > 0).length);
  
  const validation = validateEntries(newEntries);
  console.log('\nValidation:', validation.valid ? '✓ VALID' : '✗ INVALID');
  if (!validation.valid) {
    console.log('Errors:');
    validation.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  return newEntries;
}
