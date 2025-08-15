import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";

interface AppModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClose?: () => void;
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  type?: "info" | "success" | "error";
}

export default function AppModal({
  visible,
  title,
  message,
  icon = "information-circle-outline",
  onClose,
  primaryAction,
  secondaryAction,
  type = "info",
}: AppModalProps) {
  if (!visible) return null;

  const colorByType = {
    info: {
      icon: "#3b82f6",
      bar: "bg-blue-100 border-blue-200",
      title: "text-blue-800",
      text: "text-blue-700",
    },
    success: {
      icon: "#22c55e",
      bar: "bg-green-100 border-green-200",
      title: "text-green-800",
      text: "text-green-700",
    },
    error: {
      icon: "#ef4444",
      bar: "bg-red-100 border-red-200",
      title: "text-red-800",
      text: "text-red-700",
    },
  } as const;

  const c = colorByType[type];

  return (
    <View className="absolute inset-0 z-50 bg-black/40">
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <View className="w-full bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
          <View className={cn("w-full rounded-xl p-3 mb-3 border", c.bar)}>
            <View className="flex-row items-center">
              <Ionicons name={icon} size={22} color={c.icon} />
              {title ? (
                <Text className={cn("ml-2 font-semibold", c.title)}>{title}</Text>
              ) : null}
            </View>
          </View>

          {message ? (
            <Text className={cn("text-sm", c.text)}>
              {message}
            </Text>
          ) : null}

          <View className="flex-row justify-end mt-5 gap-3">
            {secondaryAction ? (
              <Pressable
                onPress={secondaryAction.onPress}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                <Text className="text-gray-800 font-medium">{secondaryAction.label}</Text>
              </Pressable>
            ) : null}
            {primaryAction ? (
              <Pressable
                onPress={primaryAction.onPress}
                className="px-4 py-2 rounded-lg bg-green-500"
              >
                <Text className="text-white font-semibold">{primaryAction.label}</Text>
              </Pressable>
            ) : null}
            {!primaryAction && onClose ? (
              <Pressable onPress={onClose} className="px-4 py-2 rounded-lg bg-green-500">
                <Text className="text-white font-semibold">OK</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
