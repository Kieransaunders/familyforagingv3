import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';
import { getCurrentSeasonalSuggestionsFromDatabase } from '../data/plants';
import { cn } from '../utils/cn';

interface LogFindScreenProps {
  navigation: any;
  route?: any;
}

export default function LogFindScreen({ navigation, route }: LogFindScreenProps) {
  const { finds } = useForagingStore();
  const editFindId = route?.params?.editFindId;
  const editFindParam = route?.params?.editFind;
  
  // Get editFind either from ID or from params (with dateFound conversion)
  const editFind = editFindId 
    ? finds.find(f => f.id === editFindId)
    : editFindParam
    ? {
        ...editFindParam,
        dateFound: typeof editFindParam.dateFound === 'string' 
          ? new Date(editFindParam.dateFound) 
          : editFindParam.dateFound
      }
    : null;
    
  const isEditMode = !!editFind;
  
  const [name, setName] = useState(editFind?.name || '');
  const [category, setCategory] = useState<ForagingFind['category']>(editFind?.category || 'plant');
  const [notes, setNotes] = useState(editFind?.notes || '');
  const [habitat, setHabitat] = useState(editFind?.habitat || '');
  const [photos, setPhotos] = useState<string[]>(editFind?.photos || []);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Initialize harvest months - default to current month if new find
  const defaultHarvestMonths = editFind?.harvestMonths || (() => {
    const currentMonth = new Date().getMonth();
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const months = { jan: false, feb: false, mar: false, apr: false, may: false, jun: false, jul: false, aug: false, sep: false, oct: false, nov: false, dec: false };
    months[monthKeys[currentMonth] as keyof typeof months] = true;
    return months;
  })();
  
  const [harvestMonths, setHarvestMonths] = useState(defaultHarvestMonths);
  
  const { addFind, updateFind, currentLocation, presetLogLocation, setPresetLogLocation } = useForagingStore();
  const seasonalSuggestions = getCurrentSeasonalSuggestionsFromDatabase();
  const manualMode = route?.params?.manualMode;

  useEffect(() => {
    if (isEditMode && editFind) {
      // Edit mode - use existing find's location
      const existingLocation = {
        coords: {
          latitude: editFind.location.latitude,
          longitude: editFind.location.longitude,
        },
      };
      setLocation(existingLocation as Location.LocationObject);
      setAddress(editFind.location.address || 'Unknown address');
    } else if (presetLogLocation) {
      // Use preset location from map pin
      const mockLocation = {
        coords: {
          latitude: presetLogLocation.latitude,
          longitude: presetLogLocation.longitude,
        },
      };
      setLocation(mockLocation as Location.LocationObject);
      getAddressFromCoordinates(presetLogLocation.latitude, presetLogLocation.longitude);
    } else if (manualMode) {
      // Manual mode - no GPS needed
      const mockLocation = {
        coords: {
          latitude: 0,
          longitude: 0,
        },
      };
      setLocation(mockLocation as Location.LocationObject);
      setAddress('Manual entry - no GPS location');
    } else {
      getCurrentLocation();
    }
  }, [presetLogLocation, manualMode, isEditMode, editFind]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location access is needed to log finds');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      await getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (addressResponse[0]) {
        const addr = addressResponse[0];
        setAddress(`${addr.name || ''} ${addr.city || ''}, ${addr.region || ''}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setAddress('Location selected from map');
    }
  };

  const handlePhotoTaken = (uri: string) => {
    setPhotos(prev => [...prev, uri]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getSeason = (): ForagingFind['season'] => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your find');
      return;
    }

    if (!isEditMode && !location && !presetLogLocation && !manualMode) {
      Alert.alert('Error', 'Location is required. Please enable location services or use manual entry.');
      return;
    }

    const findLocation = presetLogLocation || {
      latitude: location?.coords.latitude || 0,
      longitude: location?.coords.longitude || 0,
    };

    if (isEditMode && editFind) {
      // Update existing find
      const updatedFind: Partial<ForagingFind> = {
        name: name.trim(),
        category,
        location: {
          latitude: findLocation.latitude,
          longitude: findLocation.longitude,
          address: address || undefined,
        },
        photos,
        notes: notes.trim(),
        habitat: habitat.trim(),
        harvestMonths,
      };

      updateFind(editFind.id, updatedFind);
      
      Alert.alert(
        'Success!', 
        'Your find has been updated successfully',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      // Create new find
      const find: ForagingFind = {
        id: Date.now().toString(),
        name: name.trim(),
        category,
        location: {
          latitude: findLocation.latitude,
          longitude: findLocation.longitude,
          address: address || undefined,
        },
        photos,
        notes: notes.trim(),
        habitat: habitat.trim(),
        dateFound: new Date(),
        season: getSeason(),
        userId: 'current-user', // In a real app, this would be the authenticated user
        tags: [], // Could be enhanced to allow custom tags
        harvestMonths,
      };

      addFind(find);
      
      Alert.alert(
        'Success!', 
        'Your find has been logged successfully',
        [
          { text: 'OK', onPress: () => {
            // Reset form
            setName('');
            setNotes('');
            setHabitat('');
            setPhotos([]);
            setCategory('plant');
            // Reset harvest months to current month
            const currentMonth = new Date().getMonth();
            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const resetMonths = { jan: false, feb: false, mar: false, apr: false, may: false, jun: false, jul: false, aug: false, sep: false, oct: false, nov: false, dec: false };
            resetMonths[monthKeys[currentMonth] as keyof typeof resetMonths] = true;
            setHarvestMonths(resetMonths);
            
            // Navigate back to map if came from pin placement
            if (presetLogLocation) {
              setPresetLogLocation(null); // Clear the preset location
              navigation.goBack();
            }
          }}
        ]
      );
    }
  };

  const selectSuggestion = (suggestion: any) => {
    setName(suggestion.name);
    setCategory(suggestion.category);
    setHabitat(suggestion.habitat);
    setShowSuggestions(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingTop: 8, 
          paddingBottom: 120,
          flexGrow: 1 
        }}
      >
        {/* Location Display */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#22c55e" />
              <Text className="font-semibold text-gray-900 ml-2">
                {presetLogLocation ? 'Map Location' : manualMode ? 'Manual Entry' : 'Current Location'}
              </Text>
            </View>
            {(presetLogLocation || manualMode) && (
              <View className={`px-2 py-1 rounded-full ${presetLogLocation ? 'bg-green-100' : 'bg-blue-100'}`}>
                <Text className={`text-xs font-medium ${presetLogLocation ? 'text-green-800' : 'text-blue-800'}`}>
                  {presetLogLocation ? 'From Map Pin' : 'No GPS'}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-gray-600 text-sm">
            {address || (presetLogLocation ? 'Location selected from map' : manualMode ? 'Manual entry - no GPS location' : 'Getting location...')}
          </Text>
          {presetLogLocation && (
            <Text className="text-gray-500 text-xs mt-1">
              {presetLogLocation.latitude.toFixed(6)}, {presetLogLocation.longitude.toFixed(6)}
            </Text>
          )}
          {manualMode && (
            <Text className="text-blue-600 text-xs mt-1">
              💡 Tip: Include detailed location info in your habitat or notes field
            </Text>
          )}
          {!location && !presetLogLocation && !manualMode && (
            <Pressable
              onPress={getCurrentLocation}
              className="bg-green-500 px-4 py-2 rounded-lg mt-2 self-start"
            >
              <Text className="text-white font-medium">Get Location</Text>
            </Pressable>
          )}
        </View>

        {/* Seasonal Suggestions */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Pressable
            onPress={() => setShowSuggestions(!showSuggestions)}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="leaf" size={20} color="#22c55e" />
              <Text className="font-semibold text-gray-900 ml-2">
                In Season Now ({seasonalSuggestions.length})
              </Text>
            </View>
            <Ionicons 
              name={showSuggestions ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6b7280" 
            />
          </Pressable>
          
          {showSuggestions && (
            <View className="mt-3 space-y-2">
              {seasonalSuggestions.map((suggestion, index) => (
                <Pressable
                  key={index}
                  onPress={() => selectSuggestion(suggestion)}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <Text className="font-medium text-gray-900">{suggestion.name}</Text>
                  <Text className="text-sm text-gray-600 capitalize">
                    {suggestion.category}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Find Details Form */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-4">Find Details</Text>
          
          {/* Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Wild Garlic, Elderflower"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {['plant', 'fungi', 'berry', 'nut', 'herb', 'other'].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat as ForagingFind['category'])}
                  className={cn(
                    "px-4 py-2 rounded-full border",
                    category === cat
                      ? "bg-green-500 border-green-500"
                      : "bg-gray-100 border-gray-200"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium capitalize",
                      category === cat ? "text-white" : "text-gray-700"
                    )}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Habitat */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Habitat</Text>
            <TextInput
              value={habitat}
              onChangeText={setHabitat}
              placeholder="e.g., Woodland floor, Near stream"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Harvest Months */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Best Harvest Months</Text>
            <Text className="text-gray-500 text-sm mb-3">Select when this plant is typically ready for harvest</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { key: 'jan' as const, label: 'Jan' },
                { key: 'feb' as const, label: 'Feb' },
                { key: 'mar' as const, label: 'Mar' },
                { key: 'apr' as const, label: 'Apr' },
                { key: 'may' as const, label: 'May' },
                { key: 'jun' as const, label: 'Jun' },
                { key: 'jul' as const, label: 'Jul' },
                { key: 'aug' as const, label: 'Aug' },
                { key: 'sep' as const, label: 'Sep' },
                { key: 'oct' as const, label: 'Oct' },
                { key: 'nov' as const, label: 'Nov' },
                { key: 'dec' as const, label: 'Dec' },
              ].map((month) => (
                <Pressable
                  key={month.key}
                  onPress={() => {
                    setHarvestMonths((prev: any) => ({
                      ...prev,
                      [month.key]: !prev[month.key]
                    }));
                  }}
                  className={cn(
                    'px-3 py-2 rounded-lg border flex-1 min-w-[70px] items-center',
                    harvestMonths[month.key]
                      ? 'bg-green-500 border-green-500'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      harvestMonths[month.key]
                        ? 'text-white'
                        : 'text-gray-700'
                    )}
                  >
                    {month.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Condition, wildlife nearby, etc."
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 h-20"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
            />
          </View>

        </View>

        {/* Photos */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="font-semibold text-gray-900 mb-4">Photos</Text>
          
          <View className="flex-row flex-wrap gap-2">
            {photos.map((photo, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: photo }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>
              </View>
            ))}
            
            <Pressable
              onPress={() => navigation.navigate('Camera', { onPhotoTaken: handlePhotoTaken })}
              className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Ionicons name="camera" size={24} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        {/* Manual Location Entry */}
        {!location && !presetLogLocation && !manualMode && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="font-semibold text-gray-900 mb-3">
              Can't get location? Log manually
            </Text>
            <Text className="text-gray-600 text-sm mb-3">
              You can still log your find without GPS. Just provide as much detail as possible in the habitat and notes fields.
            </Text>
            <Pressable
              onPress={() => {
                // Create a mock location for manual entry
                const mockLocation = {
                  coords: {
                    latitude: 0,
                    longitude: 0,
                  },
                };
                setLocation(mockLocation as Location.LocationObject);
                setAddress('Manual entry - no GPS location');
              }}
              className="bg-blue-500 px-4 py-2 rounded-lg self-start"
            >
              <Text className="text-white font-medium">Log Without GPS</Text>
            </Pressable>
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={!name.trim() || (!isEditMode && !location && !presetLogLocation && !manualMode)}
          className={cn(
            "py-4 rounded-xl mb-8",
            name.trim() && (isEditMode || location || presetLogLocation || manualMode)
              ? "bg-green-500"
              : "bg-gray-300"
          )}
        >
          <Text className="text-white font-semibold text-center text-lg">
            {isEditMode ? 'Update Find' : 'Log Find'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}