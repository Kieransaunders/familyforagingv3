import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForagingFind, Recipe, MapFilter } from '../types/foraging';
import { Plant } from '../types/plant';
import { plants as defaultPlants } from '../data/plants';

interface ForagingState {
  // Finds
  finds: ForagingFind[];
  addFind: (find: ForagingFind) => void;
  updateFind: (id: string, updates: Partial<ForagingFind>) => void;
  deleteFind: (id: string) => void;
  
  // Recipes
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  bulkAddRecipes: (recipes: Recipe[]) => void;
  deleteRecipe: (id: string) => void;
  favoriteRecipes: string[];
  toggleFavoriteRecipe: (id: string) => void;
  
  // Plants
  plants: Plant[];
  addPlant: (plant: Plant) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  bulkAddPlants: (plants: Plant[]) => void;
  deletePlant: (id: string) => void;
  favoritePlants: string[];
  toggleFavoritePlant: (id: string) => void;
  
  // Filters
  mapFilter: MapFilter;
  setMapFilter: (filter: Partial<MapFilter>) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // User preferences
  showHeatZones: boolean;
  setShowHeatZones: (show: boolean) => void;
  
  // Current location
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  setCurrentLocation: (location: { latitude: number; longitude: number }) => void;
  
  // Preset location for logging (from map pin)
  presetLogLocation: {
    latitude: number;
    longitude: number;
  } | null;
  setPresetLogLocation: (location: { latitude: number; longitude: number } | null) => void;
}

function monthFlagsDefault() {
  return { jan:false,feb:false,mar:false,apr:false,may:false,jun:false,jul:false,aug:false,sep:false,oct:false,nov:false,dec:false } as const;
}

function deriveMonthsFromSeasons(seasons: string[] | undefined) {
  const flags = { ...monthFlagsDefault() } as any;
  const text = (seasons || []).join(' ').toLowerCase();
  const set = (months: number[]) => months.forEach(m => {
    const map = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
    const key = map[m];
    (flags as any)[key] = true;
  });
  if (/spring/.test(text)) set([2,3,4]);
  if (/summer/.test(text)) set([5,6,7]);
  if (/(autumn|fall)/.test(text)) set([8,9,10]);
  if (/winter/.test(text)) set([11,0,1]);
  return flags;
}

function ensureInSeason(plant: Plant): Plant {
  if (plant.inSeason) return plant;
  return { ...plant, inSeason: deriveMonthsFromSeasons(plant.identification?.season) };
}

function withInSeasonDefaults(plants: Plant[]): Plant[] {
  return plants.map(ensureInSeason);
}

export const useForagingStore = create<ForagingState>()(
  persist(
    (set, get) => ({
      // Finds
      finds: [],
      addFind: (find) => set((state) => ({ finds: [...state.finds, find] })),
      updateFind: (id, updates) =>
        set((state) => ({
          finds: state.finds.map((find) =>
            find.id === id ? { ...find, ...updates } : find
          ),
        })),
      deleteFind: (id) =>
        set((state) => ({
          finds: state.finds.filter((find) => find.id !== id),
        })),
      
      // Recipes
      recipes: getDefaultRecipes(),
      addRecipe: (recipe) => set((state) => ({ recipes: [...state.recipes, recipe] })),
      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates } : recipe
          ),
        })),
      bulkAddRecipes: (newRecipes) => 
        set((state) => ({ recipes: [...state.recipes, ...newRecipes] })),
      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
          favoriteRecipes: state.favoriteRecipes.filter((fid) => fid !== id),
        })),
      favoriteRecipes: [],
      toggleFavoriteRecipe: (id) =>
        set((state) => ({
          favoriteRecipes: state.favoriteRecipes.includes(id)
            ? state.favoriteRecipes.filter((fid) => fid !== id)
            : [...state.favoriteRecipes, id],
        })),
      
      // Plants
      plants: withInSeasonDefaults(defaultPlants),
      addPlant: (plant) => set((state) => ({ plants: [...state.plants, ensureInSeason(plant)] })),
      updatePlant: (id, updates) =>
        set((state) => ({
          plants: state.plants.map((plant) =>
            plant.id === id ? { ...plant, ...ensureInSeason({ ...plant, ...updates }) } : plant
          ),
        })),
      bulkAddPlants: (newPlants) => 
        set((state) => ({ plants: [...state.plants, ...newPlants.map(ensureInSeason)] })),
      deletePlant: (id) =>
        set((state) => ({
          plants: state.plants.filter((plant) => plant.id !== id),
          favoritePlants: state.favoritePlants.filter((fid) => fid !== id),
        })),
      favoritePlants: [],
      toggleFavoritePlant: (id) =>
        set((state) => ({
          favoritePlants: state.favoritePlants.includes(id)
            ? state.favoritePlants.filter((fid) => fid !== id)
            : [...state.favoritePlants, id],
        })),
      
      // Filters
      mapFilter: {
        category: [],
        dateRange: {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date(),
        },
        showPrivate: true,
        radius: 50,
        inSeasonNow: false,
      },
      setMapFilter: (filter) =>
        set((state) => ({
          mapFilter: { ...state.mapFilter, ...filter },
        })),
      
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // User preferences
      showHeatZones: false,
      setShowHeatZones: (show) => set({ showHeatZones: show }),
      
      // Current location
      currentLocation: null,
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      // Preset location for logging
      presetLogLocation: null,
      setPresetLogLocation: (location) => set({ presetLogLocation: location }),
    }),
    {
      name: 'foraging-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        finds: state.finds,
        favoriteRecipes: state.favoriteRecipes,
        plants: state.plants,
        favoritePlants: state.favoritePlants,
        mapFilter: state.mapFilter,
        showHeatZones: state.showHeatZones,
      }),
    }
  )
);

