export type PlantCategory = 'berries' | 'leaves' | 'nuts' | 'mushrooms' | 'flowers' | 'roots';

export interface PlantUse {
  culinary: string[];
  medicinal: string[];
  traditional: string[];
  recipes: string[]; // Recipe IDs that use this plant
}

export interface PlantEdibility {
  safe: boolean;
  preparation: string[];
  warnings?: string[];
  toxicParts?: string[];
}

export interface PlantIdentification {
  keyFeatures: string[];
  habitat: string[];
  season: string[];
  lookAlikes: string[];
  size: string;
}

export interface Plant {
  id: string;
  name: string;
  latinName: string;
  family: string;
  category: PlantCategory;
  heroImage: string;
  images: string[];
  identification: PlantIdentification;
  edibility: PlantEdibility;
  uses: PlantUse;
  ethics: string[];
  funFacts?: string;
  conservationStatus?: 'common' | 'uncommon' | 'rare' | 'protected';
}

export interface PlantFilter {
  category: PlantCategory[];
  season: string[];
  edible: boolean | null;
  searchQuery: string;
}