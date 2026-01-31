# Data Model Documentation

## Overview

This document describes the complete data model for the Melodifestivalen 2026 rating application. The application uses Spark's Key-Value (KV) storage for all persistence, with an additional localStorage-based backup system for data recovery.

## Storage Keys

### Primary Storage (Spark KV)

The application uses three primary KV storage keys:

- `mello-users-v2`: Array of User objects
- `mello-entries-v2`: Array of Entry objects (contains all ratings)
- `mello-data-version-v2`: Number indicating the current data version

### Backup Storage (localStorage)

The application automatically creates local backups in the browser's localStorage:

- `mello-local-backup-v2`: Complete backup of entries and users
- `mello-last-backup-date-v2`: Timestamp of the last backup
- `mello-backup-warning-dismissed-v2`: User preference for backup warnings

**Important:** localStorage is NOT a replacement for manual backups. It serves as an emergency recovery mechanism only.

## Data Structures

### User

Represents a GitHub-authenticated user who can have multiple profiles.

```typescript
interface User {
  id: string;                    // Unique identifier (format: "user-{timestamp}")
  email: string;                 // GitHub email address
  githubLogin: string;           // GitHub username
  avatarUrl?: string;            // GitHub avatar URL
  createdAt: number;             // Unix timestamp
  profiles: Profile[];           // Array of profiles belonging to this user
}
```

**Key Points:**
- One GitHub account = One User
- Users are uniquely identified by their email address
- Users can create multiple profiles

### Profile

Represents a rating profile under a user account. Each profile has independent ratings.

```typescript
interface Profile {
  id: string;                    // Unique identifier (format: "profile-{timestamp}")
  userId: string;                // Reference to parent User.id
  nickname: string;              // Display name for this profile
  createdAt: number;             // Unix timestamp
}
```

**Key Points:**
- Multiple profiles can exist per user
- Each profile maintains separate ratings
- Profiles are used for group comparisons

### Entry

Represents a Melodifestivalen contestant entry with all associated ratings.

```typescript
interface Entry {
  id: string;                    // Unique identifier (format: "{artist}-{song}" normalized)
  number: number;                // Entry number within heat (1-6)
  artist: string;                // Artist name
  song: string;                  // Song title
  heat: string;                  // Heat name (e.g., "Deltävling 1")
  heatDate: string;              // Date in ISO format (YYYY-MM-DD)
  userRatings: UserRating[];     // Array of all ratings for this entry
}
```

**Key Points:**
- Entry IDs are derived from artist and song names (kebab-case)
- Each entry contains all user ratings from all profiles
- Number is unique within each heat (1-6)

### UserRating

Represents a single profile's rating for an entry across all categories.

```typescript
interface UserRating {
  profileId: string;             // Reference to Profile.id
  profileName: string;           // Profile nickname (denormalized for performance)
  ratings: {
    song: CategoryRating;        // Rating for the song
    clothes: CategoryRating;     // Rating for clothes/costume
    scenography: CategoryRating; // Rating for stage design
    vocals: CategoryRating;      // Rating for vocal performance
    lyrics: CategoryRating;      // Rating for lyrics
    postcard: CategoryRating;    // Rating for the postcard/intro video
  };
  totalScore: number;            // Sum of all category ratings
}
```

**Key Points:**
- One UserRating per profile per entry
- Contains ratings for all 6 categories
- Total score is calculated as sum of all ratings

### CategoryRating

Represents a single category rating with optional comment.

```typescript
interface CategoryRating {
  rating: number;                // Rating value (0-10)
  comment: string;               // Optional comment (can be empty)
}
```

**Key Points:**
- Ratings are integers from 0 to 10
- Comments are optional and can be empty strings
- Each category in a UserRating has its own CategoryRating

## Data Relationships

```
User (1) ────── (N) Profile
                      │
                      │ (profileId)
                      │
Entry (1) ────── (N) UserRating
```

### Hierarchy
1. **User** (GitHub account level)
   - Has multiple **Profiles**
2. **Profile** (Individual rating identity)
   - Can rate multiple **Entries**
3. **Entry** (Contestant)
   - Has multiple **UserRatings** (one per profile)

### Data Denormalization

For performance, some data is denormalized:
- `UserRating.profileName` duplicates `Profile.nickname`
- This avoids lookups when displaying ratings

