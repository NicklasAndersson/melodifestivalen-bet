import { z } from 'zod';
import type { User, Profile, Entry, UserRating, CategoryRating } from './types';

// ============================================================================
// Zod Schemas for Data Validation
// ============================================================================

/**
 * Schema for a single category rating (0-5 stars with optional comment)
 */
export const CategoryRatingSchema = z.object({
  rating: z.number().int().min(0).max(5),
  comment: z.string(),
});

/**
 * Schema for all rating categories
 */
export const RatingsSchema = z.object({
  song: CategoryRatingSchema,
  clothes: CategoryRatingSchema,
  scenography: CategoryRatingSchema,
  vocals: CategoryRatingSchema,
  lyrics: CategoryRatingSchema,
  postcard: CategoryRatingSchema,
});

/**
 * Schema for a user's rating on an entry
 */
export const UserRatingSchema = z.object({
  profileId: z.string().min(1, 'profileId is required'),
  profileName: z.string().min(1, 'profileName is required'),
  ratings: RatingsSchema,
  totalScore: z.number().int().min(0).max(30),
});

/**
 * Schema for a contest entry
 */
export const EntrySchema = z.object({
  id: z.string().min(1, 'Entry id is required'),
  number: z.number().int().positive('Entry number must be positive'),
  artist: z.string().min(1, 'Artist is required'),
  song: z.string().min(1, 'Song is required'),
  heat: z.string().min(1, 'Heat is required'),
  heatDate: z.string().min(1, 'Heat date is required'),
  userRatings: z.array(UserRatingSchema),
});

/**
 * Schema for a user profile
 */
export const ProfileSchema = z.object({
  id: z.string().min(1, 'Profile id is required'),
  userId: z.string().min(1, 'userId is required'),
  nickname: z.string().min(1, 'Nickname is required'),
  createdAt: z.number().positive('createdAt must be a positive timestamp'),
});

/**
 * Schema for a user account
 */
