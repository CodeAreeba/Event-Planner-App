import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import FormInput from '../../components/common/FormInput';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { generateImagePath, uploadImage } from '../../firebase/upload';
import { updateUser } from '../../services/userService';
import { UserProfile } from '../../types/user';

const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { userProfile, refreshUserProfile } = useAuth();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        phone: '',
    });

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name);
            setPhone(userProfile.phone || '');
            setAddress(userProfile.address || '');
            setImageUri(userProfile.photoURL || null);
        }
    }, [userProfile]);

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: '',
            phone: '',
        };

        let isValid = true;

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
            newErrors.phone = 'Please enter a valid phone number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !userProfile) return;

        setLoading(true);
        let photoURL = userProfile.photoURL;

        // Upload image if changed and it's a local URI
        if (imageUri && imageUri !== userProfile.photoURL && !imageUri.startsWith('http')) {
            setUploading(true);
            const path = generateImagePath(userProfile.uid, 'profiles');
            const { success, url, error } = await uploadImage(imageUri, path);

            if (success && url) {
                photoURL = url;
            } else {
                Alert.alert('Upload Failed', error || 'Failed to upload profile image');
                setLoading(false);
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        const updates: Partial<UserProfile> = {
            name,
            phone: phone || undefined,
            address: address || undefined,
            photoURL: photoURL || undefined,
        };

        const { success, error } = await updateUser(userProfile.uid, updates);

        if (success) {
            await refreshUserProfile();
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', error || 'Failed to update profile');
        }
        setLoading(false);
    };

    if (!userProfile) {
        return <LoadingState message="Loading profile..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
                {/* Header */}
                <View className="py-6">
                    <Text className="text-2xl font-bold text-gray-900">Edit Profile</Text>
                    <Text className="text-gray-500 mt-1">Update your personal information</Text>
                </View>

                {/* Image Picker */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={60} color="#9CA3AF" />
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-white shadow-sm">
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-primary font-semibold mt-3" onPress={pickImage}>
                        Change Photo
                    </Text>
                </View>

                {/* Form Fields */}
                <View className="gap-y-4">
                    <FormInput
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        icon="person-outline"
                        error={errors.name}
                        required
                    />

                    <View>
                        <Text className="text-gray-700 text-sm font-semibold mb-2">
                            Email <Text className="text-gray-400">(Read-only)</Text>
                        </Text>
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                            <Text className="flex-1 text-gray-500 text-sm">{userProfile.email}</Text>
                        </View>
                    </View>

                    <FormInput
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        icon="call-outline"
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />

                    <FormInput
                        label="Address"
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Enter your address"
                        icon="location-outline"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Action Buttons */}
                <View className="py-8 gap-y-3">
                    <PrimaryButton
                        title={uploading ? "Uploading Image..." : "Save Changes"}
                        onPress={handleSubmit}
                        loading={loading}
                    />
                    <SecondaryButton
                        title="Cancel"
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;
