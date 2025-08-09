import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPlantById } from '../data/plants';
import { Plant } from '../types/plant';

interface PlantDetailScreenProps {
  navigation: any;
  route: any;
}

export default function PlantDetailScreen({ navigation, route }: PlantDetailScreenProps) {
  const { plantId } = route.params;
  const plant = getPlantById(plantId);
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
          category: plant.category,
          notes: `Identified as ${plant.name} (${plant.latinName}) from Plant Database`
        }
      }
    });
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
        <View className="relative">
          <Image
            source={{ uri: plant.heroImage }}
            className="w-full h-64"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black bg-opacity-30" />
          <View className="absolute bottom-0 left-0 right-0 p-6">
            <Text className="text-white text-3xl font-bold">{plant.name}</Text>
            <Text className="text-white text-lg italic">{plant.latinName}</Text>
            <View className="flex-row items-center mt-2">
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: getCategoryColor(plant.category) }}
              >
                <Text className="text-white text-sm font-medium capitalize">
                  {plant.category}
                </Text>
              </View>
              {plant.conservationStatus && (
                <View className="px-3 py-1 rounded-full bg-blue-500 ml-2">
                  <Text className="text-white text-sm font-medium capitalize">
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
            onPress={() => Alert.alert('View Recipes', 'Feature coming soon!')}
            className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="restaurant" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Recipes</Text>
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