import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { Recipe } from '../types/foraging';
import { cn } from '../utils/cn';

interface RecipeDetailScreenProps {
  navigation: any;
  route: any;
}

export default function RecipeDetailScreen({ navigation, route }: RecipeDetailScreenProps) {
  const { recipe }: { recipe: Recipe } = route.params;
  const [userNotes, setUserNotes] = useState(recipe.userNotes || '');
  const [showUserNotes, setShowUserNotes] = useState(false);
  
  const { 
    favoriteRecipes, 
    toggleFavoriteRecipe, 
    updateRecipe, 
    deleteRecipe,
    finds 
  } = useForagingStore();

  const isFavorite = favoriteRecipes.includes(recipe.id);

  const saveUserNotes = () => {
    updateRecipe(recipe.id, { userNotes });
    setShowUserNotes(false);
    Alert.alert('Success', 'Your notes have been saved!');
  };

  const getAvailableIngredients = () => {
    const userFinds = finds.map(find => find.name.toLowerCase());
    return recipe.requiredFinds.map(ingredient => ({
      name: ingredient,
      available: userFinds.some(find => find.includes(ingredient.toLowerCase()))
    }));
  };

  const availableIngredients = getAvailableIngredients();
  const totalAvailable = availableIngredients.filter(ing => ing.available).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const handleEditRecipe = () => {
    navigation.navigate('RecipeCreate', { editRecipe: recipe });
  };

  const handleDeleteRecipe = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipe.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                {recipe.title}
              </Text>
              <Text className="text-gray-600 text-base leading-relaxed">
                {recipe.description}
              </Text>
            </View>
            
            <View className="flex-row items-center gap-2 ml-4">
              <Pressable
                onPress={() => toggleFavoriteRecipe(recipe.id)}
                className="p-2"
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={28}
                  color={isFavorite ? "#ef4444" : "#6b7280"}
                />
              </Pressable>
              
              <Pressable
                onPress={handleEditRecipe}
                className="bg-blue-100 p-2 rounded-full"
              >
                <Ionicons name="pencil" size={20} color="#3b82f6" />
              </Pressable>
              
              <Pressable
                onPress={handleDeleteRecipe}
                className="bg-red-100 p-2 rounded-full"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </Pressable>
            </View>
          </View>

          {/* Recipe Info */}
          <View className="flex-row items-center space-x-4 mb-4">
            <View className={cn("px-3 py-1 rounded-full", getDifficultyColor(recipe.difficulty))}>
              <Text className={cn("font-medium capitalize", getDifficultyColor(recipe.difficulty).split(' ')[0])}>
                {recipe.difficulty}
              </Text>
            </View>
            
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-800 font-medium capitalize">
                {recipe.category}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-6">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">
                Prep: {recipe.prepTime}min
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="flame-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">
                Cook: {recipe.cookTime}min
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">
                Serves {recipe.servings}
              </Text>
            </View>
          </View>
        </View>

        {/* Ingredient Availability */}
        {recipe.requiredFinds.length > 0 && (
          <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Foraged Ingredients
              </Text>
              <Text className="text-sm text-gray-600">
                {totalAvailable}/{recipe.requiredFinds.length} available
              </Text>
            </View>
            
            {availableIngredients.map((ingredient, index) => (
              <View key={index} className="flex-row items-center justify-between py-2">
                <Text className="text-gray-900 capitalize">
                  {ingredient.name}
                </Text>
                <View className="flex-row items-center">
                  {ingredient.available ? (
                    <>
                      <Text className="text-green-600 text-sm mr-2">Available</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    </>
                  ) : (
                    <>
                      <Text className="text-gray-500 text-sm mr-2">Not found</Text>
                      <Ionicons name="location-outline" size={20} color="#6b7280" />
                    </>
                  )}
                </View>
              </View>
            ))}
            
          </View>
        )}

        {/* Ingredients */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Ingredients
          </Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} className="flex-row items-center py-1">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <Text className="text-gray-900 flex-1">{ingredient}</Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Instructions
          </Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} className="flex-row mb-3 last:mb-0">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-sm font-semibold">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-gray-900 flex-1 leading-relaxed">
                {instruction}
              </Text>
            </View>
          ))}
        </View>

        {/* Season and Tags */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Season & Tags
          </Text>
          
          <View className="mb-3">
            <Text className="text-gray-700 font-medium mb-2">Best Season:</Text>
            <View className="flex-row flex-wrap gap-2">
              {recipe.season.map((season, index) => (
                <View key={index} className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-800 text-sm font-medium capitalize">
                    {season}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          {recipe.tags.length > 0 && (
            <View>
              <Text className="text-gray-700 font-medium mb-2">Tags:</Text>
              <View className="flex-row flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-gray-700 text-sm">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* User Notes */}
        <View className="bg-white mx-4 mb-8 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              My Notes
            </Text>
            <Pressable
              onPress={() => setShowUserNotes(!showUserNotes)}
              className="flex-row items-center"
            >
              <Ionicons 
                name={showUserNotes ? "create" : "create-outline"} 
                size={20} 
                color="#22c55e" 
              />
              <Text className="text-green-600 ml-1 font-medium">
                {showUserNotes ? 'Cancel' : 'Edit'}
              </Text>
            </Pressable>
          </View>
          
          {showUserNotes ? (
            <View>
              <TextInput
                value={userNotes}
                onChangeText={setUserNotes}
                placeholder="Add your personal notes, adaptations, or cooking tips..."
                className="border border-gray-200 rounded-lg p-3 text-gray-900 h-24 mb-3"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />
              <Pressable
                onPress={saveUserNotes}
                className="bg-green-500 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Save Notes
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text className="text-gray-600 leading-relaxed">
              {userNotes || 'No personal notes added yet. Tap Edit to add your own cooking tips and adaptations.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}