import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  value: number | string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor,
  iconBgColor,
  value,
  label,
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm" style={{ width: 140 }}>
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-gray-500 text-xs">{label}</Text>
    </View>
  );
};

export default StatCard;
