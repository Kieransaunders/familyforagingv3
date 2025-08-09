import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_APPLE, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useForagingStore } from '../state/foraging-store';
import { ForagingFind } from '../types/foraging';
import { getCurrentSeasonSuggestions } from '../data/seasonal-suggestions';
import { cn } from '../utils/cn';

interface MapScreenProps {
  navigation: any;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSeasonalSuggestions, setShowSeasonalSuggestions] = useState(false);
  const [pendingPin, setPendingPin] = useState<{latitude: number, longitude: number} | null>(null);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  
  const { 
    finds, 
    mapFilter, 
    setMapFilter, 
    showHeatZones, 
    setShowHeatZones,
    currentLocation,
    setCurrentLocation,
    setPresetLogLocation 
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

  const filteredFinds = finds.filter(find => {
    // Filter out manual entries without valid GPS coordinates
    if (find.location.latitude === 0 && find.location.longitude === 0) {
      return false;
    }
    
    if (mapFilter.category.length > 0 && !mapFilter.category.includes(find.category)) {
      return false;
    }
    if (!mapFilter.showPrivate && find.isPrivate) {
      return false;
    }
    return true;
  });

  const centerOnLocation = async () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

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

  const toggleFilter = (category: string) => {
    const newCategories = mapFilter.category.includes(category)
      ? mapFilter.category.filter(c => c !== category)
      : [...mapFilter.category, category];
    setMapFilter({ category: newCategories });
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (isPlacingPin) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setPendingPin({ latitude, longitude });
      setIsPlacingPin(false);
    }
  };

  const confirmPinPlacement = () => {
    if (pendingPin) {
      // Store the preset location in the global state
      setPresetLogLocation(pendingPin);
      // Navigate to the LogFind screen within the Map stack
      navigation.navigate('LogFind');
      setPendingPin(null);
    }
  };

  const cancelPinPlacement = () => {
    setPendingPin(null);
    setIsPlacingPin(false);
  };

  const startPlacingPin = () => {
    setIsPlacingPin(true);
    setShowFilters(false);
    setShowSeasonalSuggestions(false);
    Alert.alert(
      'Place Pin',
      'Tap anywhere on the map to place a pin for logging a new find.',
      [{ text: 'Got it!' }]
    );
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
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_APPLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={handleMapPress}
        >
          {filteredFinds.map((find) => (
            <Marker
              key={find.id}
              coordinate={{
                latitude: find.location.latitude,
                longitude: find.location.longitude,
              }}
              pinColor={getCategoryColor(find.category)}
            >
              <Callout
                onPress={() => navigation.navigate('FindDetail', { find })}
              >
                <View className="w-48 p-2">
                  <Text className="font-semibold text-gray-900">{find.name}</Text>
                  <Text className="text-sm text-gray-600 capitalize">{find.category}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {new Date(find.dateFound).toLocaleDateString()}
                  </Text>
                  <Text className="text-xs text-blue-600 mt-1">Tap for details</Text>
                </View>
              </Callout>
            </Marker>
          ))}

          {/* Pending Pin */}
          {pendingPin && (
            <Marker
              coordinate={pendingPin}
              pinColor="#ff6b6b"
            >
              <Callout onPress={confirmPinPlacement}>
                <View className="w-40 p-2">
                  <Text className="font-semibold text-gray-900">New Find Location</Text>
                  <Text className="text-sm text-gray-600">Tap to log find here</Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>

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
            onPress={startPlacingPin}
            className={cn(
              "rounded-full p-3 shadow-lg",
              isPlacingPin ? "bg-red-500" : "bg-white"
            )}
          >
            <Ionicons 
              name="add-circle" 
              size={24} 
              color={isPlacingPin ? "white" : "#22c55e"} 
            />
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

        {/* Pin Placement Instructions */}
        {isPlacingPin && (
          <View className="absolute top-32 left-4 right-4 bg-red-100 border border-red-300 rounded-xl p-4">
            <Text className="font-semibold text-red-800 mb-2">📍 Placing Pin Mode</Text>
            <Text className="text-red-700 text-sm">
              Tap anywhere on the map to place a pin
            </Text>
            <Pressable
              onPress={cancelPinPlacement}
              className="bg-red-500 py-2 px-4 rounded-lg mt-2 self-start"
            >
              <Text className="text-white font-medium">Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* Pending Pin Confirmation */}
        {pendingPin && !isPlacingPin && (
          <View className="absolute top-32 left-4 right-4 bg-green-100 border border-green-300 rounded-xl p-4">
            <Text className="font-semibold text-green-800 mb-2">📍 Pin Placed!</Text>
            <Text className="text-green-700 text-sm mb-3">
              Ready to log a find at this location?
            </Text>
            <View className="flex-row space-x-3">
              <Pressable
                onPress={confirmPinPlacement}
                className="bg-green-500 py-2 px-4 rounded-lg flex-1"
              >
                <Text className="text-white font-medium text-center">Log Find Here</Text>
              </Pressable>
              <Pressable
                onPress={cancelPinPlacement}
                className="bg-gray-500 py-2 px-4 rounded-lg flex-1"
              >
                <Text className="text-white font-medium text-center">Cancel</Text>
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
            
            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-sm text-gray-600">Show private finds</Text>
              <Pressable
                onPress={() => setMapFilter({ showPrivate: !mapFilter.showPrivate })}
                className={cn(
                  "w-12 h-6 rounded-full p-1",
                  mapFilter.showPrivate ? "bg-green-500" : "bg-gray-200"
                )}
              >
                <View
                  className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform",
                    mapFilter.showPrivate ? "translate-x-6" : "translate-x-0"
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
              In Season Now ({seasonalSuggestions.length})
            </Text>
            <ScrollView className="max-h-64">
              {seasonalSuggestions.map((suggestion, index) => (
                <View key={index} className="mb-3 last:mb-0">
                  <Text className="font-medium text-gray-900">{suggestion.name}</Text>
                  <Text className="text-sm text-gray-600 capitalize">
                    {suggestion.category}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {suggestion.description}
                  </Text>
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
      </View>
    </SafeAreaView>
  );
}