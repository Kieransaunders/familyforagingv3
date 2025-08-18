import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';
import { getCurrentSeasonSuggestions } from '../data/seasonal-suggestions';
import { cn } from '../utils/cn';
import SimpleMap from '../components/SimpleMap';
import QuickFindBottomSheet from '../components/QuickFindBottomSheet';

interface MapScreenProps {
  navigation: any;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const mapRef = useRef<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSeasonalSuggestions, setShowSeasonalSuggestions] = useState(false);
  const [pendingPin, setPendingPin] = useState<{latitude: number, longitude: number} | null>(null);
  const [showQuickFindSheet, setShowQuickFindSheet] = useState(false);
  const [undoPin, setUndoPin] = useState<{findId: string, timeout: NodeJS.Timeout} | null>(null);
  
  const { 
    finds, 
    mapFilter, 
    setMapFilter, 
    showHeatZones, 
    setShowHeatZones,
    currentLocation,
    setCurrentLocation,
    setPresetLogLocation,
    plants,
    focusedFind,
    setFocusedFind,
    addFind,
    deleteFind,
  } = useForagingStore();

  const seasonalSuggestions = getCurrentSeasonSuggestions();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Reset filters when map screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset map filters to default state
      setMapFilter({ 
        category: [], 
        inSeasonNow: false 
      });
      
      // Close any open filter panels
      setShowFilters(false);
      setShowSeasonalSuggestions(false);
    }, [setMapFilter])
  );

  // Handle focused find - center map on it when set
  useEffect(() => {
    if (focusedFind && mapRef.current) {
      // Small delay to ensure map is loaded
      const timer = setTimeout(() => {
        centerOnFind(focusedFind);
        // Clear the focused find after centering
        setFocusedFind(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [focusedFind]);

  const monthIndex = new Date().getMonth(); // 0-11
  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

  const filteredFinds = finds.filter(find => {
    if (find.location.latitude === 0 && find.location.longitude === 0) return false;
    if (mapFilter.category.length > 0 && !mapFilter.category.includes(find.category)) return false;

    if (mapFilter.inSeasonNow) {
      const matchedPlant = plants.find(p => p.name.toLowerCase().trim() === find.name.toLowerCase().trim());
      if (!matchedPlant) return false;
      const flags = matchedPlant.inSeason;
      if (!flags) return false;
      const key = monthKeys[monthIndex];
      if (!(flags as any)[key]) return false;
    }
    return true;
  });

  const centerOnLocation = async () => {
    if (location && mapRef.current) {
      // Use injectJavaScript to directly call window.setView
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      const zoom = 15;
      
      mapRef.current.injectJavaScript(`
        if (window.setView) {
          window.setView(${lat}, ${lng}, ${zoom});
        }
        true;
      `);
    }
  };

  const centerOnFind = (find: ForagingFind) => {
    if (mapRef.current && find.location.latitude !== 0 && find.location.longitude !== 0) {
      // Use injectJavaScript to directly call window.setView
      const lat = find.location.latitude;
      const lng = find.location.longitude;
      const zoom = 17;
      
      mapRef.current.injectJavaScript(`
        if (window.setView) {
          window.setView(${lat}, ${lng}, ${zoom});
        }
        true;
      `);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plant': return '#22c55e'; // Green
      case 'fungi': return '#8b4513'; // Brown  
      case 'berry': return '#ef4444'; // Red
      case 'nut': return '#deb887';   // Light brown/burlywood
      case 'herb': return '#9caf88';  // Sage green
      default: return '#6b7280';      // Gray for 'other'
    }
  };

  const toggleFilter = (category: string) => {
    const newCategories = mapFilter.category.includes(category)
      ? mapFilter.category.filter(c => c !== category)
      : [...mapFilter.category, category];
    setMapFilter({ category: newCategories });
  };

  const handleMapPress = (event: any) => {
    // Regular map press - currently no action needed
  };

  const handleMapLongPress = (event: any) => {
    // Handle long press to drop pin
    const coordinate = event.nativeEvent?.coordinate || event.latlng;
    if (coordinate) {
      const latitude = coordinate.latitude || coordinate.lat;
      const longitude = coordinate.longitude || coordinate.lng;
      
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Set pending pin and show bottom sheet
      setPendingPin({ latitude, longitude });
      setShowQuickFindSheet(true);
    }
  };


  const handleQuickFindSave = (data: { name: string; category: string; notes: string }) => {
    if (pendingPin) {
      // Determine current season
      const month = new Date().getMonth();
      let season: 'spring' | 'summer' | 'autumn' | 'winter';
      if (month >= 2 && month <= 4) season = 'spring';
      else if (month >= 5 && month <= 7) season = 'summer';
      else if (month >= 8 && month <= 10) season = 'autumn';
      else season = 'winter';
      
      // Create the find with default harvest month set to current month
      const findId = Date.now().toString();
      const currentMonth = new Date().getMonth();
      const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const defaultHarvestMonths = { jan: false, feb: false, mar: false, apr: false, may: false, jun: false, jul: false, aug: false, sep: false, oct: false, nov: false, dec: false };
      defaultHarvestMonths[monthKeys[currentMonth] as keyof typeof defaultHarvestMonths] = true;
      
      const newFind = {
        id: findId,
        name: data.name,
        category: data.category as 'plant' | 'fungi' | 'berry' | 'nut' | 'herb' | 'other',
        location: pendingPin,
        dateFound: new Date(),
        notes: data.notes,
        photos: [],
        season,
        habitat: 'Not specified',
        userId: 'local-user',
        tags: [],
        harvestMonths: defaultHarvestMonths,
      };
      
      // Add to store
      addFind(newFind);
      
      // Show undo option temporarily
      showUndoOption(findId);
      
      // Close bottom sheet and clear pending pin
      setShowQuickFindSheet(false);
      setPendingPin(null);
      
      // Navigate to the edit screen for the newly created find
      navigation.navigate('LogFind', { editFind: newFind });
    }
  };

  const handleQuickFindCancel = () => {
    setShowQuickFindSheet(false);
    setPendingPin(null);
  };

  const showUndoOption = (findId: string) => {
    // Clear any existing undo timeout
    if (undoPin?.timeout) {
      clearTimeout(undoPin.timeout);
    }
    
    // Set new undo option with 5 second timeout
    const timeout = setTimeout(() => {
      setUndoPin(null);
    }, 5000);
    
    setUndoPin({ findId, timeout });
  };

  const handleUndo = () => {
    if (undoPin) {
      // Remove the find from store
      deleteFind(undoPin.findId);
      
      // Clear undo option
      if (undoPin.timeout) {
        clearTimeout(undoPin.timeout);
      }
      setUndoPin(null);
    }
  };

  if (errorMsg) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center px-4">
        <Ionicons name="location-outline" size={48} color="#ef4444" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Location Access Required
        </Text>
        <Text className="text-gray-600 mt-2 text-center">
          {errorMsg}
        </Text>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Ionicons name="location-outline" size={48} color="#22c55e" />
        <Text className="text-lg font-semibold text-gray-900 mt-4">
          Finding your location...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <SimpleMap
          mapRef={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          onPress={handleMapPress}
          onLongPress={handleMapLongPress}
          markers={[
            ...filteredFinds.map((find) => ({
              id: find.id,
              coordinate: {
                latitude: find.location.latitude,
                longitude: find.location.longitude,
              },
              title: find.name,
              description: `${find.category} - ${new Date(find.dateFound).toLocaleDateString()}`,
              pinColor: getCategoryColor(find.category),
              onPress: () => navigation.navigate('FindDetail', { find }),
            })),
          ]}
        />

        {/* Manual Finds Badge */}
        {finds.some(find => find.location.latitude === 0 && find.location.longitude === 0) && (
          <View className="absolute top-32 left-4 bg-blue-100 border border-blue-300 rounded-xl p-3">
            <Text className="text-blue-800 text-sm font-medium">
              📝 {finds.filter(find => find.location.latitude === 0 && find.location.longitude === 0).length} manual entries
            </Text>
            <Text className="text-blue-600 text-xs">
              Check Recipes tab to view
            </Text>
          </View>
        )}

        {/* Floating Action Buttons */}
        <View className="absolute bottom-6 right-4 space-y-3">
          <Pressable
            onPress={centerOnLocation}
            className="bg-white rounded-full p-3 shadow-lg"
          >
            <Ionicons name="locate" size={24} color="#22c55e" />
          </Pressable>

          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className={cn(
              "rounded-full p-3 shadow-lg",
              showFilters ? "bg-green-500" : "bg-white"
            )}
          >
            <Ionicons 
              name="filter" 
              size={24} 
              color={showFilters ? "white" : "#22c55e"} 
            />
          </Pressable>

          <Pressable
            onPress={() => setShowSeasonalSuggestions(!showSeasonalSuggestions)}
            className={cn(
              "rounded-full p-3 shadow-lg",
              showSeasonalSuggestions ? "bg-green-500" : "bg-white"
            )}
          >
            <Ionicons 
              name="leaf" 
              size={24} 
              color={showSeasonalSuggestions ? "white" : "#22c55e"} 
            />
          </Pressable>
        </View>

        {/* Undo Chip */}
        {undoPin && (
          <View className="absolute top-32 left-4 right-4 bg-green-100 border border-green-300 rounded-xl p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-green-800">📍 Find added!</Text>
                <Text className="text-green-700 text-sm">Pin placed on map</Text>
              </View>
              <Pressable
                onPress={handleUndo}
                className="bg-green-500 py-2 px-4 rounded-lg ml-3"
              >
                <Text className="text-white font-medium">Undo</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <View className="absolute bottom-20 left-4 right-20 bg-white rounded-2xl p-4 shadow-lg">
            <Text className="font-semibold text-gray-900 mb-3">Filter by Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {['plant', 'fungi', 'berry', 'nut', 'herb', 'other'].map((category) => (
                <Pressable
                  key={category}
                  onPress={() => toggleFilter(category)}
                  className={cn(
                    "px-3 py-2 rounded-full border",
                    mapFilter.category.includes(category)
                      ? "bg-green-500 border-green-500"
                      : "bg-gray-100 border-gray-200"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium capitalize",
                      mapFilter.category.includes(category)
                        ? "text-white"
                        : "text-gray-700"
                    )}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
            

            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-sm text-gray-600">In season now</Text>
              <Pressable
                onPress={() => setMapFilter({ inSeasonNow: !mapFilter.inSeasonNow })}
                className={cn(
                  "w-12 h-6 rounded-full p-1",
                  mapFilter.inSeasonNow ? "bg-green-500" : "bg-gray-200"
                )}
              >
                <View
                  className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform",
                    mapFilter.inSeasonNow ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </Pressable>
            </View>
          </View>
        )}

        {/* Seasonal Suggestions Panel */}
          {showSeasonalSuggestions && (
            <View className="absolute bottom-20 left-4 right-20 bg-white rounded-2xl p-4 shadow-lg max-h-80">
              <Text className="font-semibold text-gray-900 mb-3">
                In Season Now
              </Text>
              <ScrollView className="max-h-64">
                {plants.filter(p => {
                  const flags = p.inSeason;
                  if (!flags) return false;
                  const key = monthKeys[monthIndex];
                  return Boolean((flags as any)[key]);
                }).map((p) => (
                  <View key={p.id} className="mb-3 last:mb-0">
                    <Text className="font-medium text-gray-900">{p.name}</Text>
                    <Text className="text-sm text-gray-600 capitalize">{p.category}</Text>
                    {p.identification.keyFeatures[0] ? (
                      <Text className="text-xs text-gray-500 mt-1">{p.identification.keyFeatures[0]}</Text>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
              
              {/* Manual Entries Info */}
              {finds.some(find => find.location.latitude === 0 && find.location.longitude === 0) && (
                <View className="mt-4 pt-3 border-t border-gray-200">
                  <Text className="text-sm text-blue-600 font-medium">
                    📝 Manual entries available in Recipes section
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Finds logged without GPS don't appear on map
                  </Text>
                </View>
              )}
            </View>
          )}

        {/* Quick Find Bottom Sheet */}
        {pendingPin && (
          <QuickFindBottomSheet
            visible={showQuickFindSheet}
            location={pendingPin}
            onSave={handleQuickFindSave}
            onCancel={handleQuickFindCancel}
          />
        )}

      </View>
    </SafeAreaView>
  );
}