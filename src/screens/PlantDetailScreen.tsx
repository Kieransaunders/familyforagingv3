import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForagingStore } from '../state/foraging-store';
import { MonthFlags, Plant } from '../types/plant';

interface PlantDetailScreenProps {
  navigation: any;
  route: any;
}

export default function PlantDetailScreen({ navigation, route }: PlantDetailScreenProps) {
  const { plantId } = route.params;
  const { plants, updatePlant, deletePlant } = useForagingStore();
  const plant = useMemo(() => plants.find(p => p.id === plantId), [plants, plantId]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['identification']);
  const [isEditing, setIsEditing] = useState(false);
  const monthKeys = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
  const [months, setMonths] = useState<MonthFlags>({
    jan: false, feb: false, mar: false, apr: false, may: false, jun: false,
    jul: false, aug: false, sep: false, oct: false, nov: false, dec: false,
  });
  const [images, setImages] = useState<string[]>([]);

  React.useEffect(() => {
    if (plant) {
      setMonths(plant.inSeason || months);
      setImages(plant.images || []);
    }
  }, [plant?.id]);

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
          category: plant.category === 'berries' ? 'berry' : 
                   plant.category === 'leaves' ? 'herb' :
                   plant.category === 'nuts' ? 'nut' :
                   plant.category === 'mushrooms' ? 'fungi' :
                   plant.category === 'flowers' ? 'plant' :
                   plant.category === 'roots' ? 'herb' : 'plant',
          notes: `Identified as ${plant.name} (${plant.latinName}) from Plant Database`
        }
      }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deletePlant(plant.id);
            Alert.alert('Success', 'Plant deleted successfully', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
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
            onPress={() => {
              // Navigate to recipes tab and search for this plant
              const { setSearchQuery } = useForagingStore.getState();
              setSearchQuery(plant.name);
              const tabNavigation = navigation.getParent();
              tabNavigation?.navigate('Recipes');
            }}
            className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="restaurant" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Recipes</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsEditing(!isEditing)}
            className="w-12 bg-gray-800 rounded-xl items-center justify-center"
          >
            <Ionicons name={isEditing ? 'close' : 'create'} size={20} color="white" />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="w-12 bg-red-500 rounded-xl items-center justify-center"
          >
            <Ionicons name="trash" size={20} color="white" />
          </Pressable>
        </View>

        {/* Edit Panel */}
        {isEditing && (
          <View className="px-4">
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-3">In Season Months</Text>
              <View className="flex-row flex-wrap gap-2">
                {(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const).map((label, idx) => {
                  const key = monthKeys[idx];
                  const active = (months as any)[key];
                  return (
                    <Pressable
                      key={label}
                      onPress={() => setMonths({ ...months, [key]: !active } as MonthFlags)}
                      className={active ? 'px-3 py-2 rounded-full bg-green-500' : 'px-3 py-2 rounded-full bg-gray-100'}
                    >
                      <Text className={active ? 'text-white font-medium' : 'text-gray-700 font-medium'}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="flex-row flex-wrap gap-2 mt-3">
                {[{label:'Spring', months:[2,3,4]},{label:'Summer', months:[5,6,7]},{label:'Autumn', months:[8,9,10]},{label:'Winter', months:[11,0,1]}].map((preset) => (
                  <Pressable
                    key={preset.label}
                    onPress={() => {
                      const next: any = { ...months };
                      preset.months.forEach(m=>{ next[monthKeys[m]] = true; });
                      setMonths(next as MonthFlags);
                    }}
                    className="px-3 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-700 font-medium">{preset.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                {images.map((uri, idx) => (
                  <View key={idx} className="mx-1 items-center">
                    <Image source={{ uri }} className="w-24 h-24 rounded-lg" resizeMode="cover" />
                    <View className="flex-row mt-2 gap-2">
                      <Pressable onPress={() => setImages(images.filter((_,i)=>i!==idx))} className="px-2 py-1 rounded bg-red-100">
                        <Text className="text-red-700 text-xs">Remove</Text>
                      </Pressable>
                      <Pressable onPress={() => updatePlant(plant.id, { heroImage: uri })} className="px-2 py-1 rounded bg-blue-100">
                        <Text className="text-blue-700 text-xs">Make cover</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
                <Pressable
                  onPress={async () => {
                    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                    if (!res.canceled && res.assets?.[0]?.uri) {
                      setImages([...images, res.assets[0].uri]);
                    }
                  }}
                  className="w-24 h-24 rounded-lg bg-gray-100 items-center justify-center ml-2"
                >
                  <Ionicons name="add" size={24} color="#6b7280" />
                </Pressable>
              </ScrollView>
            </View>

            <View className="flex-row gap-3 mb-4">
              <Pressable
                onPress={() => {
                  updatePlant(plant.id, { inSeason: months, images });
                  setIsEditing(false);
                }}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Save Changes</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMonths(plant.inSeason || months);
                  setImages(plant.images || []);
                  setIsEditing(false);
                }}
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

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