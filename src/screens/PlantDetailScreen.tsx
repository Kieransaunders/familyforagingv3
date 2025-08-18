import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { Plant } from '../types/plant';

interface PlantDetailScreenProps {
  navigation: any;
  route: any;
}

export default function PlantDetailScreen({ navigation, route }: PlantDetailScreenProps) {
  const { plantId } = route.params;
  const { getAllPlants, deletePlant } = useForagingStore();
  const plant = useMemo(() => getAllPlants().find(p => p.id === plantId), [getAllPlants, plantId]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['identification']);


  if (!plant) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
        <Text className="text-lg text-gray-500 mt-4">Plant not found</Text>
      </SafeAreaView>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLogFind = () => {
    navigation.navigate('Map', {
      screen: 'LogFind',
      params: { 
        prefilledData: {
          name: plant.name,
          category: plant.category === 'berries' ? 'berry' : 
                   plant.category === 'leaves' ? 'herb' :
                   plant.category === 'nuts' ? 'nut' :
                   plant.category === 'mushrooms' ? 'fungi' :
                   plant.category === 'flowers' ? 'plant' :
                   plant.category === 'roots' ? 'herb' : 'plant',
          notes: `Identified as ${plant.name} (${plant.latinName}) from Plant Database`
        }
      }
    });
  };

  const handleDelete = () => {
    if (plant.id.startsWith('db:')) {
      Alert.alert(
        'Cannot Delete Built-in Plant',
        'This is a built-in plant that cannot be deleted. Would you like to create a custom copy that you can edit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Create Copy', 
            onPress: () => {
              navigation.navigate('PlantCreate', { 
                editPlant: { ...plant, id: `usr:${plant.name.toLowerCase().replace(/\s+/g, '-')}-copy` }
              });
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Delete Plant',
        `Are you sure you want to delete ${plant.name}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              deletePlant(plant.id);
              Alert.alert('Success', 'Plant deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            }
          }
        ]
      );
    }
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

  const getEdibilityColor = (safe: boolean) => {
    return safe ? '#059669' : '#dc2626';
  };

  const renderExpandableSection = (
    title: string,
    sectionKey: string,
    content: React.ReactNode,
    icon: string
  ) => {
    const isExpanded = expandedSections.includes(sectionKey);
    
    return (
      <View className="bg-white rounded-xl mb-3 shadow-sm border border-gray-100">
        <Pressable
          onPress={() => toggleSection(sectionKey)}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-row items-center">
            <Ionicons name={icon as any} size={20} color="#374151" />
            <Text className="text-lg font-semibold text-gray-900 ml-3">{title}</Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#9ca3af" 
          />
        </Pressable>
        {isExpanded && (
          <View className="px-4 pb-4">
            {content}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Hero Image */}
        <View style={{ height: 256, position: 'relative' }}>
          <Image
            source={{ uri: plant.heroImage || 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Plant' }}
            style={{ 
              width: '100%', 
              height: '100%',
              backgroundColor: '#22c55e' // Green fallback background
            }}
            resizeMode="cover"
          />
          <View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}
          />
          <View 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 24
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{plant.name}</Text>
              {plant.id.startsWith('db:') && (
                <View style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  paddingHorizontal: 6, 
                  paddingVertical: 2, 
                  borderRadius: 4, 
                  marginLeft: 8 
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>BUILT-IN</Text>
                </View>
              )}
            </View>
            <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>{plant.latinName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <View 
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  backgroundColor: getCategoryColor(plant.category)
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textTransform: 'capitalize' }}>
                  {plant.category}
                </Text>
              </View>
              {plant.conservationStatus && (
                <View 
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: '#3b82f6',
                    marginLeft: 8
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textTransform: 'capitalize' }}>
                    {plant.conservationStatus}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-4 py-4 space-x-3">
          <Pressable
            onPress={handleLogFind}
            className="flex-1 bg-green-500 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Log Find</Text>
          </Pressable>
          
          <Pressable
            onPress={() => {
              // Set search query for recipes
              const { setSearchQuery } = useForagingStore.getState();
              setSearchQuery(plant.name);
              
              // Use the same pattern as other screens - get parent tab navigator
              const tabNavigation = navigation.getParent();
              
              // Close modal and navigate
              navigation.goBack();
              tabNavigation?.navigate('Recipes');
            }}
            className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="restaurant" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Recipes</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (plant.id.startsWith('db:')) {
                Alert.alert(
                  'Copy Built-in Plant',
                  'This is a built-in plant. You can create a custom copy to edit.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Create Copy', 
                      onPress: () => {
                        navigation.navigate('PlantCreate', { 
                          editPlant: { ...plant, id: `usr:${plant.name.toLowerCase().replace(/\s+/g, '-')}-copy` }
                        });
                      }
                    }
                  ]
                );
              } else {
                navigation.navigate('PlantCreate', { editPlant: plant });
              }
            }}
            className="w-12 bg-blue-500 rounded-xl items-center justify-center"
          >
            <Ionicons name="create" size={20} color="white" />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="w-12 bg-red-500 rounded-xl items-center justify-center"
          >
            <Ionicons name="trash" size={20} color="white" />
          </Pressable>
        </View>


        {/* Content Sections */}
        <View className="px-4 pb-6">
          {/* Identification */}
          {renderExpandableSection(
            'Foraging & Identification',
            'identification',
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Key Features:</Text>
              {plant.identification.keyFeatures.map((feature, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Text className="text-green-600 mr-2">•</Text>
                  <Text className="text-gray-700 text-sm flex-1">{feature}</Text>
                </View>
              ))}
              
              <Text className="text-sm font-medium text-gray-700 mt-4 mb-2">Habitat:</Text>
              <Text className="text-gray-700 text-sm">
                {plant.identification.habitat.join(', ')}
              </Text>
              
              <Text className="text-sm font-medium text-gray-700 mt-4 mb-2">Season:</Text>
              <Text className="text-gray-700 text-sm">
                {plant.identification.season.join(', ')}
              </Text>

              {plant.identification.lookAlikes.length > 0 && (
                <>
                  <Text className="text-sm font-medium text-red-700 mt-4 mb-2">⚠️ Look-alikes:</Text>
                  {plant.identification.lookAlikes.map((lookAlike, index) => (
                    <Text key={index} className="text-red-700 text-sm">• {lookAlike}</Text>
                  ))}
                </>
              )}
            </View>,
            'search'
          )}

          {/* Edibility */}
          {renderExpandableSection(
            'Edibility',
            'edibility',
            <View>
              <View className="flex-row items-center mb-3">
                <View 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getEdibilityColor(plant.edibility.safe) }}
                />
                <Text 
                  className="font-semibold"
                  style={{ color: getEdibilityColor(plant.edibility.safe) }}
                >
                  {plant.edibility.safe ? 'Safe to eat when prepared properly' : 'Not safe for consumption'}
                </Text>
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-2">Preparation:</Text>
              {plant.edibility.preparation.map((prep, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Text className="text-green-600 mr-2">•</Text>
                  <Text className="text-gray-700 text-sm flex-1">{prep}</Text>
                </View>
              ))}

              {plant.edibility.warnings && plant.edibility.warnings.length > 0 && (
                <>
                  <Text className="text-sm font-medium text-red-700 mt-4 mb-2">⚠️ Warnings:</Text>
                  {plant.edibility.warnings.map((warning, index) => (
                    <Text key={index} className="text-red-700 text-sm">• {warning}</Text>
                  ))}
                </>
              )}
            </View>,
            'restaurant'
          )}

          {/* Uses */}
          {renderExpandableSection(
            'Uses',
            'uses',
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Culinary:</Text>
              <Text className="text-gray-700 text-sm mb-4">
                {plant.uses.culinary.join(', ')}
              </Text>

              {plant.uses.medicinal.length > 0 && (
                <>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Traditional Medicine:</Text>
                  <Text className="text-gray-700 text-sm mb-4">
                    {plant.uses.medicinal.join(', ')}
                  </Text>
                </>
              )}

              {plant.uses.traditional.length > 0 && (
                <>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Traditional Uses:</Text>
                  <Text className="text-gray-700 text-sm">
                    {plant.uses.traditional.join(', ')}
                  </Text>
                </>
              )}
            </View>,
            'leaf'
          )}

          {/* Foraging Ethics */}
          {renderExpandableSection(
            'Foraging Ethics',
            'ethics',
            <View>
              {plant.ethics.map((ethic, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-green-600 mr-2">•</Text>
                  <Text className="text-gray-700 text-sm flex-1">{ethic}</Text>
                </View>
              ))}
            </View>,
            'heart'
          )}

          {/* Fun Facts */}
          {plant.funFacts && renderExpandableSection(
            'Fun Facts',
            'funFacts',
            <Text className="text-gray-700 text-sm leading-6">{plant.funFacts}</Text>,
            'star'
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}