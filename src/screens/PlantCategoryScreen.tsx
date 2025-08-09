import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPlantsByCategory, PLANTS } from '../data/plants';
import { PlantCategory } from '../types/plant';

interface PlantCategoryScreenProps {
  navigation: any;
  route: any;
}

export default function PlantCategoryScreen({ navigation, route }: PlantCategoryScreenProps) {
  const { category }: { category: PlantCategory } = route.params;
  const originalPlants = getPlantsByCategory(category);
  
  // Get plants from comprehensive database
  const comprehensivePlants = PLANTS.filter(plant => plant.category === category);
  
  // Combine both datasets for now (you can choose to use only one later)
  const allPlants = [...comprehensivePlants];
  const plants = allPlants;

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'berries': return '🫐';
      case 'leaves': return '🌿';
      case 'nuts': return '🌰';
      case 'mushrooms': return '🍄';
      case 'flowers': return '🌸';
      case 'roots': return '🥕';
      default: return '🌱';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => navigation.goBack()}
              className="mr-3 p-2 rounded-full bg-gray-100"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-2">{getCategoryIcon(category)}</Text>
                <View>
                  <Text className="text-2xl font-bold text-gray-900 capitalize">
                    {category}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {plants.length} plant{plants.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Plants List */}
        <ScrollView className="flex-1 px-4 py-4">
          {plants.length === 0 ? (
            <View className="flex-1 justify-center items-center py-16">
              <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No plants in this category yet
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Check back later for more plant entries!
              </Text>
            </View>
          ) : (
            plants.map((plant) => (
              <Pressable
                key={plant.id}
                onPress={() => navigation.navigate('PlantDetail', { plantId: plant.id })}
                className="bg-white rounded-xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: plant.heroImage }}
                    className="w-24 h-24"
                    resizeMode="cover"
                  />
                  <View className="flex-1 p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">
                          {plant.name}
                        </Text>
                        <Text className="text-sm text-gray-600 italic">
                          {plant.latinName}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>

                    <View className="flex-row items-center mb-2">
                      <View 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: plant.edibility.safe ? '#059669' : '#dc2626' }}
                      />
                      <Text 
                        className="text-xs font-medium"
                        style={{ color: plant.edibility.safe ? '#059669' : '#dc2626' }}
                      >
                        {plant.edibility.safe ? 'Edible' : 'Not Edible'}
                      </Text>
                    </View>

                    <Text className="text-sm text-gray-600" numberOfLines={2}>
                      {plant.uses.culinary.slice(0, 2).join(' • ')}
                    </Text>
                  </View>
                </View>

                {/* Key Features Preview */}
                <View className="px-4 pb-3">
                  <Text className="text-xs text-gray-500 mb-1">Key features:</Text>
                  <Text className="text-xs text-gray-700" numberOfLines={2}>
                    {plant.identification.slice(0, 2).join(' • ')}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>

        {/* Safety Notice */}
        <View className="bg-amber-50 border-t border-amber-200 px-4 py-3">
          <View className="flex-row items-start">
            <Ionicons name="warning" size={16} color="#d97706" />
            <Text className="text-amber-800 text-xs ml-2 flex-1">
              Always verify identification with multiple sources before consuming any wild plant. 
              When in doubt, don't risk it!
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}