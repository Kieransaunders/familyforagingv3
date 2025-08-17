# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Family Foraging" - a React Native app built with Expo for discovering, logging, and learning about foraging as a family. The app allows users to:
- Browse and log foraged items with GPS locations
- View recipes using foraged ingredients  
- Use camera integration with AI-powered plant identification
- Filter finds by season, category, and location
- Get seasonal suggestions for foraging
- Manage a plant database with CSV import/export
- Use offline-capable maps with WebView fallback

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun run start

# Platform-specific runs
bun run android
bun run ios  
bun run web

# EAS Build (for distribution)
eas build --platform android
eas build --platform ios
```

## Architecture Overview

### Tech Stack
- **React Native + Expo SDK 53** - Cross-platform mobile framework
- **TypeScript** - Type safety with strict mode
- **NativeWind** - Tailwind CSS for React Native styling
- **Zustand** - State management with AsyncStorage persistence
- **React Navigation v7** - Navigation with bottom tabs and stack navigation
- **WebView Maps** - Custom CrossPlatformMap component using react-native-webview
- **AI Integrations** - Anthropic Claude, OpenAI, and Grok APIs for plant identification

### Project Structure
```
src/
├── api/           # AI service integrations (Anthropic, OpenAI, Grok)
├── components/    # Reusable components (CrossPlatformMap, AppHeader, etc.)
├── data/          # Static data (seasonal suggestions, plant database)
├── navigation/    # React Navigation setup with 4 tab stacks
├── screens/       # Main app screens organized by feature
├── state/         # Zustand store for app state management
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Navigation Architecture

**Bottom Tab Navigator** (4 tabs):
1. **My Finds** (Homepage) - Personal foraging log
2. **Map** - Interactive map with find locations
3. **Recipes** - Recipe browser and favorites
4. **Plants** - Plant database and identification

**Stack Navigators**:
- **MyFindsStack**: MyFindsScreen → FindDetailScreen/LogFindScreen
- **MapStack**: MapScreen → FindDetailScreen/LogFindScreen/CameraScreen
- **RecipeStack**: RecipeScreen → RecipeDetailScreen/RecipeImportScreen/RecipeCreateScreen
- **PlantStack**: PlantDatabaseScreen → PlantCategoryScreen → PlantDetailScreen/PlantImportScreen

All detail screens use modal presentation for better UX.

### Core Data Models

- **ForagingFind**: Represents a foraged item with location, photos, notes, category, season, privacy settings
- **Recipe**: Cooking recipes with ingredients, instructions, categories, difficulty, prep time, favorites
- **Plant**: Plant database entries with identification features, seasonal data, safety information
- **MapFilter**: Filter settings for map display (category, date range, privacy, in-season filtering)

### State Management (Zustand)

Central store with persistence handles:
- **Finds Management**: CRUD operations, location presets, focused find navigation
- **Recipe Management**: CRUD operations, favorites, import/export
- **Plant Database**: CRUD operations, CSV import/export, seasonal filtering
- **Map State**: Filtering, search, current location, heat zones
- **User Preferences**: Default privacy settings, location permissions

### WebView-Based Maps

**Custom CrossPlatformMap Component**:
- Uses `react-native-webview` instead of platform-specific map libraries
- Self-contained HTML/CSS/JavaScript with no external dependencies
- Custom pin rendering with click handling via WebView message passing
- Fallback UI for network failures or WebView errors
- Cross-platform compatible (iOS and Android)

**Key Features**:
- Grid-pattern background for visual map appearance
- Coordinate-based pin placement and interaction
- Error boundaries with graceful fallbacks
- Loading states and comprehensive error handling

### AI Integration Architecture

**Multi-Provider Setup**:
- **Anthropic Claude**: Primary plant identification
- **OpenAI**: Alternative identification and recipe suggestions
- **Grok**: Additional identification source

**Environment Variables Pattern**:
```
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY
EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY
EXPO_PUBLIC_VIBECODE_GROK_API_KEY
```

Access via `process.env.EXPO_PUBLIC_VIBECODE_{SERVICE}_API_KEY`
**Do NOT use** `@env` imports or `expo-constants` - these are deprecated in this project.

### Image Processing Pipeline

1. **Camera Integration**: expo-camera for photo capture
2. **Image Upload**: Base64 encoding for AI API transmission
3. **AI Processing**: Multi-provider plant identification
4. **Result Parsing**: Structured plant data extraction
5. **Database Matching**: Cross-reference with local plant database

### Data Import/Export

**CSV Support**:
- Plant database import/export with seasonal flags
- Recipe collection import/export
- Find data export for backup

**Format**: Monthly boolean flags (jan, feb, mar, etc.) for seasonal availability

### Performance & Reliability

**Crash Prevention**:
- My Finds as homepage prevents map startup crashes
- WebView error boundaries with React Native fallbacks
- Comprehensive error handling for AI API failures
- Offline-capable with local data persistence

**Memory Management**:
- Zustand persistence with AsyncStorage
- Efficient image handling and caching
- Lazy loading of heavy components (maps, camera)

## Code Conventions

- **Styling**: NativeWind (Tailwind classes) for consistent design
- **Navigation**: Modal presentations for detail screens
- **State**: Zustand with persistence for all app state
- **Types**: Strict TypeScript with comprehensive type definitions
- **Errors**: Graceful fallbacks, no crashes in production
- **Environment**: Direct `process.env` access for API keys
- **Imports**: Absolute imports from `src/` directory

## Critical Architecture Notes

1. **Map Component**: Uses WebView, not native maps - modify `src/components/CrossPlatformMap.tsx`
2. **Navigation Order**: My Finds is homepage to prevent startup crashes
3. **AI APIs**: Multiple providers with fallback logic
4. **Environment Variables**: `EXPO_PUBLIC_VIBECODE_*` pattern only
5. **State Persistence**: All critical data persisted via Zustand + AsyncStorage
6. **Cross-Platform**: Single codebase, WebView ensures consistent map behavior