export interface CategoryRating {
  rating: number;
  comment: string;
}

export interface UserRating {
  profileId: string;
  profileName: string;
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

export interface Profile {
  id: string;
  userId: string;
  nickname: string;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  githubLogin: string;
  avatarUrl?: string;
  createdAt: number;
  profiles: Profile[];
}

export const CATEGORIES = [
  { key: 'postcard', label: 'Vykort', icon: 'Television' },
  { key: 'clothes', label: 'Kläder', icon: 'Palette' },
  { key: 'scenography', label: 'Scenografi', icon: 'Television' },
  { key: 'song', label: 'Låt', icon: 'MusicNotes' },
  { key: 'vocals', label: 'Sång', icon: 'Microphone' },
  { key: 'lyrics', label: 'Text', icon: 'TextAa' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];

export const HEATS = [
  "Deltävling 1",
  "Deltävling 2",
  "Deltävling 3",
  "Deltävling 4",
  "Deltävling 5",
] as const;
