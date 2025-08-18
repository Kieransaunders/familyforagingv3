import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';

interface OfflineBannerProps {
  isVisible: boolean;
  lastOnlineTime?: Date | null;
  onRetry: () => void;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isVisible,
  lastOnlineTime,
  onRetry,
}) => {
  if (!isVisible) return null;

  const formatLastOnline = (time: Date | null) => {
    if (!time) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <View className="absolute top-0 left-0 right-0 z-50 bg-orange-100 border-b border-orange-200">
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center flex-1">
          <Ionicons name="cloud-offline-outline" size={20} color="#ea580c" />
          <View className="ml-2 flex-1">
            <Text className="text-orange-800 font-medium text-sm">
              Offline — showing cached map
            </Text>
            <Text className="text-orange-700 text-xs">
              Last updated: {formatLastOnline(lastOnlineTime)}
            </Text>
          </View>
        </View>
        
        <Pressable
          onPress={onRetry}
          className="bg-orange-500 px-3 py-1.5 rounded-md ml-2"
        >
          <Text className="text-white text-sm font-medium">Retry</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OfflineBanner;