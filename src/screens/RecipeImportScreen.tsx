import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useForagingStore } from '../state/foraging-store';
import { Recipe } from '../types/foraging';
import { 
  parseCSVToRecipes, 
  generateCSVTemplate, 
  validateRecipeForDuplicates,
  CSVParseResult 
} from '../utils/csv-parser';
import { cn } from '../utils/cn';

interface RecipeImportScreenProps {
  navigation: any;
}

type DuplicateAction = 'skip' | 'replace' | 'rename';

interface DuplicateConflict {
  newRecipe: Recipe;
  existingRecipe: Recipe;
  action: DuplicateAction;
}

export default function RecipeImportScreen({ navigation }: RecipeImportScreenProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [duplicateConflicts, setDuplicateConflicts] = useState<DuplicateConflict[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const { recipes, bulkAddRecipes, updateRecipe } = useForagingStore();

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        const parsed = parseCSVToRecipes(content);
        
        setParseResult(parsed);
        setShowPreview(true);
        
        // Check for duplicates
        const conflicts: DuplicateConflict[] = [];
        parsed.recipes.forEach(newRecipe => {
          const { isDuplicate, existingRecipe } = validateRecipeForDuplicates(newRecipe, recipes);
          if (isDuplicate && existingRecipe) {
            conflicts.push({
              newRecipe,
              existingRecipe,
              action: 'skip' // default action
            });
          }
        });
        setDuplicateConflicts(conflicts);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const csvTemplate = generateCSVTemplate();
      const fileUri = FileSystem.documentDirectory + 'recipe_template.csv';
      
      await FileSystem.writeAsStringAsync(fileUri, csvTemplate);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Save Recipe Template',
        });
      } else {
        Alert.alert('Template Generated', `Template saved to: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to generate template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateDuplicateAction = (index: number, action: DuplicateAction) => {
    const updated = [...duplicateConflicts];
    updated[index].action = action;
    setDuplicateConflicts(updated);
  };

  const handleImport = async () => {
    if (!parseResult) return;

    setIsImporting(true);

    try {
      const recipesToAdd: Recipe[] = [];
      const recipesToUpdate: Recipe[] = [];
      
      // Process each recipe based on duplicate conflicts
      parseResult.recipes.forEach(newRecipe => {
        const conflict = duplicateConflicts.find(c => c.newRecipe.id === newRecipe.id);
        
        if (conflict) {
          switch (conflict.action) {
            case 'skip':
              // Don't add this recipe
              break;
            case 'replace':
              // Update existing recipe with new data
              recipesToUpdate.push({ ...newRecipe, id: conflict.existingRecipe.id });
              break;
            case 'rename':
              // Add with modified title
              recipesToAdd.push({ 
                ...newRecipe, 
                title: `${newRecipe.title} (Imported)` 
              });
              break;
          }
        } else {
          // No conflict, add as new recipe
          recipesToAdd.push(newRecipe);
        }
      });

      // Perform bulk operations
      if (recipesToAdd.length > 0) {
        bulkAddRecipes(recipesToAdd);
      }
      
      recipesToUpdate.forEach(recipe => {
        updateRecipe(recipe.id, recipe);
      });

      const totalProcessed = recipesToAdd.length + recipesToUpdate.length;
      
      Alert.alert(
        'Import Complete',
        `Successfully imported ${totalProcessed} recipes!\n\n` +
        `New recipes: ${recipesToAdd.length}\n` +
        `Updated recipes: ${recipesToUpdate.length}\n` +
        `Skipped duplicates: ${duplicateConflicts.filter(c => c.action === 'skip').length}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      Alert.alert('Import Error', `Failed to import recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setParseResult(null);
    setDuplicateConflicts([]);
    setShowPreview(false);
  };

  if (showPreview && parseResult) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1">
          <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Pressable onPress={() => setShowPreview(false)} className="mr-3">
                  <Ionicons name="arrow-back" size={24} color="#374151" />
                </Pressable>
                <Text className="text-lg font-semibold text-gray-900">Import Preview</Text>
              </View>
              <Pressable onPress={resetImport}>
                <Text className="text-red-600 font-medium">Cancel</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {/* Import Summary */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <Text className="font-semibold text-gray-900 mb-3">Import Summary</Text>
              <View className="space-y-2">
                <Text className="text-gray-700">Total rows: {parseResult.totalRows}</Text>
                <Text className="text-green-700">Successful: {parseResult.successfulRows}</Text>
                <Text className="text-red-700">Errors: {parseResult.errors.length}</Text>
                {duplicateConflicts.length > 0 && (
                  <Text className="text-yellow-700">Duplicates: {duplicateConflicts.length}</Text>
                )}
              </View>
            </View>

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <Text className="font-semibold text-red-900 mb-2">Errors</Text>
                {parseResult.errors.map((error, index) => (
                  <Text key={index} className="text-red-800 text-sm mb-1">• {error}</Text>
                ))}
              </View>
            )}

            {/* Duplicate Conflicts */}
            {duplicateConflicts.length > 0 && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <Text className="font-semibold text-yellow-900 mb-3">Duplicate Recipes Found</Text>
                {duplicateConflicts.map((conflict, index) => (
                  <View key={index} className="bg-white rounded-lg p-3 mb-3 last:mb-0">
                    <Text className="font-medium text-gray-900 mb-2">"{conflict.newRecipe.title}"</Text>
                    <Text className="text-sm text-gray-600 mb-3">
                      This recipe already exists. Choose an action:
                    </Text>
                    
                    <View className="space-y-2">
                      {(['skip', 'replace', 'rename'] as DuplicateAction[]).map(action => (
                        <Pressable
                          key={action}
                          onPress={() => updateDuplicateAction(index, action)}
                          className={cn(
                            "flex-row items-center py-2 px-3 rounded-lg",
                            conflict.action === action ? "bg-blue-100" : "bg-gray-100"
                          )}
                        >
                          <View className={cn(
                            "w-4 h-4 rounded-full border-2 mr-3",
                            conflict.action === action 
                              ? "bg-blue-500 border-blue-500" 
                              : "border-gray-300"
                          )}>
                            {conflict.action === action && (
                              <View className="w-2 h-2 bg-white rounded-full m-auto" />
                            )}
                          </View>
                          <Text className={cn(
                            "flex-1 capitalize",
                            conflict.action === action ? "text-blue-900 font-medium" : "text-gray-700"
                          )}>
                            {action === 'skip' && 'Skip - Keep existing recipe'}
                            {action === 'replace' && 'Replace - Update existing recipe'}
                            {action === 'rename' && 'Rename - Add as new recipe with "(Imported)" suffix'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Recipe Preview */}
            {parseResult.recipes.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="font-semibold text-gray-900 mb-3">Recipe Preview</Text>
                {parseResult.recipes.slice(0, 3).map((recipe, index) => (
                  <View key={recipe.id} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0">
                    <Text className="font-medium text-gray-900">{recipe.title}</Text>
                    <Text className="text-sm text-gray-600 mt-1">{recipe.description}</Text>
                    <View className="flex-row mt-2">
                      <Text className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2 capitalize">
                        {recipe.category}
                      </Text>
                      <Text className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
                        {recipe.difficulty}
                      </Text>
                    </View>
                  </View>
                ))}
                {parseResult.recipes.length > 3 && (
                  <Text className="text-sm text-gray-500 text-center mt-2">
                    ...and {parseResult.recipes.length - 3} more recipes
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* Import Button */}
          <View className="bg-white p-4 border-t border-gray-200">
            <Pressable
              onPress={handleImport}
              disabled={isImporting || parseResult.recipes.length === 0}
              className={cn(
                "py-3 px-6 rounded-xl flex-row items-center justify-center",
                isImporting || parseResult.recipes.length === 0
                  ? "bg-gray-300"
                  : "bg-green-500"
              )}
            >
              {isImporting ? (
                <ActivityIndicator color="white" className="mr-2" />
              ) : (
                <Ionicons name="download" size={20} color="white" className="mr-2" />
              )}
              <Text className="text-white font-semibold">
                {isImporting ? 'Importing...' : `Import ${parseResult.recipes.length} Recipes`}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900">Import Recipes</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <View className="items-center mb-6">
              <Ionicons name="document-text" size={48} color="#22c55e" />
              <Text className="text-lg font-semibold text-gray-900 mt-3 text-center">
                Import Recipes from CSV
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                Upload a CSV file to bulk import your recipes into the app
              </Text>
            </View>

            <Pressable
              onPress={handlePickFile}
              className="bg-green-500 py-4 px-6 rounded-xl flex-row items-center justify-center mb-4"
            >
              <Ionicons name="cloud-upload" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Choose CSV File</Text>
            </Pressable>

            <Pressable
              onPress={handleDownloadTemplate}
              className="bg-blue-500 py-4 px-6 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="download" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Download Template</Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-xl p-6 shadow-sm">
            <Text className="font-semibold text-gray-900 mb-3">CSV Format Requirements</Text>
            
            <View className="space-y-3">
              <View>
                <Text className="font-medium text-gray-800 mb-1">Required Fields:</Text>
                <Text className="text-sm text-gray-600">title, description, category, difficulty</Text>
              </View>
              
              <View>
                <Text className="font-medium text-gray-800 mb-1">Categories:</Text>
                <Text className="text-sm text-gray-600">drinks, meals, preserves, medicinal</Text>
              </View>
              
              <View>
                <Text className="font-medium text-gray-800 mb-1">Difficulty Levels:</Text>
                <Text className="text-sm text-gray-600">easy, medium, hard</Text>
              </View>
              
              <View>
                <Text className="font-medium text-gray-800 mb-1">Array Fields:</Text>
                <Text className="text-sm text-gray-600">
                  For fields like ingredients, instructions, season, etc., separate multiple values with | (pipe)
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-lg p-3 mt-4">
              <Text className="font-medium text-gray-800 mb-1">Example:</Text>
              <Text className="text-xs text-gray-600 font-mono">
                "Wild Tea","Herbal tea from foraged leaves","medicinal","easy",5,0,1,"spring|summer","dandelion","2 tbsp leaves|1 cup water","Steep 5 minutes|Strain|Serve","herbal|tea"
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}