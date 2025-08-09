import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';
import { cn } from '../utils/cn';

interface MyFindsScreenProps {
  navigation: any;
}

export default function MyFindsScreen({ navigation }: MyFindsScreenProps) {
  const { finds } = useForagingStore();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'plant', label: 'Plant', icon: 'leaf' },
    { key: 'fungi', label: 'Fungi', icon: 'nutrition' },
    { key: 'berry', label: 'Berry', icon: 'ellipse' },
    { key: 'nut', label: 'Nut', icon: 'radio-button-on' },
    { key: 'herb', label: 'Herb', icon: 'flower' },
    { key: 'other', label: 'Other', icon: 'help-circle' }
  ];

  const filteredFinds = finds
    .filter(find => {
      // Category filter
      const categoryMatch = filterCategory === 'all' || find.category === filterCategory;
      
      // Search filter
      const searchMatch = !searchQuery || 
        find.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (find.notes && find.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime();
      }
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plant': return '#22c55e';
      case 'fungi': return '#f59e0b';
      case 'berry': return '#ef4444';
      case 'nut': return '#8b5cf6';
      case 'herb': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const renderFindCard = (find: ForagingFind) => {
    const { recipes } = useForagingStore();
    const relatedRecipes = recipes.filter(recipe => 
      recipe.requiredFinds.some(ingredient => 
        ingredient.toLowerCase().includes(find.name.toLowerCase()) ||
        find.name.toLowerCase().includes(ingredient.toLowerCase())
      )
    );

    return (
      <Pressable
        key={find.id}
        onPress={() => navigation.navigate('FindDetail', { find })}
        className="bg-white rounded-xl p-0 mb-6 shadow-sm border border-gray-100"
      >
        {/* Image Section */}
        {find.photos.length > 0 ? (
          <View className="relative">
            <Image
              source={{ uri: find.photos[0] }}
              className="w-full h-48 rounded-t-xl"
              resizeMode="cover"
            />
            
            {/* Category and Recipe Badges */}
            <View className="absolute top-3 right-3 flex-row gap-2">
              <View 
                className="px-3 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: getCategoryColor(find.category) + 'E6' }}
              >
                <Text 
                  className="text-xs font-bold capitalize text-white"
                >
                  {find.category}
                </Text>
              </View>
              
              {relatedRecipes.length > 0 && (
                <Pressable 
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('Recipes');
                  }}
                  className="bg-orange-500 rounded-full p-2 shadow-sm"
                >
                  <Ionicons name="restaurant" size={12} color="white" />
                </Pressable>
              )}
            </View>
            
            {find.isPrivate && (
              <View className="absolute top-3 left-3 bg-black/50 rounded-full p-2">
                <Ionicons name="lock-closed" size={16} color="white" />
              </View>
            )}
          </View>
        ) : (
          <Pressable 
            onPress={(e) => {
              e.stopPropagation();
              // Could open camera or photo picker
            }}
            className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl items-center justify-center border-2 border-dashed border-gray-300"
          >
            <View className="bg-green-100 rounded-full p-3 mb-2">
              <Ionicons name="camera" size={24} color="#22c55e" />
            </View>
            <Text className="text-sm font-medium text-gray-600">Add Photo</Text>
            <Text className="text-xs text-gray-400">Tap to capture</Text>
          </Pressable>
        )}

        {/* Content Section */}
        <View className="p-5">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">{find.name}</Text>
              {!find.photos.length && (
                <View className="flex-row items-center gap-2 mb-2">
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getCategoryColor(find.category) + '20' }}
                  >
                    <Text 
                      className="text-xs font-bold capitalize"
                      style={{ color: getCategoryColor(find.category) }}
                    >
                      {find.category}
                    </Text>
                  </View>
                  
                  {relatedRecipes.length > 0 && (
                    <Pressable 
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('Recipes');
                      }}
                      className="bg-orange-100 px-2 py-1 rounded-full flex-row items-center"
                    >
                      <Ionicons name="restaurant" size={12} color="#ea580c" />
                      <Text className="text-xs font-medium text-orange-700 ml-1">Recipe</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>

          {find.notes ? (
            <Text className="text-sm text-gray-600 mb-4 leading-6" numberOfLines={2}>
              {find.notes}
            </Text>
          ) : (
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('FindDetail', { find });
              }}
              className="mb-4"
            >
              <Text className="text-sm text-gray-400 italic">
                Add a note about this find...
              </Text>
            </Pressable>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2 font-medium">
                {new Date(find.dateFound).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              {find.location.latitude !== 0 && find.location.longitude !== 0 ? (
                <Pressable 
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('Map');
                  }}
                  className="flex-row items-center bg-green-100 px-3 py-2 rounded-full"
                >
                  <Ionicons name="location" size={14} color="#22c55e" />
                  <Text className="text-xs font-bold text-green-700 ml-1">View on Map</Text>
                </Pressable>
              ) : (
                <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
                  <Ionicons name="location-outline" size={14} color="#9ca3af" />
                  <Text className="text-xs font-medium text-gray-500 ml-1">No location</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">My Finds</Text>
            <Pressable
              onPress={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full bg-gray-100"
            >
              <Ionicons name="search" size={20} color="#374151" />
            </Pressable>
          </View>

          {/* Search Bar */}
          {showSearch && (
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
              <Ionicons name="search" size={16} color="#6b7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search finds..."
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

          {/* Stats Overview */}
          {finds.length > 0 && !showSearch && (
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-green-100">
                <View className="flex-row items-center">
                  <View className="bg-green-100 rounded-full p-2 mr-3">
                    <Ionicons name="leaf" size={16} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">{finds.length}</Text>
                    <Text className="text-xs text-gray-600 font-medium">Total Finds</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-full p-2 mr-3">
                    <Ionicons name="apps" size={16} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">
                      {new Set(finds.map(f => f.category)).size}
                    </Text>
                    <Text className="text-xs text-gray-600 font-medium">Categories</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                <View className="flex-row items-center">
                  <View className="bg-purple-100 rounded-full p-2 mr-3">
                    <Ionicons name="camera" size={16} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">
                      {finds.filter(f => f.photos.length > 0).length}
                    </Text>
                    <Text className="text-xs text-gray-600 font-medium">With Photos</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {/* Sort Options */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-medium text-gray-700">Sort by:</Text>
            <View className="flex-row bg-gray-100 rounded-full p-1">
              {(['date', 'name', 'category'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setSortBy(option)}
                  className={cn(
                    "px-4 py-2 rounded-full min-w-[65px] items-center",
                    sortBy === option ? 'bg-white shadow-sm' : ''
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-semibold capitalize",
                      sortBy === option ? 'text-green-600' : 'text-gray-600'
                    )}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>


        </View>

        {/* Sticky Category Filters */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {categories.map((category) => (
                <Pressable
                  key={category.key}
                  onPress={() => setFilterCategory(category.key)}
                  className={cn(
                    "flex-row items-center px-4 py-2 rounded-full border",
                    filterCategory === category.key
                      ? 'bg-green-500 border-green-500 shadow-sm'
                      : 'bg-white border-gray-200'
                  )}
                >
                  <Ionicons 
                    name={category.icon as keyof typeof Ionicons.glyphMap} 
                    size={16} 
                    color={filterCategory === category.key ? 'white' : getCategoryColor(category.key === 'all' ? 'plant' : category.key)} 
                  />
                  <Text
                    className={cn(
                      "text-sm font-semibold ml-2",
                      filterCategory === category.key ? 'text-white' : 'text-gray-700'
                    )}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Finds List */}
        <ScrollView className="flex-1 px-4 py-4">
          {filteredFinds.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              {finds.length === 0 ? (
                // First-time user empty state
                <>
                  <View className="bg-green-100 rounded-full p-6 mb-4">
                    <Ionicons name="leaf" size={48} color="#22c55e" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2">
                    Start Your Foraging Journey
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mb-6 max-w-64">
                    Discover and document the wild plants, fungi, and berries you find in nature
                  </Text>
                  
                  <View className="w-full space-y-3">
                    <Pressable 
                      onPress={() => navigation.navigate('Map')}
                      className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center"
                    >
                      <Ionicons name="map" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">Explore Map</Text>
                    </Pressable>
                    
                    <Pressable 
                      onPress={() => navigation.navigate('Plants')}
                      className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center"
                    >
                      <Ionicons name="library" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">Browse Plants</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                // Filtered results empty state
                <>
                  <Ionicons name="funnel-outline" size={48} color="#9ca3af" />
                  <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
                    No finds match your filters
                  </Text>
                  <Text className="text-sm text-gray-400 text-center mb-4">
                    Try adjusting your search or category filter
                  </Text>
                  <Pressable 
                    onPress={() => {
                      setFilterCategory('all');
                      setSearchQuery('');
                      setShowSearch(false);
                    }}
                    className="bg-gray-100 px-4 py-2 rounded-full"
                  >
                    <Text className="text-gray-700 font-medium">Clear Filters</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm font-medium text-gray-600">
                  {filteredFinds.length} find{filteredFinds.length !== 1 ? 's' : ''}
                  {filterCategory !== 'all' && ` in ${categories.find(c => c.key === filterCategory)?.label.toLowerCase()}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </Text>
                
                {finds.length > filteredFinds.length && (
                  <Pressable 
                    onPress={() => {
                      setFilterCategory('all');
                      setSearchQuery('');
                      setShowSearch(false);
                    }}
                    className="px-2 py-1 rounded-full bg-gray-100"
                  >
                    <Text className="text-xs text-gray-600">Show All</Text>
                  </Pressable>
                )}
              </View>
              {filteredFinds.map(renderFindCard)}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}