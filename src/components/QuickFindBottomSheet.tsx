import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';

interface QuickFindBottomSheetProps {
  visible: boolean;
  location: { latitude: number; longitude: number };
  onSave: (data: { name: string; category: string; notes: string }) => void;
  onCancel: () => void;
}

const categories = [
  { id: 'plant', label: 'Plant', icon: 'leaf', color: '#22c55e' },
  { id: 'fungi', label: 'Fungi', icon: 'flower', color: '#f59e0b' },
  { id: 'berry', label: 'Berry', icon: 'nutrition', color: '#ef4444' },
  { id: 'nut', label: 'Nut', icon: 'ellipse', color: '#8b5cf6' },
  { id: 'herb', label: 'Herb', icon: 'medkit', color: '#06b6d4' },
  { id: 'other', label: 'Other', icon: 'help-circle', color: '#6b7280' },
];

export default function QuickFindBottomSheet({
  visible,
  location,
  onSave,
  onCancel,
}: QuickFindBottomSheetProps) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('plant');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        category: selectedCategory,
        notes: notes.trim(),
      });
      // Reset form
      setName('');
      setSelectedCategory('plant');
      setNotes('');
    }
  };

  const handleCancel = () => {
    onCancel();
    // Reset form
    setName('');
    setSelectedCategory('plant');
    setNotes('');
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop */}
      <Pressable 
        className="flex-1 bg-black/40" 
        onPress={handleCancel}
      />
      
      {/* Bottom Sheet */}
      <SafeAreaView className="bg-white">
        <View className="px-4 py-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-900">Add Find</Text>
              <Text className="text-sm text-gray-500">
                📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
            <Pressable
              onPress={handleCancel}
              className="p-2 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </Pressable>
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Wild Blackberry"
              className="border border-gray-200 rounded-lg px-3 py-3 text-gray-900 bg-white"
              autoFocus
              returnKeyType="next"
            />
          </View>

          {/* Category Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={cn(
                      'flex-row items-center px-3 py-2 rounded-full border',
                      selectedCategory === category.id
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={16}
                      color={
                        selectedCategory === category.id ? 'white' : category.color
                      }
                    />
                    <Text
                      className={cn(
                        'ml-2 text-sm font-medium',
                        selectedCategory === category.id
                          ? 'text-white'
                          : 'text-gray-700'
                      )}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Notes Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Quick notes about your find..."
              multiline
              numberOfLines={2}
              className="border border-gray-200 rounded-lg px-3 py-3 text-gray-900 bg-white"
              returnKeyType="done"
            />
          </View>

          {/* Hint Text */}
          <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="text-blue-800 text-sm text-center">
              💡 You can add photos, detailed notes, habitat info and harvest season on the next screen
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <Pressable
              onPress={handleCancel}
              className="flex-1 py-3 px-4 rounded-lg bg-gray-100 border border-gray-200"
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </Pressable>
            
            <Pressable
              onPress={handleSave}
              disabled={!name.trim()}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg',
                name.trim()
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              )}
            >
              <Text className={cn(
                'text-center font-semibold',
                name.trim() ? 'text-white' : 'text-gray-500'
              )}>
                Save & Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}