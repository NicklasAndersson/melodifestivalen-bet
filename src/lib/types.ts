export interface CategoryRating {
  rating: number;
  comment: string;
}

export interface Entry {
  id: string;
  artist: string;
  song: string;
  heat: string;
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

export const CATEGORIES = [
  { key: 'song', label: 'Låt', icon: 'MusicNotes' },
  { key: 'clothes', label: 'Kläder', icon: 'Palette' },
  { key: 'scenography', label: 'Scenografi', icon: 'Television' },
  { key: 'vocals', label: 'Sång', icon: 'Microphone' },
  { key: 'lyrics', label: 'Text', icon: 'TextAa' },
  { key: 'postcard', label: 'Vykort', icon: 'Television' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
