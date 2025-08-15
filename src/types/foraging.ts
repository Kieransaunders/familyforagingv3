export interface ForagingFind {
  id: string;
  name: string;
  category: 'plant' | 'fungi' | 'berry' | 'nut' | 'herb' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos: string[];
  notes: string;
  dateFound: Date;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  habitat: string;
  isPrivate: boolean;
  userId: string;
  tags: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  category: 'drinks' | 'meals' | 'preserves' | 'medicinal';
  season: string[];
  requiredFinds: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  userNotes?: string;
}

export interface MapFilter {
  category: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  showPrivate: boolean;
  radius: number;
  inSeasonNow?: boolean; // Only show finds for plants in season for current month
}

export interface SeasonalSuggestion {
  name: string;
  category: string;
  description: string;
  bestMonths: number[];
  habitat: string;
  identificationTips: string[];
}