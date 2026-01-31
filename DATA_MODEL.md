# Data Model Documentation

## Overview

This document describes the complete data model for the Melodifestivalen 2026 rating application. The application uses Spark's Key-Value (KV) storage for all persistence.

## Storage Keys

The application uses three primary KV storage keys:

- `mello-users-v2`: Array of User objects
- `mello-entries-v2`: Array of Entry objects (contains all ratings)
- `mello-data-version-v2`: Number indicating the current data version

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
3. **Backup System**: Automatic backups before migrations
4. **Undo System**: Allow reverting recent changes

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
