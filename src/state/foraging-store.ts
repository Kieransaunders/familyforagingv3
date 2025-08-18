import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForagingFind, Recipe, MapFilter } from '../types/foraging';
import { Plant } from '../types/plant';
import { getPlantsFromDatabase } from '../data/plants';

interface ForagingState {
  // Finds
  finds: ForagingFind[];
  addFind: (find: ForagingFind) => void;
  updateFind: (id: string, updates: Partial<ForagingFind>) => void;
  deleteFind: (id: string) => void;
  
  // Built-in content (not persisted - loaded from code)
  builtInPlants: Plant[];
  builtInRecipes: Recipe[];
  
  // User content (persisted)
  userPlants: Plant[];
  userRecipes: Recipe[];

  // Legacy combined views (non-persisted) for compatibility
  plants: Plant[];
  recipes: Recipe[];
  
  // Derived selectors
  getAllPlants: () => Plant[];
  getAllRecipes: () => Recipe[];
  
  // Seeding actions
  seedPlantsFromCode: () => void;
  seedRecipesFromCode: () => void;
  
  // User plant actions
  addUserPlant: (plant: Plant) => void;
  updateUserPlant: (id: string, updates: Partial<Plant>) => void;
  deleteUserPlant: (id: string) => void;
  bulkAddUserPlants: (plants: Plant[]) => void;
  
  // User recipe actions
  addUserRecipe: (recipe: Recipe) => void;
  updateUserRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteUserRecipe: (id: string) => void;
  bulkAddUserRecipes: (recipes: Recipe[]) => void;
  
  // Legacy actions (for compatibility)
  addPlant: (plant: Plant) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  bulkAddPlants: (plants: Plant[]) => void;
  deletePlant: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  bulkAddRecipes: (recipes: Recipe[]) => void;
  deleteRecipe: (id: string) => void;
  
  // Favorites
  favoriteRecipes: string[];
  toggleFavoriteRecipe: (id: string) => void;
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
  
  // Focused find for map navigation
  focusedFind: ForagingFind | null;
  setFocusedFind: (find: ForagingFind | null) => void;
  
  // Offline map state
  lastMapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  setLastMapRegion: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
  
  lastOnlineTimestamp: Date | null;
  setLastOnlineTimestamp: (timestamp: Date) => void;
  
  // Legacy plant loading
  loadPlantDatabase: () => void;
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
      
      // Built-in content (not persisted)
      builtInPlants: [],
      builtInRecipes: [],
      
      // User content (persisted)
      userPlants: [],
      userRecipes: [],

      // Legacy combined views
      plants: [],
      recipes: [],
      
      // Derived selectors
      getAllPlants: () => {
        const state = get();
        return [...state.builtInPlants, ...state.userPlants];
      },
      getAllRecipes: () => {
        const state = get();
        return [...state.builtInRecipes, ...state.userRecipes];
      },
      
      // Seeding actions
      seedPlantsFromCode: () => {
        const defaultPlants = withInSeasonDefaults(getPlantsFromDatabase()).map(p => ({
          ...p,
          id: p.id.startsWith('db:') ? p.id : `db:${p.id}`,
        }));
        set((state) => ({
          builtInPlants: defaultPlants,
          plants: [...defaultPlants, ...state.userPlants],
        }));
      },
      seedRecipesFromCode: () => {
        const defaultRecipes = getDefaultRecipes().map(r => ({
          ...r,
          id: r.id.startsWith('db:') ? r.id : `db:${r.id}`,
        }));
        set((state) => ({
          builtInRecipes: defaultRecipes,
          recipes: [...defaultRecipes, ...state.userRecipes],
        }));
      },
      
