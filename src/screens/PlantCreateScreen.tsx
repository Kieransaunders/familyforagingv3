import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Image, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useForagingStore } from '../state/foraging-store';
import { Plant, PlantCategory, MonthFlags } from '../types/plant';
import DynamicList from '../components/DynamicList';
import { cn } from '../utils/cn';
import { v4 as uuidv4 } from 'uuid';

interface PlantCreateScreenProps {
  navigation: any;
  route: any;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: 'information-circle' },
  { id: 2, title: 'Identification', icon: 'search' },
  { id: 3, title: 'Edibility', icon: 'restaurant' },
  { id: 4, title: 'Uses & Ethics', icon: 'leaf' },
  { id: 5, title: 'Seasons', icon: 'calendar' },
];

const CATEGORIES: PlantCategory[] = ['berries', 'leaves', 'nuts', 'mushrooms', 'flowers', 'roots'];
const CONSERVATION_STATUS = ['common', 'uncommon', 'rare', 'protected'] as const;

export default function PlantCreateScreen({ navigation, route }: PlantCreateScreenProps) {
  const editPlant = route?.params?.editPlant as Plant | undefined;
  const isEditing = !!editPlant;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Smart category detection based on plant name
  const detectCategory = (plantName: string): PlantCategory => {
    const name = plantName.toLowerCase();
    if (name.includes('berry') || name.includes('berries')) return 'berries';
    if (name.includes('mushroom') || name.includes('fungi')) return 'mushrooms';
    if (name.includes('nut') || name.includes('nuts')) return 'nuts';
    if (name.includes('flower') || name.includes('blossom')) return 'flowers';
    if (name.includes('root') || name.includes('bulb')) return 'roots';
    return 'leaves'; // default
  };

  // Form state
  const [name, setName] = useState('');
  const [latinName, setLatinName] = useState('');
  const [family, setFamily] = useState('');
  const [category, setCategory] = useState<PlantCategory>('leaves');
  const [heroImage, setHeroImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [conservationStatus, setConservationStatus] = useState<typeof CONSERVATION_STATUS[number]>('common');
  const [categoryAutoSelected, setCategoryAutoSelected] = useState(true); // Track if category was auto-selected
  
  // Auto-update category based on plant name (only if not manually set)
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (categoryAutoSelected && !isEditing) {
      const detectedCategory = detectCategory(newName);
      setCategory(detectedCategory);
    }
  };

  // When user manually selects category, disable auto-selection
  const handleCategoryChange = (newCategory: PlantCategory) => {
    setCategory(newCategory);
    setCategoryAutoSelected(false);
  };
  
  // Identification
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [habitat, setHabitat] = useState<string[]>([]);
  const [season, setSeason] = useState<string[]>([]);
  const [lookAlikes, setLookAlikes] = useState<string[]>([]);
  const [size, setSize] = useState('');
  
  // Edibility
  const [safe, setSafe] = useState(false);
  const [preparation, setPreparation] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [toxicParts, setToxicParts] = useState<string[]>([]);
  
  // Uses
  const [culinary, setCulinary] = useState<string[]>([]);
  const [medicinal, setMedicinal] = useState<string[]>([]);
  const [traditional, setTraditional] = useState<string[]>([]);
  
  // Ethics and extras
  const [ethics, setEthics] = useState<string[]>([]);
  const [funFacts, setFunFacts] = useState('');
  
  // Seasonal availability
  const [inSeason, setInSeason] = useState<MonthFlags>({
    jan: false, feb: false, mar: false, apr: false, may: false, jun: false,
    jul: false, aug: false, sep: false, oct: false, nov: false, dec: false,
  });

  const { addPlant, updatePlant } = useForagingStore();

  // Initialize form with edit data
  useEffect(() => {
    if (editPlant) {
      setName(editPlant.name);
      setLatinName(editPlant.latinName);
      setFamily(editPlant.family);
      setCategory(editPlant.category);
      setHeroImage(editPlant.heroImage);
      setImages(editPlant.images || []);
      setConservationStatus(editPlant.conservationStatus || 'common');
      
      setKeyFeatures(editPlant.identification.keyFeatures);
      setHabitat(editPlant.identification.habitat);
      setSeason(editPlant.identification.season);
      setLookAlikes(editPlant.identification.lookAlikes);
      setSize(editPlant.identification.size);
      
      setSafe(editPlant.edibility.safe);
      setPreparation(editPlant.edibility.preparation);
      setWarnings(editPlant.edibility.warnings || []);
      setToxicParts(editPlant.edibility.toxicParts || []);
      
      setCulinary(editPlant.uses.culinary);
      setMedicinal(editPlant.uses.medicinal);
      setTraditional(editPlant.uses.traditional);
      
      setEthics(editPlant.ethics);
      setFunFacts(editPlant.funFacts || '');
      setInSeason(editPlant.inSeason || inSeason);
    }
  }, [editPlant]);

  // Image handling functions
  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Select File'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              takePicture();
              break;
            case 2:
              pickFromLibrary();
              break;
            case 3:
              pickFile();
              break;
            default:
              break;
          }
        }
      );
    } else {
      // For Android, show a simple alert
      Alert.alert(
        'Select Image',
        'Choose how you want to add an image',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePicture },
          { text: 'Photo Library', onPress: pickFromLibrary },
          { text: 'File Browser', onPress: pickFile },
        ]
      );
    }
  };
  const takePicture = async () => {
    // Navigate to the CameraScreen (same as MyFinds uses)
    navigation.navigate('Camera', {
      onPhotoTaken: (photoUri: string) => {
        setHeroImage(photoUri);
      }
    });
  };

  const pickFromLibrary = async () => {
    try {
      // Request media library permissions
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is needed to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setHeroImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking from library:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        // Validate that it's actually an image file
        const uri = result.assets[0].uri;
        const fileName = result.assets[0].name?.toLowerCase() || '';
        
        if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          setHeroImage(uri);
        } else {
          Alert.alert('Invalid File', 'Please select a valid image file (JPG, PNG, GIF, or WebP).');
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return name.trim().length > 0; // Only name is required
      case 2:
      case 3:
      case 4:
      case 5:
        return true; // All other steps are optional
      default:
        return false;
    }
  };

  const getStepErrors = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!name.trim()) errors.push('Plant name is required');
        break;
      case 2:
      case 3:
      case 4:
      case 5:
        // All other steps are optional
        break;
    }
    
    return errors;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      const errors = getStepErrors(currentStep);
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleMonth = (month: keyof MonthFlags) => {
    setInSeason(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  const savePlant = async () => {
    // Final validation - only name is required
    if (!validateStep(1)) {
      Alert.alert('Validation Error', 'Plant name is required');
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);

    try {
      let createdPlantId: string | null = null;
      if (isEditing && editPlant) {
        // Update existing plant
        const updatedPlant: Plant = {
          ...editPlant,
          name: name.trim(),
          latinName: latinName.trim() || 'Unknown',
          family: family.trim() || 'Unknown',
          category,
          heroImage: heroImage || 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Plant',
          images,
          conservationStatus,
          identification: {
            keyFeatures: keyFeatures.filter(f => f.trim()).length > 0 ? keyFeatures.filter(f => f.trim()) : ['No key features specified'],
            habitat: habitat.filter(h => h.trim()).length > 0 ? habitat.filter(h => h.trim()) : ['Habitat not specified'],
            season: season.filter(s => s.trim()),
            lookAlikes: lookAlikes.filter(l => l.trim()),
            size: size.trim() || 'Size not specified',
          },
          edibility: {
            safe,
            preparation: preparation.filter(p => p.trim()).length > 0 ? preparation.filter(p => p.trim()) : ['Preparation method not specified'],
            warnings: warnings.filter(w => w.trim()),
            toxicParts: toxicParts.filter(t => t.trim()),
          },
          uses: {
            culinary: culinary.filter(c => c.trim()),
            medicinal: medicinal.filter(m => m.trim()),
            traditional: traditional.filter(t => t.trim()),
            recipes: editPlant.uses.recipes || [],
          },
          ethics: ethics.filter(e => e.trim()).length > 0 ? ethics.filter(e => e.trim()) : ['Foraging ethics not specified'],
          funFacts: funFacts.trim() || undefined,
          inSeason,
        };

        updatePlant(editPlant.id, updatedPlant);
      } else {
        // Create new plant
        const newPlantId = uuidv4();
        const newPlant: Plant = {
          id: newPlantId,
          name: name.trim(),
          latinName: latinName.trim() || 'Unknown',
          family: family.trim() || 'Unknown',
          category,
          heroImage: heroImage || 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Plant',
          images,
          conservationStatus,
          identification: {
            keyFeatures: keyFeatures.filter(f => f.trim()).length > 0 ? keyFeatures.filter(f => f.trim()) : ['No key features specified'],
            habitat: habitat.filter(h => h.trim()).length > 0 ? habitat.filter(h => h.trim()) : ['Habitat not specified'],
            season: season.filter(s => s.trim()),
            lookAlikes: lookAlikes.filter(l => l.trim()),
            size: size.trim() || 'Size not specified',
          },
          edibility: {
            safe,
            preparation: preparation.filter(p => p.trim()).length > 0 ? preparation.filter(p => p.trim()) : ['Preparation method not specified'],
            warnings: warnings.filter(w => w.trim()),
            toxicParts: toxicParts.filter(t => t.trim()),
          },
          uses: {
            culinary: culinary.filter(c => c.trim()),
            medicinal: medicinal.filter(m => m.trim()),
            traditional: traditional.filter(t => t.trim()),
            recipes: [],
          },
          ethics: ethics.filter(e => e.trim()).length > 0 ? ethics.filter(e => e.trim()) : ['Foraging ethics not specified'],
          funFacts: funFacts.trim() || undefined,
          inSeason,
        };

        addPlant(newPlant);
        createdPlantId = newPlantId;
      }

      const plantName = name.trim();
      const alertTitle = isEditing ? 'Plant Updated!' : 'Plant Added!';
      const alertMessage = isEditing 
        ? `"${plantName}" has been updated successfully.`
        : `"${plantName}" has been added to your plant database.`;
      
      const buttons = isEditing 
        ? [
            {
              text: 'View Plant',
              onPress: () => {
                const updatedPlant = { ...editPlant!, name: plantName };
                navigation.replace('PlantDetail', { plantId: updatedPlant.id });
              }
            },
            {
              text: 'Done',
              style: 'default' as const,
              onPress: () => navigation.goBack()
            }
          ]
        : [
            {
              text: 'View Plant',
              onPress: () => {
                if (createdPlantId) {
                  navigation.replace('PlantDetail', { plantId: createdPlantId });
                } else {
                  navigation.goBack();
                }
              }
            },
            {
              text: 'Add Another',
              onPress: () => {
                // Reset form
                setCurrentStep(1);
                setName('');
                setLatinName('');
                setFamily('');
                setCategory('leaves');
                setHeroImage('https://via.placeholder.com/400x300');
                setImages([]);
                setConservationStatus('common');
                setKeyFeatures([]);
                setHabitat([]);
                setSeason([]);
                setLookAlikes([]);
                setSize('');
                setSafe(false);
                setPreparation([]);
                setWarnings([]);
                setToxicParts([]);
                setCulinary([]);
                setMedicinal([]);
                setTraditional([]);
                setEthics([]);
                setFunFacts('');
                setInSeason({
                  jan: false, feb: false, mar: false, apr: false, may: false, jun: false,
                  jul: false, aug: false, sep: false, oct: false, nov: false, dec: false,
                });
              }
            },
            {
              text: 'Done',
              style: 'default' as const,
              onPress: () => navigation.goBack()
            }
          ];

      Alert.alert(alertTitle, alertMessage, buttons);

    } catch (error) {
      Alert.alert('Error', 'Failed to save plant. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Basic Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Plant Name *</Text>
              <TextInput
                value={name}
                onChangeText={handleNameChange}
                placeholder="e.g., Wild Garlic"
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Latin Name</Text>
              <TextInput
                value={latinName}
                onChangeText={setLatinName}
                placeholder="e.g., Allium ursinum (optional)"
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Family</Text>
              <TextInput
                value={family}
                onChangeText={setFamily}
                placeholder="e.g., Amaryllidaceae (optional)"
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => handleCategoryChange(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full border",
                      category === cat
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-200"
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

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Plant Image</Text>
              
              {/* Image Preview */}
              {heroImage && (
                <View className="mb-3 relative">
                  <Image
                    source={{ uri: heroImage }}
                    style={{ width: '100%', height: 120, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => setHeroImage('')}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}
                  >
                    <Ionicons name="trash" size={14} color="white" />
                  </Pressable>
                </View>
              )}
              
              {/* Image Selection Button */}
              <Pressable
                onPress={showImageOptions}
                className="bg-purple-500 rounded-lg p-4 flex-row items-center justify-center mb-3"
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Add Plant Image</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Conservation Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {CONSERVATION_STATUS.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setConservationStatus(status)}
                    className={cn(
                      "px-3 py-2 rounded-full border",
                      conservationStatus === status
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <Text
                      className={cn(
                        "font-medium capitalize",
                        conservationStatus === status ? "text-white" : "text-gray-700"
                      )}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Identification</Text>
            
            <DynamicList
              title="Key Features"
              items={keyFeatures}
              onItemsChange={setKeyFeatures}
              placeholder="e.g., Strong garlic smell when crushed"
              minItems={1}
              maxItems={10}
              emptyMessage="Add key identifying features"
              addButtonText="Add Feature"
            />

            <DynamicList
              title="Habitat"
              items={habitat}
              onItemsChange={setHabitat}
              placeholder="e.g., Woodland floors, shaded areas"
              minItems={1}
              maxItems={8}
              emptyMessage="Add habitat information"
              addButtonText="Add Habitat"
            />

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Size Description</Text>
              <TextInput
                value={size}
                onChangeText={setSize}
                placeholder="e.g., Up to 50cm tall with 2-5cm wide leaves (optional)"
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <DynamicList
              title="Season"
              items={season}
              onItemsChange={setSeason}
              placeholder="e.g., Spring, Early Summer"
              maxItems={6}
              emptyMessage="Add seasonal availability"
              addButtonText="Add Season"
            />

            <DynamicList
              title="Look-alikes (Caution)"
              items={lookAlikes}
              onItemsChange={setLookAlikes}
              placeholder="e.g., Lily of the Valley (toxic)"
              maxItems={8}
              emptyMessage="Add plants that look similar"
              addButtonText="Add Look-alike"
            />
          </View>
        );

      case 3:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Edibility</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Safety</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setSafe(true)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl border",
                    safe
                      ? "bg-green-500 border-green-500"
                      : "bg-white border-gray-200"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium text-center",
                      safe ? "text-white" : "text-gray-700"
                    )}
                  >
                    Safe to Eat
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => setSafe(false)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl border",
                    !safe
                      ? "bg-red-500 border-red-500"
                      : "bg-white border-gray-200"
                  )}
                >
                  <Text
                    className={cn(
                      "font-medium text-center",
                      !safe ? "text-white" : "text-gray-700"
                    )}
                  >
                    Not Safe
                  </Text>
                </Pressable>
              </View>
            </View>

            <DynamicList
              title="Preparation Methods"
              items={preparation}
              onItemsChange={setPreparation}
              placeholder="e.g., Raw in salads, cooked like spinach"
              minItems={1}
              maxItems={10}
              emptyMessage="Add preparation methods"
              addButtonText="Add Preparation"
            />

            <DynamicList
              title="Warnings"
              items={warnings}
              onItemsChange={setWarnings}
              placeholder="e.g., May cause stomach upset in large quantities"
              maxItems={8}
              emptyMessage="Add safety warnings"
              addButtonText="Add Warning"
            />

            <DynamicList
              title="Toxic Parts"
              items={toxicParts}
              onItemsChange={setToxicParts}
              placeholder="e.g., Roots, Seeds"
              maxItems={6}
              emptyMessage="Add toxic parts if any"
              addButtonText="Add Toxic Part"
            />
          </View>
        );

      case 4:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Uses & Ethics</Text>
            
            <DynamicList
              title="Culinary Uses"
              items={culinary}
              onItemsChange={setCulinary}
              placeholder="e.g., Salads, pesto, soups"
              maxItems={10}
              emptyMessage="Add culinary uses"
              addButtonText="Add Culinary Use"
            />

            <DynamicList
              title="Medicinal Uses"
              items={medicinal}
              onItemsChange={setMedicinal}
              placeholder="e.g., Antiseptic properties, blood pressure"
              maxItems={8}
              emptyMessage="Add traditional medicinal uses"
              addButtonText="Add Medicinal Use"
            />

            <DynamicList
              title="Traditional Uses"
              items={traditional}
              onItemsChange={setTraditional}
              placeholder="e.g., Natural insect repellent"
              maxItems={8}
              emptyMessage="Add traditional non-culinary uses"
              addButtonText="Add Traditional Use"
            />

            <DynamicList
              title="Foraging Ethics"
              items={ethics}
              onItemsChange={setEthics}
              placeholder="e.g., Take only 1/3 of plants, avoid rare specimens"
              minItems={1}
              maxItems={8}
              emptyMessage="Add foraging ethics and guidelines"
              addButtonText="Add Ethic"
            />

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Fun Facts</Text>
              <TextInput
                value={funFacts}
                onChangeText={setFunFacts}
                placeholder="Add interesting facts about this plant..."
                className="bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 5:
        return (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-3">Seasonal Availability</Text>
            <Text className="text-gray-600 text-sm mb-4">Select the months when this plant is typically available for foraging</Text>
            
            <View className="flex-row flex-wrap gap-2">
              {(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                const monthLabels = {
                  jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
                  jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'
                };
                
                return (
                  <Pressable
                    key={month}
                    onPress={() => toggleMonth(month)}
                    className={cn(
                      'px-3 py-2 rounded-lg border flex-1 min-w-[70px] items-center',
                      inSeason[month]
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        inSeason[month]
                          ? 'text-white'
                          : 'text-gray-700'
                      )}
                    >
                      {monthLabels[month]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            
            <View className="flex-row flex-wrap gap-2 mt-4">
              {[
                {label:'Spring', months:['mar','apr','may'] as const},
                {label:'Summer', months:['jun','jul','aug'] as const},
                {label:'Autumn', months:['sep','oct','nov'] as const},
                {label:'Winter', months:['dec','jan','feb'] as const}
              ].map((preset) => (
                <Pressable
                  key={preset.label}
                  onPress={() => {
                    const next = { ...inSeason };
                    preset.months.forEach(m => { next[m] = true; });
                    setInSeason(next);
                  }}
                  className="px-3 py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-700 font-medium">{preset.label}</Text>
                </Pressable>
              ))}
              
              <Pressable
                onPress={() => setInSeason({
                  jan: false, feb: false, mar: false, apr: false, may: false, jun: false,
                  jul: false, aug: false, sep: false, oct: false, nov: false, dec: false,
                })}
                className="px-3 py-2 rounded-full bg-red-100"
              >
                <Text className="text-red-700 font-medium">Clear All</Text>
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Plant' : 'Add Plant'}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            {currentStep} of {STEPS.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <View key={step.id} className="flex-row items-center">
                <View
                  className={cn(
                    "w-8 h-8 rounded-full items-center justify-center",
                    currentStep >= step.id
                      ? "bg-green-500"
                      : "bg-gray-200"
                  )}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={currentStep >= step.id ? "white" : "#9ca3af"}
                  />
                </View>
                {index < STEPS.length - 1 && (
                  <View
                    className={cn(
                      "h-0.5 w-8 mx-1",
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </View>
            ))}
          </View>
          <Text className="text-sm text-gray-600 text-center">
            {STEPS[currentStep - 1]?.title}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {renderStep()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation */}
      <View className="bg-white p-4 border-t border-gray-200">
        <View className="flex-row space-x-3">
          {currentStep > 1 && (
            <Pressable
              onPress={prevStep}
              className="flex-1 bg-gray-200 py-3 px-6 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
              <Text className="text-gray-700 font-medium ml-1">Back</Text>
            </Pressable>
          )}
          
          {currentStep < STEPS.length ? (
            <Pressable
              onPress={nextStep}
              disabled={!validateStep(currentStep)}
              className={cn(
                "flex-1 py-3 px-6 rounded-xl flex-row items-center justify-center",
                validateStep(currentStep)
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
            >
              <Text className="text-white font-medium mr-1">Next</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          ) : (
            <Pressable
              onPress={savePlant}
              disabled={isSaving}
              className="flex-1 bg-green-500 py-3 px-6 rounded-xl flex-row items-center justify-center"
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {isEditing ? 'Update Plant' : 'Save Plant'}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
