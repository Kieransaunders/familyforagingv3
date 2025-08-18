import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useForagingStore } from '../state/foraging-store';
import { Plant } from '../types/plant';
import { 
  parsePlantCSVToPlants, 
  generatePlantCSVTemplate, 
  validatePlantForDuplicates,
  PlantCSVParseResult 
} from '../utils/plant-csv-parser';
import { cn } from '../utils/cn';

interface PlantImportScreenProps {
  navigation: any;
}

type DuplicateAction = 'skip' | 'replace' | 'rename';

interface DuplicateConflict {
  newPlant: Plant;
  existingPlant: Plant;
  action: DuplicateAction;
}

export default function PlantImportScreen({ navigation }: PlantImportScreenProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<PlantCSVParseResult | null>(null);
  const [duplicateConflicts, setDuplicateConflicts] = useState<DuplicateConflict[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const { getAllPlants, bulkAddUserPlants, updatePlant } = useForagingStore();

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        const parsed = parsePlantCSVToPlants(content);
        
        setParseResult(parsed);
        setShowPreview(true);
        
        // Check for duplicates
        const conflicts: DuplicateConflict[] = [];
        parsed.plants.forEach(newPlant => {
          const { isDuplicate, existingPlant } = validatePlantForDuplicates(newPlant, getAllPlants());
          if (isDuplicate && existingPlant) {
            conflicts.push({
              newPlant,
              existingPlant,
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
      const csvTemplate = generatePlantCSVTemplate();
      const fileUri = FileSystem.documentDirectory + 'plant_template.csv';
      
      await FileSystem.writeAsStringAsync(fileUri, csvTemplate);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Save Plant Template',
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
      const plantsToAdd: Plant[] = [];
      const plantsToUpdate: Plant[] = [];
      
      // Process each plant based on duplicate conflicts
      parseResult.plants.forEach(newPlant => {
        const conflict = duplicateConflicts.find(c => c.newPlant.id === newPlant.id);
        
        if (conflict) {
          switch (conflict.action) {
            case 'skip':
              // Don't add this plant
              break;
            case 'replace':
              // Update existing plant with new data
              plantsToUpdate.push({ ...newPlant, id: conflict.existingPlant.id });
              break;
            case 'rename':
              // Add with modified name
              plantsToAdd.push({ 
                ...newPlant, 
                name: `${newPlant.name} (Imported)` 
              });
              break;
          }
        } else {
          // No conflict, add as new plant
          plantsToAdd.push(newPlant);
        }
      });

      // Perform bulk operations
      if (plantsToAdd.length > 0) {
        bulkAddUserPlants(plantsToAdd);
      }
      
      plantsToUpdate.forEach(plant => {
        updatePlant(plant.id, plant);
      });

      const totalProcessed = plantsToAdd.length + plantsToUpdate.length;
      
      Alert.alert(
        'Import Complete',
        `Successfully imported ${totalProcessed} plants!\n\n` +
        `New plants: ${plantsToAdd.length}\n` +
        `Updated plants: ${plantsToUpdate.length}\n` +
        `Skipped duplicates: ${duplicateConflicts.filter(c => c.action === 'skip').length}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      Alert.alert('Import Error', `Failed to import plants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setParseResult(null);
    setDuplicateConflicts([]);
    setShowPreview(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'berries': return '#ef4444';
      case 'leaves': return '#22c55e';
      case 'nuts': return '#8b5cf6';
      case 'mushrooms': return '#f59e0b';
      case 'flowers': return '#ec4899';
      case 'roots': return '#06b6d4';
      default: return '#6b7280';
    }
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
                <Text className="font-semibold text-yellow-900 mb-3">Duplicate Plants Found</Text>
                {duplicateConflicts.map((conflict, index) => (
                  <View key={index} className="bg-white rounded-lg p-3 mb-3 last:mb-0">
                    <Text className="font-medium text-gray-900 mb-1">{conflict.newPlant.name}</Text>
                    <Text className="text-sm text-gray-600 italic mb-2">{conflict.newPlant.latinName}</Text>
                    <Text className="text-sm text-gray-600 mb-3">
                      This plant already exists. Choose an action:
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
                            {action === 'skip' && 'Skip - Keep existing plant'}
                            {action === 'replace' && 'Replace - Update existing plant'}
                            {action === 'rename' && 'Rename - Add as new plant with "(Imported)" suffix'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Plant Preview */}
            {parseResult.plants.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="font-semibold text-gray-900 mb-3">Plant Preview</Text>
                {parseResult.plants.slice(0, 3).map((plant, index) => (
                  <View key={plant.id} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0">
                    <View className="flex-row items-center mb-2">
                      <Image
                        source={{ uri: plant.heroImage }}
                        className="w-12 h-12 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">{plant.name}</Text>
                        <Text className="text-sm text-gray-600 italic">{plant.latinName}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View 
                        className="px-2 py-1 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(plant.category) + '20' }}
                      >
                        <Text 
                          className="text-xs font-medium capitalize"
                          style={{ color: getCategoryColor(plant.category) }}
                        >
                          {plant.category}
                        </Text>
                      </View>
                      {plant.edibility.safe ? (
                        <View className="px-2 py-1 rounded-full bg-green-100">
                          <Text className="text-xs font-medium text-green-800">Edible</Text>
                        </View>
                      ) : (
                        <View className="px-2 py-1 rounded-full bg-red-100">
                          <Text className="text-xs font-medium text-red-800">Not Edible</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
                {parseResult.plants.length > 3 && (
                  <Text className="text-sm text-gray-500 text-center mt-2">
                    ...and {parseResult.plants.length - 3} more plants
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* Import Button */}
          <View className="bg-white p-4 border-t border-gray-200">
            <Pressable
              onPress={handleImport}
              disabled={isImporting || parseResult.plants.length === 0}
              className={cn(
                "py-3 px-6 rounded-xl flex-row items-center justify-center",
                isImporting || parseResult.plants.length === 0
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
                {isImporting ? 'Importing...' : `Import ${parseResult.plants.length} Plants`}
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
            <Text className="text-lg font-semibold text-gray-900">Import Plants</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <View className="items-center mb-6">
              <Ionicons name="leaf" size={48} color="#22c55e" />
              <Text className="text-lg font-semibold text-gray-900 mt-3 text-center">
                Import Plants from CSV
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                Upload a CSV file to bulk import plants into the database
              </Text>
            </View>

            <Pressable
              onPress={handleDownloadTemplate}
              className="bg-blue-500 py-4 px-6 rounded-xl flex-row items-center justify-center mb-4"
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
                <Text className="text-sm text-gray-600">name, latinName, family, category</Text>
              </View>
              
              <View>
                <Text className="font-medium text-gray-800 mb-1">Categories:</Text>
                <Text className="text-sm text-gray-600">berries, leaves, nuts, mushrooms, flowers, roots</Text>
              </View>
              
              <View>
                <Text className="font-medium text-gray-800 mb-1">Safety Field:</Text>
                <Text className="text-sm text-gray-600">safe: true/false (whether the plant is edible)</Text>
              </View>
              
              <View>
                <Text className="font-medium text-gray-800 mb-1">Array Fields:</Text>
                <Text className="text-sm text-gray-600">
                  For fields like keyFeatures, habitat, preparation, etc., separate multiple values with | (pipe)
                </Text>
              </View>

              <View>
                <Text className="font-medium text-gray-800 mb-1">In-Season Months:</Text>
                <Text className="text-sm text-gray-600">
                  Include optional boolean columns inJan,inFeb,inMar,inApr,inMay,inJun,inJul,inAug,inSep,inOct,inNov,inDec. Values can be true/false/1/0/yes/no.
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-lg p-3 mt-4">
              <Text className="font-medium text-gray-800 mb-1">Example:</Text>
              <Text className="text-xs text-gray-600 font-mono">
                "Wild Strawberry","Fragaria vesca","Rosaceae","berries","...","true","Small white flowers|Red berries","..."
              </Text>
            </View>
          </View>

          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={20} color="#dc2626" />
              <Text className="text-red-800 font-semibold ml-2">Safety Warning</Text>
            </View>
            <Text className="text-red-700 text-sm leading-5">
              Always verify plant identification with multiple reliable sources before adding to the database. 
              Incorrect plant information can be dangerous for foragers.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Import Button */}
        <View className="bg-white p-4 border-t border-gray-200">
          <Pressable
            onPress={handlePickFile}
            className="bg-green-500 py-4 px-6 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="cloud-upload" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Choose CSV File</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}