export const UserSchema = z.object({
  id: z.string().min(1, 'User id is required'),
  email: z.string().email('Invalid email format'),
  githubLogin: z.string().min(1, 'GitHub login is required'),
  avatarUrl: z.string().optional(),
  createdAt: z.number().positive('createdAt must be a positive timestamp'),
  profiles: z.array(ProfileSchema),
});

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OrphanedRating {
  entryId: string;
  profileId: string;
  profileName: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates users array structure and data integrity
 */
export function validateUsers(users: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!Array.isArray(users)) {
    return { valid: false, errors: ['Users data is not an array'], warnings: [] };
  }
  
  const userIds = new Set<string>();
  const profileIds = new Set<string>();
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userPrefix = `User[${i}]`;
    
    // Validate user structure
    const userResult = UserSchema.safeParse(user);
    if (!userResult.success) {
      for (const issue of userResult.error.issues) {
        errors.push(`${userPrefix}: ${issue.path.join('.')} - ${issue.message}`);
      }
      continue;
    }
    
    const validUser = userResult.data;
    
    // Check for duplicate user IDs
    if (userIds.has(validUser.id)) {
      errors.push(`${userPrefix}: Duplicate user id '${validUser.id}'`);
    }
    userIds.add(validUser.id);
    
    // Validate profiles
    for (let j = 0; j < validUser.profiles.length; j++) {
      const profile = validUser.profiles[j];
      const profilePrefix = `${userPrefix}.profiles[${j}]`;
      
      // Check profile references this user
      if (profile.userId !== validUser.id) {
        errors.push(`${profilePrefix}: userId '${profile.userId}' does not match parent user id '${validUser.id}'`);
      }
      
      // Check for duplicate profile IDs across all users
      if (profileIds.has(profile.id)) {
        errors.push(`${profilePrefix}: Duplicate profile id '${profile.id}'`);
      }
      profileIds.add(profile.id);
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates entries array structure and data integrity
 */
export function validateEntries(entries: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!Array.isArray(entries)) {
    return { valid: false, errors: ['Entries data is not an array'], warnings: [] };
  }
  
  const entryIds = new Set<string>();
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryPrefix = `Entry[${i}]`;
    
    // Validate entry structure
    const entryResult = EntrySchema.safeParse(entry);
    if (!entryResult.success) {
      for (const issue of entryResult.error.issues) {
        errors.push(`${entryPrefix}: ${issue.path.join('.')} - ${issue.message}`);
      }
      continue;
    }
    
    const validEntry = entryResult.data;
    
    // Check for duplicate entry IDs
    if (entryIds.has(validEntry.id)) {
      errors.push(`${entryPrefix}: Duplicate entry id '${validEntry.id}'`);
    }
    entryIds.add(validEntry.id);
    
    // Validate each rating's totalScore is correct
    for (let j = 0; j < validEntry.userRatings.length; j++) {
      const rating = validEntry.userRatings[j];
      const ratingPrefix = `${entryPrefix}.userRatings[${j}]`;
      
      const calculatedScore = 
        rating.ratings.song.rating +
        rating.ratings.clothes.rating +
        rating.ratings.scenography.rating +
        rating.ratings.vocals.rating +
        rating.ratings.lyrics.rating +
        rating.ratings.postcard.rating;
      
      if (rating.totalScore !== calculatedScore) {
        warnings.push(`${ratingPrefix}: totalScore (${rating.totalScore}) does not match sum of ratings (${calculatedScore})`);
      }
      
      // Check for duplicate profileId within the same entry
      const duplicateProfileRating = validEntry.userRatings.findIndex(
        (r, idx) => idx < j && r.profileId === rating.profileId
      );
      if (duplicateProfileRating >= 0) {
        errors.push(`${ratingPrefix}: Duplicate profileId '${rating.profileId}' within entry`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validates referential integrity between users and entries
 * Returns orphaned ratings (ratings with profileId not found in any user's profiles)
 */
export function validateReferentialIntegrity(
  users: User[],
  entries: Entry[]
): { valid: boolean; errors: string[]; warnings: string[]; orphanedRatings: OrphanedRating[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const orphanedRatings: OrphanedRating[] = [];
  
  // Build set of all valid profile IDs
  const validProfileIds = new Set<string>();
  for (const user of users) {
    for (const profile of user.profiles) {
      validProfileIds.add(profile.id);
    }
  }
  
  // Check all ratings reference valid profiles
  for (const entry of entries) {
    for (const rating of entry.userRatings) {
      if (!validProfileIds.has(rating.profileId)) {
        orphanedRatings.push({
          entryId: entry.id,
          profileId: rating.profileId,
          profileName: rating.profileName,
        });
      }
    }
  }
  
  // Orphaned ratings are warnings, not errors (data is preserved)
  if (orphanedRatings.length > 0) {
    const uniqueOrphanedProfiles = [...new Set(orphanedRatings.map(o => o.profileName))];
    warnings.push(
      `Found ${orphanedRatings.length} rating(s) from ${uniqueOrphanedProfiles.length} deleted profile(s): ${uniqueOrphanedProfiles.join(', ')}`
    );
  }
  
  return { valid: true, errors, warnings, orphanedRatings };
}

/**
 * Comprehensive validation of all KV data
 * Validates structure, data types, constraints, and referential integrity
 */
export function validateKVData(
  users: unknown,
  entries: unknown
): { 
  valid: boolean; 
  errors: string[]; 
  warnings: string[]; 
  orphanedRatings: OrphanedRating[];
  validUsers: User[];
  validEntries: Entry[];
} {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let orphanedRatings: OrphanedRating[] = [];
  
  // Validate users
  const usersResult = validateUsers(users);
  allErrors.push(...usersResult.errors);
  allWarnings.push(...usersResult.warnings);
  
  // Validate entries
  const entriesResult = validateEntries(entries);
  allErrors.push(...entriesResult.errors);
  allWarnings.push(...entriesResult.warnings);
  
  // If basic validation passed, check referential integrity
  if (usersResult.valid && entriesResult.valid) {
    const integrityResult = validateReferentialIntegrity(
      users as User[],
      entries as Entry[]
    );
    allErrors.push(...integrityResult.errors);
    allWarnings.push(...integrityResult.warnings);
    orphanedRatings = integrityResult.orphanedRatings;
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    orphanedRatings,
    validUsers: usersResult.valid ? (users as User[]) : [],
    validEntries: entriesResult.valid ? (entries as Entry[]) : [],
  };
}

/**
 * Quick validation check for a single user object
 */
export function isValidUser(user: unknown): user is User {
  return UserSchema.safeParse(user).success;
}

/**
 * Quick validation check for a single profile object
 */
export function isValidProfile(profile: unknown): profile is Profile {
  return ProfileSchema.safeParse(profile).success;
}

/**
 * Quick validation check for a single entry object
 */
export function isValidEntry(entry: unknown): entry is Entry {
  return EntrySchema.safeParse(entry).success;
}
