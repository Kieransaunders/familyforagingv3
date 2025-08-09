import React from 'react';
import { View, Text, Image } from 'react-native';

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  return (
    <View className={`bg-white border-t border-gray-200 px-4 py-3 ${className}`}>
      <View className="flex-row items-center justify-center">
        <Image 
          source={require('../../assets/images/icon.png')} 
          className="w-8 h-8 mr-3"
          resizeMode="contain"
        />
        <View className="items-center">
          <Text className="text-lg font-semibold text-gray-800">
            Family Foraging
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            by David Hamilton
          </Text>
        </View>
      </View>
    </View>
  );
}