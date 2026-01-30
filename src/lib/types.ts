export interface CategoryRating {
  rating: number;
  comment: string;
}

export interface UserRating {
  userId: string;
  userName: string;
  ratings: {
    song: CategoryRating;
    clothes: CategoryRating;
    scenography: CategoryRating;
    vocals: CategoryRating;
    lyrics: CategoryRating;
    postcard: CategoryRating;
  };
  totalScore: number;
}

export interface Entry {
  id: string;
  number: number;
  artist: string;
  song: string;
  heat: string;
  heatDate: string;
  userRatings: UserRating[];
}

export interface GroupMember {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  memberIds: string[];
  members?: GroupMember[];
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  authProvider?: 'email' | 'github';
  avatarUrl?: string;
  createdAt: number;
}

export const CATEGORIES = [
  { key: 'song', label: 'Låt', icon: 'MusicNotes' },
  { key: 'clothes', label: 'Kläder', icon: 'Palette' },
  { key: 'scenography', label: 'Scenografi', icon: 'Television' },
  { key: 'vocals', label: 'Sång', icon: 'Microphone' },
  { key: 'lyrics', label: 'Text', icon: 'TextAa' },
  { key: 'postcard', label: 'Vykort', icon: 'Television' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];

export const HEATS = [
  "Deltävling 1",
  "Deltävling 2",
  "Deltävling 3",
  "Deltävling 4",
  "Deltävling 5",
] as const;