      // User plant actions
      addUserPlant: (plant) => set((state) => {
        const newPlant = ensureInSeason({ ...plant, id: plant.id.startsWith('usr:') ? plant.id : `usr:${plant.id}` });
        const userPlants = [...state.userPlants, newPlant];
        return {
          userPlants,
          plants: [...state.builtInPlants, ...userPlants],
        };
      }),
      updateUserPlant: (id, updates) =>
        set((state) => {
          const userPlants = state.userPlants.map((plant) =>
            plant.id === id ? { ...plant, ...ensureInSeason({ ...plant, ...updates }) } : plant
          );
          return {
            userPlants,
            plants: [...state.builtInPlants, ...userPlants],
          };
        }),
      deleteUserPlant: (id) =>
        set((state) => {
          const userPlants = state.userPlants.filter((plant) => plant.id !== id);
          return {
            userPlants,
            plants: [...state.builtInPlants, ...userPlants],
            favoritePlants: state.favoritePlants.filter((fid) => fid !== id),
          };
        }),
      bulkAddUserPlants: (newPlants) => 
        set((state) => {
          const added = newPlants.map(p => ensureInSeason({ ...p, id: p.id.startsWith('usr:') ? p.id : `usr:${p.id}` }));
          const userPlants = [...state.userPlants, ...added];
          return {
            userPlants,
            plants: [...state.builtInPlants, ...userPlants],
          };
        }),
      
