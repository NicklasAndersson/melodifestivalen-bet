# Migration System

## Overview

The Melodifestivalen 2026 rating app includes a robust data migration system that preserves user ratings when entry data is updated. This ensures that users never lose their ratings due to data changes.

## Key Features

### 1. Automatic Migration
- Runs automatically on app load when data version mismatch is detected
- No manual intervention required for normal updates
- Preserves all existing ratings during migration

### 2. Smart Matching
The system uses multiple strategies to match old entries to new entries:

1. **Exact ID Match**: Tries to match entries by their unique ID first
2. **Normalized Text Match**: Matches artist and song names after removing accents and special characters
3. **Song Title Only**: Matches by song title alone if artist name changes
4. **Partial Word Overlap**: Matches entries with significant word overlap
5. **Position Match**: Falls back to matching by heat and entry number

### 3. Data Validation
All migrated data is validated to ensure:
- All entry IDs are unique
- Required fields are present
- Entry numbers are valid
- No data corruption has occurred

### 4. Migration Reporting
Users are notified of migration results:
- Success: "Alla X betyg migrerades"
- Partial: "X/Y betyg migrerades"
- Failure: "Migrering misslyckades"

### 5. Debug Tools (Owner Only)
App owners have access to a debug interface that allows:
- Testing migrations without applying them
- Viewing detailed migration statistics
- Running validation checks
- Manually triggering migrations
- Viewing unmatched entries

## Usage

### For Users
The migration system works automatically - no action required. You may see a notification when data is updated, but your ratings are preserved.

### For Developers

#### Testing Migration
```typescript
import { testMigrationScenarios } from '@/lib/migration-test';

// Run all test scenarios
testMigrationScenarios();
```

#### Manual Migration
```typescript
import { migrateEntries } from '@/lib/migration';

const { entries, result } = migrateEntries(oldEntries);

console.log(`Migrated: ${result.migratedCount}/${result.totalRatings}`);
console.log(`Lost: ${result.lostCount}`);
console.log(`Unmatched: ${result.unmatchedEntries}`);
```

#### Validation
```typescript
import { validateEntries } from '@/lib/migration';

const validation = validateEntries(entries);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### For App Owners

Access the debug interface:
1. Log in with your GitHub account (must be app owner)
2. Select a profile
3. Click the "Debug" button in the top-right corner

Debug interface features:
- **System Status**: View current and expected data versions
- **Test Migration**: Run a dry-run migration to see results
- **Apply Migration**: Manually trigger migration
- **Run Unit Tests**: Execute test suite (results in console)
- **View Entries**: Browse all entries and their rating counts

## Version Management

The system uses an automatic versioning algorithm:
```
version = (total_entries × 1000) + sum_of_all_entry_numbers
```

This ensures any change to entries triggers migration:
- Adding new entries
- Removing entries
- Changing entry numbers
- Reordering entries

## Migration Scenarios

### Scenario 1: Minor Text Changes
**Old**: "A-Teens" - "Iconic"
**New**: "A*Teens" - "Iconic"
**Result**: ✅ Ratings preserved via normalized text matching

### Scenario 2: Artist Name Change
**Old**: "Laila Adele" - "Oxygen"
**New**: "Laila Adèle" - "Oxygen"
**Result**: ✅ Ratings preserved via accent normalization

### Scenario 3: Entry Reordering
**Old**: Deltävling 1, #3
**New**: Deltävling 1, #1
**Result**: ✅ Ratings preserved via artist/song matching

### Scenario 4: Complete Replacement
**Old**: "Unknown Artist" - "Unknown Song"
**New**: Entry doesn't exist
**Result**: ⚠️ Ratings lost (logged to console)

## Best Practices

### When Updating Entry Data

1. **Preserve IDs When Possible**
   - Keep artist and song names consistent
   - Only change metadata (heat, date, number) if needed

2. **Test Before Deploying**
   - Use the debug interface to test migration
   - Check that all ratings are preserved
   - Review unmatched entries

3. **Communicate Changes**
   - Notify users if significant changes are made
   - Explain any potential data loss

### When Adding New Features

1. **Don't Break Migration**
   - Keep `Entry` interface stable
   - Add new fields as optional
   - Provide default values for new fields

2. **Update Tests**
   - Add test scenarios for new matching logic
   - Verify edge cases
   - Test with real data

3. **Document Changes**
   - Update DATA_MODEL.md
   - Update this README
   - Add inline code comments

## Troubleshooting

### Ratings Are Missing
1. Check the browser console for unmatched entries
2. Use the debug interface to view migration results
3. Verify entry IDs haven't changed dramatically

### Migration Fails
1. Check validation errors in the debug interface
2. Verify source data is correct
3. Check for duplicate IDs or missing fields

### Performance Issues
1. Migration runs on every page load if version mismatches
2. Consider increasing version number only when necessary
3. Optimize matching algorithms if entry count grows large

## Technical Details

### Files
- `src/lib/migration.ts`: Core migration logic
- `src/lib/migration-test.ts`: Test scenarios and utilities
- `src/components/MigrationDebug.tsx`: Debug UI component
- `DATA_MODEL.md`: Complete data model documentation

### Dependencies
- No external dependencies
- Uses built-in string normalization
- Leverages TypeScript for type safety

### Performance
- O(n²) complexity for matching (acceptable for ~30 entries)
- Single pass validation
- Atomic KV updates

## Future Improvements

### Planned
- [ ] Backup system before migrations
- [ ] Undo functionality for migrations
- [ ] Export/import ratings for manual recovery
- [ ] More sophisticated matching algorithms
- [ ] Migration history/audit log

### Considered
- Incremental migrations (only changed entries)
- Server-side migration for large datasets
- User notification before data loss
- Fuzzy string matching for better accuracy

## Support

For issues or questions:
1. Check the debug interface for details
2. Review browser console logs
3. Consult DATA_MODEL.md for data structure
4. Contact the development team
