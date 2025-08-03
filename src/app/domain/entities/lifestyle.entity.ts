export interface Travel {
  id: string;
  country: string;
  city: string;
  title: string;
  description: string;
  images: string[];
  visitDate: Date;
  duration: number; // in days
  highlights: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hobby {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: HobbyCategory;
  startedDate?: Date;
  featured: boolean;
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum HobbyCategory {
  SPORTS = 'sports',
  ARTS = 'arts',
  MUSIC = 'music',
  TECHNOLOGY = 'technology',
  TRAVEL = 'travel',
  READING = 'reading',
  GAMING = 'gaming',
  COOKING = 'cooking',
  PHOTOGRAPHY = 'photography',
  OTHER = 'other'
}