      // User recipe actions
      addUserRecipe: (recipe) => set((state) => {
        const newRecipe = { ...recipe, id: recipe.id.startsWith('usr:') ? recipe.id : `usr:${recipe.id}` };
        const userRecipes = [...state.userRecipes, newRecipe];
        return {
          userRecipes,
          recipes: [...state.builtInRecipes, ...userRecipes],
        };
      }),
      updateUserRecipe: (id, updates) =>
        set((state) => {
          const userRecipes = state.userRecipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates } : recipe
          );
          return {
            userRecipes,
            recipes: [...state.builtInRecipes, ...userRecipes],
          };
        }),
      deleteUserRecipe: (id) =>
        set((state) => {
          const userRecipes = state.userRecipes.filter((recipe) => recipe.id !== id);
          return {
            userRecipes,
            recipes: [...state.builtInRecipes, ...userRecipes],
            favoriteRecipes: state.favoriteRecipes.filter((fid) => fid !== id),
          };
        }),
      bulkAddUserRecipes: (newRecipes) => 
        set((state) => {
          const added = newRecipes.map(r => ({ ...r, id: r.id.startsWith('usr:') ? r.id : `usr:${r.id}` }));
          const userRecipes = [...state.userRecipes, ...added];
          return {
            userRecipes,
            recipes: [...state.builtInRecipes, ...userRecipes],
          };
        }),
      
      // Legacy actions (for compatibility - delegate to user actions)
      addPlant: (plant) => get().addUserPlant(plant),
      updatePlant: (id, updates) => {
        const state = get();
        if (id.startsWith('db:')) {
          console.warn('Attempting to edit built-in plant. Consider copy-on-edit pattern.');
          return;
        }
        state.updateUserPlant(id, updates);
      },
      bulkAddPlants: (plants) => get().bulkAddUserPlants(plants),
      deletePlant: (id) => {
        const state = get();
        if (id.startsWith('db:')) {
          console.warn('Cannot delete built-in plant.');
          return;
        }
        state.deleteUserPlant(id);
      },
      addRecipe: (recipe) => get().addUserRecipe(recipe),
      updateRecipe: (id, updates) => {
        const state = get();
        if (id.startsWith('db:')) {
          console.warn('Attempting to edit built-in recipe. Consider copy-on-edit pattern.');
          return;
        }
        state.updateUserRecipe(id, updates);
      },
      bulkAddRecipes: (recipes) => get().bulkAddUserRecipes(recipes),
      deleteRecipe: (id) => {
        const state = get();
        if (id.startsWith('db:')) {
          console.warn('Cannot delete built-in recipe.');
          return;
        }
        state.deleteUserRecipe(id);
      },
      
      // Favorites
      favoriteRecipes: [],
      toggleFavoriteRecipe: (id) =>
        set((state) => ({
          favoriteRecipes: state.favoriteRecipes.includes(id)
            ? state.favoriteRecipes.filter((fid) => fid !== id)
            : [...state.favoriteRecipes, id],
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
      
      // Focused find for map navigation
      focusedFind: null,
      setFocusedFind: (find) => set({ focusedFind: find }),
      
      // Offline map state
      lastMapRegion: null,
      setLastMapRegion: (region) => set({ lastMapRegion: region }),
      
      lastOnlineTimestamp: null,
      setLastOnlineTimestamp: (timestamp) => set({ lastOnlineTimestamp: timestamp }),
      
      // Legacy plant loading (now just delegates to seeding)
      loadPlantDatabase: () => {
        const state = get();
        state.seedPlantsFromCode();
      },
    }),
    {
      name: 'foraging-store',
      version: 4, // Bumped for seed content separation migration
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        finds: state.finds,
        favoriteRecipes: state.favoriteRecipes,
        favoritePlants: state.favoritePlants,
        mapFilter: state.mapFilter,
        showHeatZones: state.showHeatZones,
        lastMapRegion: state.lastMapRegion,
        lastOnlineTimestamp: state.lastOnlineTimestamp,
        // Only persist user content, not built-in content
        userPlants: state.userPlants,
        userRecipes: state.userRecipes,
      }),
      migrate: (persistedState: any, version: number) => {
        console.log('Migrating foraging store from version', version, 'to version 4');
        
        if (version < 4) {
          // Migration from legacy structure (plants/recipes arrays) to new structure
          const legacyPlants = persistedState.plants || [];
          const legacyRecipes = persistedState.recipes || [];
          
          // Get seed IDs to identify what should be built-in vs user content
          const seedPlantRawIds = getPlantsFromDatabase().map(p => p.id.replace(/^db:/, ''));
          const seedPlantIds = new Set([
            ...seedPlantRawIds,
            ...seedPlantRawIds.map(id => `db:${id}`),
          ]);
          const seedPlantIdMap = new Map<string, string>();
          seedPlantRawIds.forEach(id => {
            seedPlantIdMap.set(id, `db:${id}`);
            seedPlantIdMap.set(`db:${id}`, `db:${id}`);
          });
          const seedRecipeRawIds = getDefaultRecipes().map(r => r.id.replace(/^db:/, ''));
          const seedRecipeIds = new Set([
            ...seedRecipeRawIds,
            ...seedRecipeRawIds.map(id => `db:${id}`),
          ]);
          const seedRecipeIdMap = new Map<string, string>();
          seedRecipeRawIds.forEach(id => {
            seedRecipeIdMap.set(id, `db:${id}`);
            seedRecipeIdMap.set(`db:${id}`, `db:${id}`);
          });
          
          // Separate user-created content from seed content
          const userPlants = legacyPlants.filter((plant: Plant) => !seedPlantIds.has(plant.id));
          const userRecipes = legacyRecipes.filter((recipe: Recipe) => !seedRecipeIds.has(recipe.id));
          
          // Migrate favorites to prefixed IDs where applicable
          const favoritePlants = (persistedState.favoritePlants || []).map((fid: string) => seedPlantIdMap.get(fid) || fid);
          const favoriteRecipes = (persistedState.favoriteRecipes || []).map((fid: string) => seedRecipeIdMap.get(fid) || fid);

          console.log(`Migration: ${userPlants.length} user plants, ${userRecipes.length} user recipes preserved`);
          
          return {
            ...persistedState,
            userPlants,
            userRecipes,
            favoritePlants,
            favoriteRecipes,
            // Remove legacy fields
            plants: undefined,
            recipes: undefined,
          };
        }
        
        return persistedState;
      },
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Always load built-in content from code on rehydration
            console.log('Seeding built-in content from code');
            state.seedPlantsFromCode();
            state.seedRecipesFromCode();
          }
        };
      },
    }
  )
);

function getDefaultRecipes(): Recipe[] {
  return [
    {
      id: 'db:elderflower-cordial',
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
      id: 'db:wild-garlic-pesto',
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
      id: 'db:nettle-soup',
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
      id: 'db:blackberry-jam',
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
      id: 'db:dandelion-tea',
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
