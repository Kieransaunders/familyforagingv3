import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';

interface DynamicListProps {
  title: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder: string;
  numbered?: boolean;
  minItems?: number;
  maxItems?: number;
  emptyMessage?: string;
  addButtonText?: string;
}

export default function DynamicList({
  title,
  items,
  onItemsChange,
  placeholder,
  numbered = false,
  minItems = 0,
  maxItems = 20,
  emptyMessage = "No items added yet",
  addButtonText = "Add Item"
}: DynamicListProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const trimmedItem = newItem.trim();
    if (!trimmedItem) {
      Alert.alert('Error', 'Please enter some text before adding');
      return;
    }

    if (items.includes(trimmedItem)) {
      Alert.alert('Duplicate', 'This item has already been added');
      return;
    }

    if (items.length >= maxItems) {
      Alert.alert('Limit Reached', `You can only add up to ${maxItems} items`);
      return;
    }

    onItemsChange([...items, trimmedItem]);
    setNewItem('');
  };

  const removeItem = (index: number) => {
    if (items.length <= minItems) {
      Alert.alert('Cannot Remove', `You must have at least ${minItems} item${minItems !== 1 ? 's' : ''}`);
      return;
    }
    
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const updateItem = (index: number, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = value;
    onItemsChange(updatedItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    
    const updatedItems = [...items];
    const [removed] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, removed);
    onItemsChange(updatedItems);
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">{title}</Text>
      
      {/* Existing Items */}
      {items.length > 0 ? (
        <View className="space-y-2 mb-4">
          {items.map((item, index) => (
            <View key={index} className="bg-gray-50 rounded-xl p-3 flex-row items-center">
              {numbered && (
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-semibold text-sm">{index + 1}</Text>
                </View>
              )}
              
              <TextInput
                value={item}
                onChangeText={(value) => updateItem(index, value)}
                className="flex-1 text-gray-900 mr-3"
                multiline
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
              />
              
              <View className="flex-row items-center space-x-2">
                {/* Move Up */}
                {index > 0 && (
                  <Pressable
                    onPress={() => moveItem(index, index - 1)}
                    className="p-1"
                  >
                    <Ionicons name="chevron-up" size={20} color="#6b7280" />
                  </Pressable>
                )}
                
                {/* Move Down */}
                {index < items.length - 1 && (
                  <Pressable
                    onPress={() => moveItem(index, index + 1)}
                    className="p-1"
                  >
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </Pressable>
                )}
                
                {/* Remove */}
                <Pressable
                  onPress={() => removeItem(index)}
                  className="p-1"
                  disabled={items.length <= minItems}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color={items.length <= minItems ? "#d1d5db" : "#ef4444"} 
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="bg-gray-50 rounded-xl p-6 items-center mb-4">
          <Ionicons name="list-outline" size={32} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center">{emptyMessage}</Text>
        </View>
      )}

      {/* Add New Item */}
      {items.length < maxItems && (
        <View>
          <View className="flex-row space-x-3 mb-2">
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              className="flex-1 bg-white rounded-xl px-4 py-3 text-gray-900 shadow-sm"
              multiline
              onSubmitEditing={addItem}
              returnKeyType="done"
            />
            <Pressable
              onPress={addItem}
              className="bg-green-500 rounded-xl px-4 py-3 items-center justify-center"
            >
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>
          
          <Pressable
            onPress={addItem}
            className="bg-green-100 border border-green-300 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle" size={20} color="#22c55e" />
            <Text className="text-green-700 font-medium ml-2">{addButtonText}</Text>
          </Pressable>
        </View>
      )}

      {/* Item Count */}
      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-sm text-gray-500">
          {items.length} of {maxItems} items
        </Text>
        {minItems > 0 && (
          <Text className="text-sm text-gray-500">
            Minimum: {minItems} item{minItems !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}