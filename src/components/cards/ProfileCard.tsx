import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { UserProfile } from '../../firebase/auth';

interface ProfileCardProps {
    profile: UserProfile;
    onPress?: () => void;
    onEdit?: () => void;
    showEditButton?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    profile,
    onPress,
    onEdit,
    showEditButton = false,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
            className="bg-white rounded-2xl shadow-lg p-6"
        >
            <View className="items-center">
                {/* Profile Image */}
                <View className="relative">
                    {profile.profileImage ? (
                        <Image
                            source={{ uri: profile.profileImage }}
                            className="w-24 h-24 rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                            <Text className="text-white text-4xl font-bold">
                                {profile.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    {profile.isProvider && (
                        <View className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                            <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                    )}
                </View>

                {/* Name */}
                <Text className="text-gray-900 text-2xl font-bold mt-4">
                    {profile.name}
                </Text>

                {profile.isProvider && (
                    <View className="bg-primary px-3 py-1 rounded-full mt-2">
                        <Text className="text-white text-xs font-semibold">Service Provider</Text>
                    </View>
                )}

                {/* Email */}
                <View className="flex-row items-center mt-4">
                    <Ionicons name="mail-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">{profile.email}</Text>
                </View>

                {/* Phone */}
                {profile.phone && (
                    <View className="flex-row items-center mt-2">
                        <Ionicons name="call-outline" size={16} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-2">{profile.phone}</Text>
                    </View>
                )}

                {/* Address */}
                {profile.address && (
                    <View className="flex-row items-center mt-2">
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <Text className="text-gray-600 text-sm ml-2" numberOfLines={2}>
                            {profile.address}
                        </Text>
                    </View>
                )}

                {/* Edit Button */}
                {showEditButton && onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        className="bg-primary px-6 py-3 rounded-xl mt-6 flex-row items-center"
                    >
                        <Ionicons name="pencil" size={16} color="white" />
                        <Text className="text-white text-sm font-semibold ml-2">
                            Edit Profile
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProfileCard;
