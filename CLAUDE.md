# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Family Foraging" - a React Native app built with Expo for discovering, logging, and learning about foraging as a family. The app allows users to:
- Browse and log foraged items with GPS locations
- View recipes using foraged ingredients  
- Use camera integration for plant identification
- Filter finds by season, category, and location
- Get seasonal suggestions for foraging

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

# Linting
npm run lint
```

## Architecture Overview

### Tech Stack
- **React Native + Expo SDK 53** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **NativeWind** - Tailwind CSS for React Native styling
- **Zustand** - State management with persistence via AsyncStorage
- **React Navigation v7** - Navigation with bottom tabs and stack navigation
- **AI Integrations** - Anthropic Claude and OpenAI APIs for plant identification

### Project Structure
```
src/
├── api/           # AI service integrations (Anthropic, OpenAI, Grok)
├── data/          # Static data (seasonal suggestions)
├── navigation/    # React Navigation setup
├── screens/       # Main app screens
├── state/         # Zustand store for app state
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Core Data Models
- **ForagingFind**: Represents a foraged item with location, photos, notes, category, season
- **Recipe**: Cooking recipes that use foraged ingredients with categories, difficulty, prep time
- **MapFilter**: Filter settings for displaying finds on map by category, date range, radius

### State Management
Uses Zustand with persistence for:
- Finds collection with CRUD operations
- Recipe management and favorites
- Map filtering and search
- User preferences (heat zones, current location)
- Preset locations for quick logging

### Navigation Structure
- **Bottom Tab Navigator**: Map and Recipes tabs
- **Map Stack**: MapScreen → FindDetailScreen/LogFindScreen/CameraScreen
- **Recipe Stack**: RecipeScreen → RecipeDetailScreen

### Environment Variables
Environment variables are accessed directly with `process.env.EXPO_PUBLIC_VIBECODE_{key}` format.
Do NOT use `@env` imports or `expo-constants` - these are deprecated in this project.

### Key APIs
- Camera integration via expo-camera
- Location services via expo-location  
- Image processing for AI plant identification
- Maps integration via react-native-maps

## Code Conventions
- Uses NativeWind for styling (Tailwind classes)
- Async storage persistence for app state
- Modal presentations for detail screens
- TypeScript strict mode enabled
- ESLint with Expo and Prettier configs