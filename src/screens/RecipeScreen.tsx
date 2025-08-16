import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { Recipe } from '../types/foraging';
import { cn } from '../utils/cn';

interface RecipeScreenProps {
  navigation: any;
}

export default function RecipeScreen({ navigation }: RecipeScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  
  const { recipes, favoriteRecipes, toggleFavoriteRecipe, finds, searchQuery, setSearchQuery } = useForagingStore();

  const categories = ['all', 'drinks', 'meals', 'preserves', 'medicinal'];
  const seasons = ['all', 'spring', 'summer', 'autumn', 'winter'];

  const filteredRecipes = recipes.filter(recipe => {
    // Category filter
    if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
      return false;
    }
    
    // Season filter
    if (selectedSeason !== 'all' && !recipe.season.includes(selectedSeason)) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        ) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const getAvailableIngredients = (recipe: Recipe) => {
    const userFinds = finds.map(find => find.name.toLowerCase());
    return recipe.requiredFinds.filter(ingredient => 
      userFinds.some(find => find.includes(ingredient.toLowerCase()))
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderRecipeCard = (recipe: Recipe) => {
    const availableIngredients = getAvailableIngredients(recipe);
    const isFavorite = favoriteRecipes.includes(recipe.id);
    
    return (
      <Pressable
        key={recipe.id}
        onPress={() => navigation.navigate('RecipeDetail', { recipe })}
        className="bg-white rounded-xl p-4 mb-4 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {recipe.title}
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              {recipe.description}
            </Text>
          </View>
          
          <Pressable
            onPress={() => toggleFavoriteRecipe(recipe.id)}
            className="ml-2"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ef4444" : "#6b7280"}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="bg-blue-100 px-2 py-1 rounded-full mr-2">
            <Text className="text-blue-800 text-xs font-medium capitalize">
              {recipe.category}
            </Text>
          </View>
          
          <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
            <Text className={cn("text-xs font-medium capitalize", getDifficultyColor(recipe.difficulty))}>
              {recipe.difficulty}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text className="text-gray-600 text-xs ml-1">
              {recipe.prepTime + recipe.cookTime}min
            </Text>
          </View>
        </View>

        {/* Available Ingredients Indicator */}
        {availableIngredients.length > 0 && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
            <Text className="text-green-800 text-sm font-medium">
              🌿 You have {availableIngredients.length} of {recipe.requiredFinds.length} ingredients!
            </Text>
            <Text className="text-green-700 text-xs">
              {availableIngredients.join(', ')}
            </Text>
          </View>
        )}

        <View className="flex-row flex-wrap gap-1">
          {recipe.season.map((season, index) => (
            <Text key={index} className="text-xs text-gray-500 capitalize">
              {season}{index < recipe.season.length - 1 ? ', ' : ''}
            </Text>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={true}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
      >
        <View className="px-4 py-4">
          {/* Search Bar */}
          <View className="relative mb-4">
            <Ionicons
              name="search"
              size={20}
              color="#6b7280"
              style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes, ingredients..."
              className="bg-white rounded-xl pl-10 pr-10 py-3 text-gray-900 shadow-sm"
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 12, top: 12, zIndex: 1 }}
              >
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </Pressable>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => navigation.navigate('RecipeCreate')}
              className="flex-1 bg-blue-500 rounded-xl p-3 flex-row items-center justify-center"
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Create Recipe
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => navigation.navigate('RecipeImport')}
              className="flex-1 bg-green-500 rounded-xl p-3 flex-row items-center justify-center"
            >
              <Ionicons name="cloud-upload" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Import Recipes
              </Text>
            </Pressable>
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row space-x-2 px-1">
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full border",
                    selectedCategory === category
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-200"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium capitalize",
                      selectedCategory === category
                        ? "text-white"
                        : "text-gray-700"
                    )}
                  >
                    {category === 'all' ? 'All' : category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Season Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row space-x-2 px-1">
              {seasons.map((season) => (
                <Pressable
                  key={season}
                  onPress={() => setSelectedSeason(season)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border",
                    selectedSeason === season
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-200"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium capitalize",
                      selectedSeason === season
                        ? "text-white"
                        : "text-gray-700"
                    )}
                  >
                    {season === 'all' ? 'All Seasons' : season}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Manual Finds (No GPS) */}
          {finds.some(find => find.location.latitude === 0 && find.location.longitude === 0) && (
            <View className="mb-4">
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Text className="font-semibold text-blue-900 mb-2">📝 Manual Log Entries</Text>
                <Text className="text-blue-800 text-sm mb-3">
                  These finds were logged manually without GPS coordinates:
                </Text>
                {finds
                  .filter(find => find.location.latitude === 0 && find.location.longitude === 0)
                  .map((find, index) => (
                    <View key={find.id} className="bg-white rounded-lg p-3 mb-2 last:mb-0">
                      <Text className="font-medium text-gray-900">{find.name}</Text>
                      <Text className="text-sm text-gray-600 capitalize">{find.category}</Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(find.dateFound).toLocaleDateString()}
                      </Text>
                      {find.habitat && (
                        <Text className="text-xs text-gray-600 mt-1">📍 {find.habitat}</Text>
                      )}
                    </View>
                  ))
                }
              </View>
            </View>
          )}

          {/* Search Results Header */}
          {searchQuery && (
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <Text className="text-green-800 font-medium">
                🌿 Searching for recipes with "{searchQuery}"
              </Text>
              {filteredRecipes.length > 0 && (
                <Text className="text-green-700 text-sm">
                  Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}

          {/* Recipe List */}
          {filteredRecipes.length > 0 ? (
            <>
              {!searchQuery && (
                <Text className="text-gray-600 text-sm mb-4">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                </Text>
              )}
              {filteredRecipes.map(renderRecipeCard)}
            </>
          ) : (
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="book-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                {searchQuery ? `No recipes found for "${searchQuery}"` : 'No recipes found'}
              </Text>
              <Text className="text-gray-400 text-center mt-2 mb-4">
                {searchQuery ? 'Try a different plant name or check the spelling' : 'Try adjusting your filters or search terms'}
              </Text>
              {searchQuery && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Clear Search</Text>
                </Pressable>
              )}
            </View>
          )}
          
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}