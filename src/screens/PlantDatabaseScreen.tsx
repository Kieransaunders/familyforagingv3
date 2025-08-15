import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { plantCategories } from '../data/plants';
import { PlantCategory } from '../types/plant';
import { useForagingStore } from '../state/foraging-store';
import { cn } from '../utils/cn';

interface PlantDatabaseScreenProps {
  navigation: any;
}

export default function PlantDatabaseScreen({ navigation }: PlantDatabaseScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 0-11
  const [inSeasonNow, setInSeasonNow] = useState<boolean>(false);
  
  const { plants } = useForagingStore();

  const handleCategoryPress = (category: PlantCategory) => {
    navigation.navigate('PlantCategory', { category });
  };

  const handleSearchPress = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
    }
  };

  const searchResults = searchQuery.length > 0 ? plants.filter(plant => 
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.identification.keyFeatures.some(feature => 
      feature.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) : [];

  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
  const nowMonth = new Date().getMonth();
  const effectiveMonth = inSeasonNow ? nowMonth : selectedMonth;
  const inSeasonPlants = effectiveMonth == null ? [] : plants.filter(p => {
    const flags = p.inSeason;
    if (!flags) return false;
    const key = monthKeys[effectiveMonth];
    return Boolean((flags as any)[key]);
  });

  const renderCategoryCard = (category: typeof plantCategories[0]) => (
    <Pressable
      key={category.name}
      onPress={() => handleCategoryPress(category.name)}
      className="flex-1 m-2 rounded-2xl overflow-hidden shadow-lg"
      style={{ height: 120 }}
    >
      <Image
        source={{ uri: category.image }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black bg-opacity-30 justify-end p-4">
        <Text className="text-white font-semibold text-lg">{category.label}</Text>
        <Text className="text-white text-2xl">{category.icon}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">Plant Database</Text>
            <Pressable
              onPress={handleSearchPress}
              className="p-2 rounded-full bg-gray-100"
            >
              <Ionicons name="search" size={20} color="#374151" />
            </Pressable>
          </View>

          {/* Search Bar */}
          {showSearch && (
            <View className="mt-3 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Ionicons name="search" size={16} color="#6b7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search plants..."
                className="flex-1 ml-2 text-gray-900"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#6b7280" />
                </Pressable>
              )}
            </View>
          )}
        </View>

        <ScrollView className="flex-1">
          {/* Import Button Section */}
          {(!showSearch || searchQuery.length === 0) && (
            <View className="px-4 py-4">
              <Pressable
                onPress={() => navigation.navigate('PlantImport')}
                className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm mb-4"
              >
                <Ionicons name="cloud-upload" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Import Plants from CSV
                </Text>
              </Pressable>
            </View>
          )}

          {/* Search Results */}
          {showSearch && searchQuery.length > 0 && (
            <View className="px-4 py-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Search Results ({searchResults.length})
              </Text>
              {searchResults.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">No plants found</Text>
                </View>
              ) : (
                searchResults.map((plant) => (
                  <Pressable
                    key={plant.id}
                    onPress={() => navigation.navigate('PlantDetail', { plantId: plant.id })}
                    className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: plant.heroImage }}
                        className="w-16 h-16 rounded-lg"
                        resizeMode="cover"
                      />
                      <View className="flex-1 ml-4">
                        <Text className="text-lg font-semibold text-gray-900">{plant.name}</Text>
                        <Text className="text-sm text-gray-600 italic">{plant.latinName}</Text>
                        <View className="flex-row items-center mt-1">
                          <View 
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: getCategoryColor(plant.category) + '20' }}
                          >
                            <Text 
                              className="text-xs font-medium capitalize"
                              style={{ color: getCategoryColor(plant.category) }}
                            >
                              {plant.category}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          )}

           {/* In Season Filters */}
          {(!showSearch || searchQuery.length === 0) && (
            <View className="px-4 py-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">In Season</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((label, idx) => (
                  <Pressable
                    key={label}
                    onPress={() => {
                      setSelectedMonth(selectedMonth === idx ? null : idx);
                      setInSeasonNow(false);
                    }}
                    className={cn(
                      'px-3 py-2 rounded-full border',
                      selectedMonth === idx ? 'bg-green-500 border-green-500' : 'bg-gray-100 border-gray-200'
                    )}
                  >
                    <Text className={cn('text-sm font-medium', selectedMonth === idx ? 'text-white' : 'text-gray-700')}>{label}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => {
                    setInSeasonNow(!inSeasonNow);
                    if (!inSeasonNow) setSelectedMonth(null);
                  }}
                  className={cn(
                    'px-3 py-2 rounded-full border',
                    inSeasonNow ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-200'
                  )}
                >
                  <Text className={cn('text-sm font-medium', inSeasonNow ? 'text-white' : 'text-gray-700')}>Now</Text>
                </Pressable>
              </View>

              {(inSeasonNow || selectedMonth !== null) && (
                <View className="mb-6">
                  <Text className="text-sm text-gray-600 mb-2">{inSeasonPlants.length} plants</Text>
                  {inSeasonPlants.length === 0 ? (
                    <View className="bg-gray-50 rounded-xl p-6 items-center">
                      <Ionicons name="leaf-outline" size={32} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2">No plants for this month</Text>
                    </View>
                  ) : (
                    inSeasonPlants.map((plant) => (
                      <Pressable
                        key={plant.id}
                        onPress={() => navigation.navigate('PlantDetail', { plantId: plant.id })}
                        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                      >
                        <View className="flex-row items-center">
                          <Image source={{ uri: plant.heroImage }} className="w-16 h-16 rounded-lg" resizeMode="cover" />
                          <View className="flex-1 ml-4">
                            <Text className="text-lg font-semibold text-gray-900">{plant.name}</Text>
                            <Text className="text-sm text-gray-600 italic">{plant.latinName}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              )}

              {/* Category Grid */}
              <View className="px-2 -mx-2">
                <View className="flex-row flex-wrap">
                  {plantCategories.map((category, index) => {
                    if (index % 2 === 0) {
                      return (
                        <View key={index} className="w-full flex-row">
                          {renderCategoryCard(category)}
                          {plantCategories[index + 1] && renderCategoryCard(plantCategories[index + 1])}
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>

                {/* Info Section */}
                <View className="mx-2 mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="information-circle" size={20} color="#059669" />
                    <Text className="text-green-800 font-semibold ml-2">Foraging Safety</Text>
                  </View>
                  <Text className="text-green-700 text-sm leading-5">
                    Always be 100% certain of plant identification before consuming. When in doubt, don't eat it! 
                    Start with small amounts when trying new plants, and never forage in polluted areas.
                  </Text>
                </View>

                <View className="mx-2 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="leaf" size={20} color="#2563eb" />
                    <Text className="text-blue-800 font-semibold ml-2">Conservation</Text>
                  </View>
                  <Text className="text-blue-700 text-sm leading-5">
                    Practice sustainable foraging by taking only what you need and leaving plenty for wildlife. 
                    Follow the \"rule of thirds\" - take no more than 1/3 of any plant.
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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