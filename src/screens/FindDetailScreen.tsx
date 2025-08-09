import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';
import { format } from 'date-fns';

interface FindDetailScreenProps {
  navigation: any;
  route: any;
}

export default function FindDetailScreen({ navigation, route }: FindDetailScreenProps) {
  const { find }: { find: ForagingFind } = route.params;
  const { deleteFind, recipes } = useForagingStore();

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
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                {find.name}
              </Text>
              <View className={`px-3 py-1 rounded-full self-start ${getCategoryColor(find.category)}`}>
                <Text className={`font-medium capitalize ${getCategoryColor(find.category).split(' ')[1]}`}>
                  {find.category}
                </Text>
              </View>
            </View>
            
            <View className="flex-row space-x-2">
              {find.isPrivate && (
                <View className="bg-gray-100 p-2 rounded-full">
                  <Ionicons name="eye-off" size={20} color="#6b7280" />
                </View>
              )}
              
              <Pressable
                onPress={() => navigation.navigate('LogFind', { editFind: find })}
                className="bg-blue-100 p-2 rounded-full"
              >
                <Ionicons name="pencil" size={20} color="#3b82f6" />
              </Pressable>
              
              <Pressable
                onPress={handleDelete}
                className="bg-red-100 p-2 rounded-full"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </Pressable>
            </View>
          </View>

          {/* Date and Season */}
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-2">
                {format(new Date(find.dateFound), 'MMM d, yyyy')}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name={getSeasonIcon(find.season)} size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-2 capitalize">
                {find.season}
              </Text>
            </View>
          </View>
        </View>

        {/* Photos */}
        {find.photos.length > 0 && (
          <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Photos ({find.photos.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {find.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    className="w-32 h-32 rounded-lg"
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Location */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Location
          </Text>
          
          <View className="space-y-3">
            {find.location.address && (
              <View className="flex-row items-start">
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <Text className="text-gray-900 ml-3 flex-1">
                  {find.location.address}
                </Text>
              </View>
            )}
            
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3">
                {find.location.latitude.toFixed(6)}, {find.location.longitude.toFixed(6)}
              </Text>
            </View>
            
            <Pressable
              onPress={openInMaps}
              className="bg-blue-500 py-3 rounded-lg mt-2"
            >
              <Text className="text-white text-center font-semibold">
                Open in Maps
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Habitat */}
        {find.habitat && (
          <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Habitat
            </Text>
            <Text className="text-gray-900 leading-relaxed">
              {find.habitat}
            </Text>
          </View>
        )}

        {/* Notes */}
        {find.notes && (
          <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Notes
            </Text>
            <Text className="text-gray-900 leading-relaxed">
              {find.notes}
            </Text>
          </View>
        )}

        {/* Related Recipes */}
        {relatedRecipes.length > 0 && (
          <View className="bg-white mx-4 mb-8 rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Related Recipes ({relatedRecipes.length})
            </Text>
            
            {relatedRecipes.map((recipe, index) => (
              <Pressable
                key={recipe.id}
                onPress={() => {
                  // Navigate to Recipe tab first, then to RecipeDetail
                  const tabNavigation = navigation.getParent();
                  tabNavigation?.navigate('Recipes', {
                    screen: 'RecipeDetail',
                    params: { recipe }
                  });
                }}
                className={`p-3 rounded-lg ${index > 0 ? 'mt-2' : ''} ${
                  index % 2 === 0 ? 'bg-green-50' : 'bg-blue-50'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 mb-1">
                      {recipe.title}
                    </Text>
                    <Text className="text-gray-600 text-sm capitalize">
                      {recipe.category} • {recipe.difficulty}
                    </Text>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}