## Data Migration

### Version Management

The application uses an automatic versioning system:
```typescript
dataVersion = totalEntries * 1000 + sumOfAllEntryNumbers
```

This ensures that any change to the entry list (additions, removals, or reordering) triggers a migration.

### Migration Strategy

When entries are updated, the migration system:

1. **Creates new entry list** from source data
2. **Matches old entries to new entries** using multiple strategies:
   - Exact ID match (artist-song normalized)
   - Normalized artist + song match
   - Song title only match
   - Partial word overlap match
   - Heat number + position match
3. **Transfers ratings** from old to new entries
4. **Validates** the resulting data structure
5. **Reports** migration results to user

### Migration Preservation

Ratings are preserved even when:
- Entry metadata changes (heat, date, number)
- Artist or song names have minor changes
- Entries are reordered

### Data Loss Prevention

The migration system provides:
- Multiple matching strategies (fallback chain)
- Validation of migrated data
- User notification of migration results
- Console logging of unmatched entries

## Data Flow

### Rating Flow
```
User → Profile Selection → Entry Selection → Category Rating → Entry Update
                                                                      ↓
                                                           KV Storage (mello-entries-v2)
```

### Reading Flow
```
KV Storage → App State → Component State → UI Display
```

### Update Flow
```
UI Action → Functional Update → Entry Mutation → KV Storage
```

## Data Integrity

### Constraints

1. **User Email Uniqueness**: Each email can only have one User
2. **Profile ID Uniqueness**: Profile IDs are globally unique
3. **Entry ID Uniqueness**: Entry IDs must be unique across all heats
4. **One Rating Per Profile**: Each profile can only have one rating per entry

### Validation

The system validates:
- Entry IDs are present and unique
- Artist and song names exist
- Heat and date information is complete
- Entry numbers are valid (1-6 per heat)

## Backup & Restore System

### Multi-Level Backup Strategy

The application implements a comprehensive three-level backup strategy:

#### 1. Automatic Local Backup (localStorage)
- **Purpose**: Emergency recovery from accidental data loss
- **Trigger**: Automatic on every data change
- **Scope**: Complete application state (all entries and users)
- **Limitations**: 
  - Only available in the same browser/device
  - Cleared if user clears browser data
  - Not synced across devices
  - **Not a replacement for manual backups**

#### 2. Manual JSON Export
- **Purpose**: User-controlled backup for long-term storage
- **Trigger**: User clicks "Exportera alla betyg" button
- **Scope**: Profile-specific ratings only
- **Benefits**:
  - Portable across devices and browsers
  - Can be stored securely offline
  - Versioned and timestamped
  - Human-readable JSON format

#### 3. Image Export (Share)
- **Purpose**: Social sharing and visual backup
- **Trigger**: User clicks "Ladda ner som bild" button
- **Scope**: Top 10 rated entries with full details
- **Format**: PNG image optimized for social media

### Data Recovery System

#### Automatic Recovery Detection

When the application loads, it:
1. Checks localStorage for recent backups
2. Compares backup rating count with current KV storage
3. If significant data loss detected, displays recovery banner
4. Offers one-click restoration or manual download

#### Recovery Banner Features

The `DataRecoveryBanner` component appears when:
- Local backup exists in localStorage
- Backup contains more ratings than current state
- User hasn't dismissed the recovery option

Recovery options provided:
1. **Återställ backup**: Restores complete state from localStorage
2. **Ladda ner backup**: Downloads localStorage backup as JSON
3. **Backup nuvarande data**: Exports current state before recovery
4. **Ignorera**: Dismisses and clears the local backup

#### Backup Reminder System

The `BackupReminder` component:
- Appears for users with ratings but no recent backup
- Shows after 7 days without creating a manual backup
- Can be dismissed with "Påminn senare"
- Resets after user creates a manual backup

### Export Format

#### Manual Backup (JSON)

The backup system exports ratings in JSON format:

```typescript
interface BackupData {
  version: number;               // Backup format version (currently 1)
  exportDate: string;            // ISO timestamp of export
  profileId: string;             // Profile that created the backup
  profileName: string;           // Profile nickname at export time
  entries: Array<{
    id: string;                  // Entry ID
    number: number;              // Entry number
    artist: string;              // Artist name
    song: string;                // Song title
    heat: string;                // Heat name
    heatDate: string;            // Heat date
    userRatings: UserRating[];   // Only ratings from exporting profile
  }>;
}
```

