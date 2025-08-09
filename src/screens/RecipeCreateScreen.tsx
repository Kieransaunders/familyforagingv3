import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { Recipe } from '../types/foraging';
import DynamicList from '../components/DynamicList';
import { cn } from '../utils/cn';
import { v4 as uuidv4 } from 'uuid';

interface RecipeCreateScreenProps {
  navigation: any;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: 'information-circle' },
  { id: 2, title: 'Details', icon: 'settings' },
  { id: 3, title: 'Ingredients', icon: 'leaf' },
  { id: 4, title: 'Instructions', icon: 'list' },
  { id: 5, title: 'Metadata', icon: 'pricetag' },
];

const CATEGORIES = ['drinks', 'meals', 'preserves', 'medicinal'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export default function RecipeCreateScreen({ navigation }: RecipeCreateScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Recipe['category']>('meals');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('easy');
  const [prepTime, setPrepTime] = useState('0');
  const [cookTime, setCookTime] = useState('0');
  const [servings, setServings] = useState('1');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [requiredFinds, setRequiredFinds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState('');

  const { addRecipe, finds } = useForagingStore();

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return title.trim().length > 0 && description.trim().length > 0;
      case 2:
        const prep = parseInt(prepTime) || 0;
        const cook = parseInt(cookTime) || 0;
        const serve = parseInt(servings) || 0;
        return prep >= 0 && cook >= 0 && serve > 0;
      case 3:
        return ingredients.length > 0;
      case 4:
        return instructions.length > 0;
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  const getStepErrors = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!title.trim()) errors.push('Title is required');
        if (!description.trim()) errors.push('Description is required');
        break;
      case 2:
        const prep = parseInt(prepTime);
        const cook = parseInt(cookTime);
        const serve = parseInt(servings);
        if (isNaN(prep) || prep < 0) errors.push('Prep time must be 0 or greater');
        if (isNaN(cook) || cook < 0) errors.push('Cook time must be 0 or greater');
        if (isNaN(serve) || serve < 1) errors.push('Servings must be at least 1');
        break;
      case 3:
        if (ingredients.length === 0) errors.push('At least one ingredient is required');
        break;
      case 4:
        if (instructions.length === 0) errors.push('At least one instruction is required');
        break;
    }
    
    return errors;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      const errors = getStepErrors(currentStep);
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSeason = (season: string) => {
    setSelectedSeasons(prev => 
      prev.includes(season) 
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const saveRecipe = async () => {
    // Final validation
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        Alert.alert('Validation Error', `Please complete step ${step} correctly`);
        setCurrentStep(step);
        return;
      }
    }

    setIsSaving(true);

    try {
      const newRecipe: Recipe = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1,
        ingredients: ingredients.filter(i => i.trim()),
        instructions: instructions.filter(i => i.trim()),
        season: selectedSeasons,
        requiredFinds: requiredFinds.filter(f => f.trim()),
        tags: tags.filter(t => t.trim()),
        userNotes: userNotes.trim() || undefined,
      };

      addRecipe(newRecipe);

      Alert.alert(
        'Recipe Created!',
        `"${newRecipe.title}" has been added to your recipes.`,
        [
          {
            text: 'View Recipe',
            onPress: () => {
              navigation.replace('RecipeDetail', { recipe: newRecipe });
            }
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setCurrentStep(1);
              setTitle('');
              setDescription('');
              setCategory('meals');
              setDifficulty('easy');
              setPrepTime('0');
              setCookTime('0');
              setServings('1');
              setIngredients([]);
              setInstructions([]);
              setSelectedSeasons([]);
              setRequiredFinds([]);
              setTags([]);
              setUserNotes('');
            }
          },
          {
            text: 'Done',
            style: 'default',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Basic Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Recipe Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter recipe name..."
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Description *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the recipe..."
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full border",
                      category === cat
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize",
                        category === cat ? "text-white" : "text-gray-700"
                      )}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Difficulty</Text>
              <View className="flex-row gap-2">
                {DIFFICULTIES.map((diff) => (
                  <Pressable
                    key={diff}
                    onPress={() => setDifficulty(diff)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl border",
                      difficulty === diff
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize text-center",
                        difficulty === diff ? "text-white" : "text-gray-700"
                      )}
                    >
                      {diff}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Recipe Details</Text>
            
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Prep Time (min)</Text>
                <TextInput
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="0"
                  keyboardType="numeric"
                  className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Cook Time (min)</Text>
                <TextInput
                  value={cookTime}
                  onChangeText={setCookTime}
                  placeholder="0"
                  keyboardType="numeric"
                  className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Servings</Text>
              <TextInput
                value={servings}
                onChangeText={setServings}
                placeholder="1"
                keyboardType="numeric"
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="bg-blue-50 rounded-xl p-4">
              <Text className="font-medium text-blue-900 mb-2">Timing Summary</Text>
              <Text className="text-blue-800">
                Total Time: {(parseInt(prepTime) || 0) + (parseInt(cookTime) || 0)} minutes
              </Text>
              <Text className="text-blue-800">
                Serves: {parseInt(servings) || 1} people
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <DynamicList
              title="Ingredients"
              items={ingredients}
              onItemsChange={setIngredients}
              placeholder="e.g., 2 cups wild blackberries"
              minItems={1}
              maxItems={20}
              emptyMessage="Add ingredients for your recipe"
              addButtonText="Add Ingredient"
            />
          </View>
        );

      case 4:
        return (
          <View>
            <DynamicList
              title="Instructions"
              items={instructions}
              onItemsChange={setInstructions}
              placeholder="e.g., Wash berries thoroughly and remove stems"
              numbered
              minItems={1}
              maxItems={15}
              emptyMessage="Add step-by-step instructions"
              addButtonText="Add Step"
            />
          </View>
        );

      case 5:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Additional Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Seasons</Text>
              <View className="flex-row flex-wrap gap-2">
                {SEASONS.map((season) => (
                  <Pressable
                    key={season}
                    onPress={() => toggleSeason(season)}
                    className={cn(
                      "px-3 py-2 rounded-full border",
                      selectedSeasons.includes(season)
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize",
                        selectedSeasons.includes(season) ? "text-white" : "text-gray-700"
                      )}
                    >
                      {season}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <DynamicList
              title="Required Foraged Items"
              items={requiredFinds}
              onItemsChange={setRequiredFinds}
              placeholder="e.g., blackberry, wild garlic"
              maxItems={10}
              emptyMessage="Add foraged items needed for this recipe"
              addButtonText="Add Foraged Item"
            />

            <DynamicList
              title="Tags"
              items={tags}
              onItemsChange={setTags}
              placeholder="e.g., summer, preserve, traditional"
              maxItems={10}
              emptyMessage="Add tags to help categorize this recipe"
              addButtonText="Add Tag"
            />

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Personal Notes</Text>
              <TextInput
                value={userNotes}
                onChangeText={setUserNotes}
                placeholder="Add any personal notes or tips..."
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900">Create Recipe</Text>
          </View>
          <Text className="text-sm text-gray-500">
            {currentStep} of {STEPS.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <View key={step.id} className="flex-row items-center">
                <View
                  className={cn(
                    "w-8 h-8 rounded-full items-center justify-center",
                    currentStep >= step.id
                      ? "bg-green-500"
                      : "bg-gray-200"
                  )}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={currentStep >= step.id ? "white" : "#9ca3af"}
                  />
                </View>
                {index < STEPS.length - 1 && (
                  <View
                    className={cn(
                      "h-0.5 w-8 mx-1",
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </View>
            ))}
          </View>
          <Text className="text-sm text-gray-600 text-center">
            {STEPS[currentStep - 1]?.title}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {renderStep()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation */}
      <View className="bg-white p-4 border-t border-gray-200">
        <View className="flex-row space-x-3">
          {currentStep > 1 && (
            <Pressable
              onPress={prevStep}
              className="flex-1 bg-gray-200 py-3 px-6 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
              <Text className="text-gray-700 font-medium ml-1">Back</Text>
            </Pressable>
          )}
          
          {currentStep < STEPS.length ? (
            <Pressable
              onPress={nextStep}
              disabled={!validateStep(currentStep)}
              className={cn(
                "flex-1 py-3 px-6 rounded-xl flex-row items-center justify-center",
                validateStep(currentStep)
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
            >
              <Text className="text-white font-medium mr-1">Next</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={saveRecipe}
              disabled={isSaving}
              className="flex-1 bg-green-500 py-3 px-6 rounded-xl flex-row items-center justify-center"
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Save Recipe</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}