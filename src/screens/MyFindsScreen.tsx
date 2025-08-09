import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';

interface MyFindsScreenProps {
  navigation: any;
}

export default function MyFindsScreen({ navigation }: MyFindsScreenProps) {
  const { finds } = useForagingStore();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'plant', 'fungi', 'berry', 'nut', 'herb', 'other'];

  const filteredFinds = finds
    .filter(find => filterCategory === 'all' || find.category === filterCategory)
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

  const renderFindCard = (find: ForagingFind) => (
    <Pressable
      key={find.id}
      onPress={() => navigation.navigate('FindDetail', { find })}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold text-gray-900">{find.name}</Text>
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getCategoryColor(find.category) + '20' }}
        >
          <Text 
            className="text-xs font-medium capitalize"
            style={{ color: getCategoryColor(find.category) }}
          >
            {find.category}
          </Text>
        </View>
      </View>

      {find.photos.length > 0 && (
        <Image
          source={{ uri: find.photos[0] }}
          className="w-full h-32 rounded-lg mb-2"
          resizeMode="cover"
        />
      )}

      <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
        {find.notes || 'No notes added'}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">
          {new Date(find.dateFound).toLocaleDateString()}
        </Text>
        <View className="flex-row items-center">
          {find.location.latitude !== 0 && find.location.longitude !== 0 ? (
            <Ionicons name="location" size={12} color="#22c55e" />
          ) : (
            <Ionicons name="document-text" size={12} color="#6b7280" />
          )}
          {find.isPrivate && (
            <Ionicons name="lock-closed" size={12} color="#6b7280" style={{ marginLeft: 4 }} />
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-3">My Finds</Text>
          
          {/* Filters */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-700">Sort by:</Text>
            <View className="flex-row space-x-2">
              {(['date', 'name', 'category'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setSortBy(option)}
                  className={`px-3 py-1 rounded-full ${
                    sortBy === option ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      sortBy === option ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setFilterCategory(category)}
                  className={`px-3 py-2 rounded-full border ${
                    filterCategory === category
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      filterCategory === category ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Finds List */}
        <ScrollView className="flex-1 px-4 py-4">
          {filteredFinds.length === 0 ? (
            <View className="flex-1 justify-center items-center py-16">
              <Ionicons name="leaf-outline" size={48} color="#9ca3af" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No finds yet
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Start exploring and log your first foraging find!
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-sm text-gray-600 mb-4">
                {filteredFinds.length} find{filteredFinds.length !== 1 ? 's' : ''}
                {filterCategory !== 'all' && ` in ${filterCategory}`}
              </Text>
              {filteredFinds.map(renderFindCard)}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}