### Export Features

1. **Selective Export**: Only exports entries that have ratings
2. **Profile Scoped**: Only includes ratings from the exporting profile
3. **Metadata Included**: Entry details preserved for validation
4. **Timestamped**: Export date recorded for tracking
5. **Human Readable**: JSON formatted with indentation

### Import Features

1. **Cross-Profile Import**: Can import backups from different profiles
2. **Overwrite Protection**: Confirms before overwriting existing ratings
3. **Merge Strategy**: Preserves other profiles' ratings during import
4. **Validation**: Checks backup format and data structure
5. **Error Handling**: Clear error messages for invalid backups

### Import Process

```
File Selection → JSON Parse → Validation → Profile Check
                                                  ↓
                                    (Different Profile?)
                                         ↓          ↓
                                       Yes         No
                                         ↓          ↓
                                   Confirmation  Continue
                                         ↓          ↓
                                    Entry Matching
                                         ↓
                                   Rating Merge
                                         ↓
                                    KV Storage Update
```

### Backup Use Cases

1. **Device Migration**: Transfer ratings to new device/browser
2. **Disaster Recovery**: Restore after data loss
3. **Profile Cloning**: Duplicate ratings to new profile
4. **Sharing**: Share ratings with friends (manual transfer)
5. **Version Control**: Keep snapshots of ratings over time

### Best Practices

1. **Regular Exports**: Export after each rating session (manual backup)
2. **Secure Storage**: Keep backup files in safe location
3. **File Naming**: Default includes profile name and date
4. **Verification**: Test imports in safe environment first
5. **Cross-Check**: Compare imported data after restore
6. **Don't Rely on localStorage**: Always create manual backups - localStorage is emergency recovery only
7. **Before Publishing**: Export all data before any app updates or republishing

### Data Loss Prevention

#### Why Data Can Be Lost

Data loss can occur when:
1. **App Republishing**: New deployments may reset KV storage
2. **Browser Data Clearing**: Removes localStorage backups
3. **Device Change**: Data doesn't sync across devices
4. **Storage Quota**: localStorage has size limits
5. **Private/Incognito Mode**: Storage may not persist

#### Protection Mechanisms

1. **Automatic localStorage Backup**
   - Created on every data change
   - Provides safety net for accidental loss
   - Limited to same browser/device

2. **Recovery Detection**
   - Compares current state with backup
   - Alerts user to potential data loss
   - Offers immediate restoration

3. **Backup Reminders**
   - Prompts users weekly to create manual backups
   - Can be dismissed but reappears
   - Emphasizes importance of exports

4. **Export Warnings**
   - Clear messaging about data persistence
   - Instructions for backup before updates
   - Multiple export format options

#### User Education

The application prominently displays:
- Warning that data is stored locally
- Instructions to backup regularly
- Clear export/import workflows
- Recovery options when data loss detected

## Performance Considerations

### Optimizations

1. **Single Array Storage**: All entries in one array for atomic updates
2. **Denormalized Names**: Profile names stored in ratings to avoid lookups
3. **Computed Total Scores**: Pre-calculated for sorting/display
4. **Functional Updates**: Using React state updater functions to avoid stale closures

### Trade-offs

- **Storage Size**: Denormalization increases storage but improves read performance
- **Update Complexity**: Atomic updates require full array replacement but ensure consistency
- **Migration Time**: Comprehensive matching takes time but prevents data loss

## Future Considerations

### Potential Improvements

1. **Batch Updates**: Group multiple rating updates into single KV write
2. **Incremental Migration**: Only migrate changed entries
3. **Automatic Backups**: Scheduled or trigger-based automatic exports
4. **Undo System**: Allow reverting recent changes
5. **Cloud Sync**: Synchronize backups across devices

### Scalability

Current design supports:
- Unlimited users
- Unlimited profiles per user
- ~50 entries (Melodifestivalen scale)
- Unlimited ratings

For larger scales, consider:
- Pagination of entries
- Lazy loading of ratings
- Indexed lookups
- Separate rating storage
