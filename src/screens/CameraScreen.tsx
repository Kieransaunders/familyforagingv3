import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, CameraViewRef } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

interface CameraScreenProps {
  navigation: any;
  route: any;
}

export default function CameraScreen({ navigation, route }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraViewRef>(null);

  const { onPhotoTaken } = route.params || {};

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center px-4">
        <Ionicons name="camera-outline" size={48} color="white" />
        <Text className="text-white text-lg font-semibold mt-4 text-center">
          Camera access is required to take photos of your finds
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-green-500 px-6 py-3 rounded-lg mt-4"
        >
          <Text className="text-white font-semibold">Grant Camera Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          // Save to media library
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          
          // Pass photo back to parent screen
          if (onPhotoTaken) {
            onPhotoTaken(photo.uri);
          }
          
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={flash}
      />
      
      {/* Overlay UI */}
      <View className="absolute top-0 left-0 right-0 bottom-0 z-10">
        {/* Top Controls */}
        <SafeAreaView>
          <View className="flex-row justify-between items-center px-4 py-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-black bg-opacity-50 rounded-full p-2"
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            
            <Pressable
              onPress={toggleFlash}
              className="bg-black bg-opacity-50 rounded-full p-2"
            >
              <Ionicons 
                name={flash ? "flash" : "flash-off"} 
                size={24} 
                color="white" 
              />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0">
          <SafeAreaView>
            <View className="flex-row justify-center items-center px-4 py-6">
              <View className="flex-1" />
              
              {/* Capture Button */}
              <Pressable
                onPress={takePicture}
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 justify-center items-center"
              >
                <View className="w-16 h-16 bg-white rounded-full" />
              </Pressable>
              
              {/* Flip Camera Button */}
              <View className="flex-1 items-end">
                <Pressable
                  onPress={toggleCameraFacing}
                  className="bg-black bg-opacity-50 rounded-full p-3"
                >
                  <Ionicons name="camera-reverse" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Center Focus Indicator */}
        <View className="absolute top-1/2 left-1/2 transform -translate-x-6 -translate-y-6">
          <View className="w-12 h-12 border-2 border-white border-opacity-50 rounded-full" />
        </View>
      </View>
    </View>
  );
}