import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface IconInputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

const IconInput: React.FC<IconInputProps> = ({
  icon,
  error,
  isPassword = false,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-3">
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 border border-gray-200">
        <Ionicons name={icon} size={20} color="#9CA3AF" />
        <TextInput
          {...textInputProps}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={
            textInputProps.placeholderTextColor || "#9CA3AF"
          }
          className={`flex-1 ml-3 text-gray-900 text-sm ${textInputProps.className || ""}`}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1 ml-4">{error}</Text>}
    </View>
  );
};

export default IconInput;
