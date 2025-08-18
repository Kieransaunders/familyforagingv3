import React from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';

// Screens
import MapScreen from '../screens/MapScreen';
import LogFindScreen from '../screens/LogFindScreen';
import RecipeScreen from '../screens/RecipeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeImportScreen from '../screens/RecipeImportScreen';
import RecipeCreateScreen from '../screens/RecipeCreateScreen';
import FindDetailScreen from '../screens/FindDetailScreen';
import CameraScreen from '../screens/CameraScreen';
import MyFindsScreen from '../screens/MyFindsScreen';
import PlantDatabaseScreen from '../screens/PlantDatabaseScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import PlantCategoryScreen from '../screens/PlantCategoryScreen';
import PlantImportScreen from '../screens/PlantImportScreen';
import PlantCreateScreen from '../screens/PlantCreateScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MapMain" 
        component={MapScreen} 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="FindDetail" 
        component={FindDetailScreen} 
        options={{ 
          title: 'Find Details',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="LogFind" 
        component={LogFindScreen} 
        options={({ navigation }) => ({ 
          title: 'Log Find',
          presentation: 'modal',
          headerRight: () => (
            <Pressable
              onPress={() => navigation.setParams({ manualMode: true })}
              style={{
                backgroundColor: '#f3f4f6',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ 
                color: '#374151', 
                fontSize: 12, 
                fontWeight: '600' 
              }}>
                Manual
              </Text>
            </Pressable>
          ),
        })} 
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ 
          title: 'Take Photo',
          presentation: 'fullScreenModal',
          headerShown: false,
        }} 
      />
    </Stack.Navigator>
  );
}



function RecipeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RecipeMain" 
        component={RecipeScreen} 
        options={({ navigation }) => ({ 
          headerShown: false,
        })} 
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen} 
        options={{ 
          title: 'Recipe',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="RecipeImport" 
        component={RecipeImportScreen} 
        options={{ 
          title: 'Import Recipes',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="RecipeCreate" 
        component={RecipeCreateScreen} 
        options={{ 
          title: 'Create Recipe',
          presentation: 'modal',
          headerShown: false,
        }} 
      />
    </Stack.Navigator>
  );
}

function MyFindsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyFindsMain" 
        component={MyFindsScreen} 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="FindDetail" 
        component={FindDetailScreen} 
        options={{ 
          title: 'Find Details',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="LogFind" 
        component={LogFindScreen} 
        options={({ route }) => ({ 
          title: ((route.params as any)?.editFind || (route.params as any)?.editFindId) ? 'Edit Find' : 'Log Find',
          presentation: 'modal',
        })} 
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ 
          title: 'Take Photo',
          presentation: 'fullScreenModal',
          headerShown: false,
        }} 
      />
    </Stack.Navigator>
  );
}

function PlantStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PlantDatabaseMain" 
        component={PlantDatabaseScreen} 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="PlantCategory" 
        component={PlantCategoryScreen} 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="PlantDetail" 
        component={PlantDetailScreen} 
        options={{ 
          title: 'Plant Details',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="PlantImport" 
        component={PlantImportScreen} 
        options={{ 
          title: 'Import Plants',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="PlantCreate" 
        component={PlantCreateScreen} 
        options={{ 
          title: 'Add Plant',
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ 
          title: 'Take Photo',
          presentation: 'fullScreenModal',
          headerShown: false,
        }} 
      />
    </Stack.Navigator>
  );
}

function TabNavigatorWithHeader() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Recipes') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'My Finds') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'Plants') {
              iconName = focused ? 'library' : 'library-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
            backgroundColor: 'white',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarItemStyle: {
            borderRadius: 20,
            marginHorizontal: 8,
            marginVertical: 4,
          },
        })}
      >
        <Tab.Screen name="My Finds" component={MyFindsStack} />
        <Tab.Screen name="Map" component={MapStack} />
        <Tab.Screen name="Recipes" component={RecipeStack} />
        <Tab.Screen name="Plants" component={PlantStack} />
      </Tab.Navigator>
      <AppHeader />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavigatorWithHeader />
    </NavigationContainer>
  );
}
