import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

interface FindDetailScreenProps {
  navigation: any;
  route: any;
}

export default function FindDetailScreen({ navigation, route }: FindDetailScreenProps) {
  const { find }: { find: ForagingFind } = route.params;
  const { deleteFind, recipes } = useForagingStore();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showFullNotes, setShowFullNotes] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plant': return 'bg-green-100 text-green-800';
      case 'fungi': return 'bg-yellow-100 text-yellow-800';
      case 'berry': return 'bg-red-100 text-red-800';
      case 'nut': return 'bg-purple-100 text-purple-800';
      case 'herb': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return 'leaf-outline';
      case 'summer': return 'sunny-outline';
      case 'autumn': return 'leaf';
      case 'winter': return 'snow-outline';
      default: return 'calendar-outline';
    }
  };

  const relatedRecipes = recipes.filter(recipe =>
    recipe.requiredFinds.some(ingredient =>
      ingredient.toLowerCase().includes(find.name.toLowerCase()) ||
      find.name.toLowerCase().includes(ingredient.toLowerCase())
    )
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Find',
      'Are you sure you want to delete this find? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFind(find.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const openInMaps = async () => {
    const url = `maps://?q=${find.location.latitude},${find.location.longitude}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web maps if native maps app isn't available
        const webUrl = `https://maps.google.com/maps?q=${find.location.latitude},${find.location.longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open maps');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image or Placeholder */}
        {find.photos.length > 0 ? (
          <View className="relative">
            <Image
              source={{ uri: find.photos[selectedPhotoIndex] }}
              style={{ width: screenWidth, height: 300 }}
              resizeMode="cover"
            />
            
            {/* Photo Navigation */}
            {find.photos.length > 1 && (
              <View className="absolute bottom-4 right-4">
                <View className="bg-black/50 rounded-full px-3 py-1">
                  <Text className="text-white text-sm font-medium">
                    {selectedPhotoIndex + 1} / {find.photos.length}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Action Buttons Overlay */}
            <View className="absolute top-4 right-4 flex-row gap-2">
              
              <Pressable
                onPress={() => navigation.navigate('LogFind', { editFindId: find.id })}
                className="bg-blue-500/90 rounded-full p-2"
              >
                <Ionicons name="pencil" size={20} color="white" />
              </Pressable>
              
              <Pressable
                onPress={handleDelete}
                className="bg-red-500/90 rounded-full p-2"
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="bg-gradient-to-b from-gray-200 to-gray-300" style={{ width: screenWidth, height: 200 }}>
            <View className="flex-1 items-center justify-center">
              <View className="bg-white/80 rounded-full p-4 mb-2">
                <Ionicons name="camera-outline" size={32} color="#6b7280" />
              </View>
              <Text className="text-gray-600 font-medium">No Photo Available</Text>
            </View>
            
            {/* Action Buttons */}
            <View className="absolute top-4 right-4 flex-row gap-2">
              
              <Pressable
                onPress={() => navigation.navigate('LogFind', { editFindId: find.id })}
                className="bg-blue-500/90 rounded-full p-2"
              >
                <Ionicons name="pencil" size={20} color="white" />
              </Pressable>
              
              <Pressable
                onPress={handleDelete}
                className="bg-red-500/90 rounded-full p-2"
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Main Content */}
        <View className="bg-white -mt-6 rounded-t-3xl p-6 shadow-lg">
          {/* Header Info */}
          <View className="mb-6">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  {find.name}
                </Text>
                
                <View className="flex-row items-center gap-3">
                  <View className={cn("px-3 py-2 rounded-full", getCategoryColor(find.category))}>
                    <Text className={cn("font-semibold capitalize text-sm", getCategoryColor(find.category).split(' ')[1])}>
                      {find.category}
                    </Text>
                  </View>
                  
                  {relatedRecipes.length > 0 && (
                    <Pressable 
                      onPress={() => {
                        const tabNavigation = navigation.getParent();
                        tabNavigation?.navigate('Recipes');
                      }}
                      className="bg-orange-100 px-3 py-2 rounded-full flex-row items-center"
                    >
                      <Ionicons name="restaurant" size={14} color="#ea580c" />
                      <Text className="text-orange-700 font-semibold text-sm ml-1">
                        {relatedRecipes.length} Recipe{relatedRecipes.length > 1 ? 's' : ''}
                      </Text>
                    </Pressable>
                  )}
                  
                  {/* Harvest Months */}
                  {find.harvestMonths && Object.values(find.harvestMonths).some(Boolean) && (
                    <View className="bg-green-100 px-3 py-2 rounded-full">
                      <Text className="text-green-700 font-semibold text-sm">
                        🗓️ {Object.entries(find.harvestMonths)
                          .filter(([_, selected]) => selected)
                          .map(([month, _]) => month.charAt(0).toUpperCase() + month.slice(1))
                          .join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Quick Info Cards */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={18} color="#6b7280" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500 font-medium">Found</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {format(new Date(find.dateFound), 'MMM d, yyyy')}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-1 bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center">
                  <Ionicons name={getSeasonIcon(find.season)} size={18} color="#6b7280" />
                  <View className="ml-2">
                    <Text className="text-xs text-gray-500 font-medium">Season</Text>
                    <Text className="text-sm font-semibold text-gray-900 capitalize">
                      {find.season}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Photo Gallery */}
          {find.photos.length > 1 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Photos ({find.photos.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {find.photos.map((photo, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedPhotoIndex(index)}
                      className={cn(
                        "rounded-xl overflow-hidden border-2",
                        selectedPhotoIndex === index ? "border-green-500" : "border-transparent"
                      )}
                    >
                      <Image
                        source={{ uri: photo }}
                        className="w-20 h-20"
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Notes Section */}
          {find.notes ? (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Notes</Text>
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <Text 
                  className="text-gray-900 leading-6" 
                  numberOfLines={showFullNotes ? undefined : 4}
                >
                  {find.notes}
                </Text>
                
                {find.notes.length > 200 && (
                  <Pressable 
                    onPress={() => setShowFullNotes(!showFullNotes)}
                    className="mt-2"
                  >
                    <Text className="text-amber-700 font-semibold text-sm">
                      {showFullNotes ? 'Show less' : 'Read more'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Notes</Text>
              <Pressable 
                onPress={() => navigation.navigate('LogFind', { editFindId: find.id })}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
              >
                <Ionicons name="add-circle-outline" size={32} color="#9ca3af" />
                <Text className="text-gray-500 font-medium mt-2">Add notes about this find</Text>
              </Pressable>
            </View>
          )}

          {/* Location Section */}
          {(find.location.latitude !== 0 || find.location.longitude !== 0) && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Location</Text>
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                {find.location.address && (
                  <View className="flex-row items-start mb-3">
                    <Ionicons name="location" size={20} color="#3b82f6" />
                    <Text className="text-gray-900 ml-3 flex-1 font-medium">
                      {find.location.address}
                    </Text>
                  </View>
                )}
                
                <View className="flex-row items-center mb-4">
                  <Ionicons name="navigate" size={20} color="#6b7280" />
                  <Text className="text-gray-600 ml-3 font-mono text-sm">
                    {find.location.latitude.toFixed(6)}, {find.location.longitude.toFixed(6)}
                  </Text>
                </View>
                
                <Pressable
                  onPress={openInMaps}
                  className="bg-blue-500 py-3 rounded-xl flex-row items-center justify-center"
                >
                  <Ionicons name="map" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">
                    Open in Maps App
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Habitat Section */}
          {find.habitat && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Habitat</Text>
              <View className="bg-green-50 border border-green-200 rounded-xl p-4">
                <View className="flex-row items-start">
                  <Ionicons name="leaf" size={20} color="#22c55e" />
                  <Text className="text-gray-900 ml-3 flex-1 leading-6">
                    {find.habitat}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Related Recipes */}
          {relatedRecipes.length > 0 && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Related Recipes ({relatedRecipes.length})
              </Text>
              
              <View className="space-y-3">
                {relatedRecipes.map((recipe, index) => (
                  <Pressable
                    key={recipe.id}
                    onPress={() => {
                      const tabNavigation = navigation.getParent();
                      tabNavigation?.navigate('Recipes', {
                        screen: 'RecipeDetail',
                        params: { recipe }
                      });
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 mb-1 text-lg">
                          {recipe.title}
                        </Text>
                        <Text className="text-gray-600 mb-2">
                          {recipe.description}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <View className="bg-orange-100 px-2 py-1 rounded-full">
                            <Text className="text-orange-700 text-xs font-semibold capitalize">
                              {recipe.category}
                            </Text>
                          </View>
                          <View className="bg-gray-100 px-2 py-1 rounded-full">
                            <Text className="text-gray-700 text-xs font-semibold capitalize">
                              {recipe.difficulty}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="ml-3">
                        <Ionicons name="chevron-forward-circle" size={32} color="#22c55e" />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