function getDefaultRecipes(): Recipe[] {
  return [
    {
      id: '1',
      title: 'Elderflower Cordial',
      description: 'A refreshing summer drink made from elderflower heads',
      ingredients: ['20 elderflower heads', '1.5kg sugar', '2 lemons', '1.5L boiling water'],
      instructions: [
        'Shake elderflower heads to remove insects',
        'Place in large bowl with lemon zest and juice',
        'Pour over boiling water and stir in sugar',
        'Cover and leave for 24 hours',
        'Strain and bottle'
      ],
      category: 'drinks',
      season: ['spring', 'summer'],
      requiredFinds: ['elderflower'],
      prepTime: 30,
      cookTime: 0,
      servings: 8,
      difficulty: 'easy',
      tags: ['summer', 'refreshing', 'traditional'],
    },
    {
      id: '2',
      title: 'Wild Garlic Pesto',
      description: 'A pungent and flavorful pesto using wild garlic leaves',
      ingredients: ['100g wild garlic leaves', '50g pine nuts', '50g parmesan', '100ml olive oil'],
      instructions: [
        'Wash and dry wild garlic leaves',
        'Toast pine nuts lightly',
        'Blend all ingredients until smooth',
        'Store in sterilized jars'
      ],
      category: 'preserves',
      season: ['spring'],
      requiredFinds: ['wild garlic'],
      prepTime: 15,
      cookTime: 5,
      servings: 4,
      difficulty: 'easy',
      tags: ['spring', 'garlic', 'preserve'],
    },
    {
      id: '3',
      title: 'Nettle Soup',
      description: 'A nutritious spring soup using young nettle leaves',
      ingredients: ['200g young nettle leaves', '1 onion', '2 potatoes', '500ml vegetable stock'],
      instructions: [
        'Wear gloves when handling nettles',
        'Sauté onion until soft',
        'Add diced potatoes and stock',
        'Simmer for 15 minutes',
        'Add nettles and cook for 5 minutes',
        'Blend until smooth'
      ],
      category: 'meals',
      season: ['spring'],
      requiredFinds: ['nettle'],
      prepTime: 20,
      cookTime: 25,
      servings: 4,
      difficulty: 'medium',
      tags: ['spring', 'nutritious', 'soup'],
    },
    {
      id: '4',
      title: 'Blackberry Jam',
      description: 'Traditional jam made from wild blackberries',
      ingredients: ['1kg blackberries', '800g sugar', '1 lemon'],
      instructions: [
        'Clean blackberries carefully',
        'Heat berries gently until juices run',
        'Add sugar and lemon juice',
        'Boil rapidly until setting point',
        'Test for set and pot in sterilized jars'
      ],
      category: 'preserves',
      season: ['autumn'],
      requiredFinds: ['blackberry'],
      prepTime: 20,
      cookTime: 30,
      servings: 6,
      difficulty: 'medium',
      tags: ['autumn', 'preserve', 'traditional'],
    },
    {
      id: '5',
      title: 'Dandelion Tea',
      description: 'A detoxifying herbal tea from dandelion leaves',
      ingredients: ['2 tbsp fresh dandelion leaves', '1 cup boiling water', 'honey to taste'],
      instructions: [
        'Wash dandelion leaves thoroughly',
        'Chop leaves finely',
        'Pour boiling water over leaves',
        'Steep for 5-10 minutes',
        'Strain and add honey if desired'
      ],
      category: 'medicinal',
      season: ['spring', 'summer'],
      requiredFinds: ['dandelion'],
      prepTime: 10,
      cookTime: 0,
      servings: 1,
      difficulty: 'easy',
      tags: ['medicinal', 'detox', 'herbal'],
    },
  ];
}