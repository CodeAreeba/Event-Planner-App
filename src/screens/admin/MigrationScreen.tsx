/**
 * Admin Migration Screen
 * Allows admins to run the migration script to generate slots for existing services
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AppStackNavigationProp } from '../../types/navigation';
import { migrateExistingServices } from '../../utils/migrationHelper';

const MigrationScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const { isAdmin } = useAuth();
    const [migrating, setMigrating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, serviceName: '' });
    const [result, setResult] = useState<any>(null);

    const handleMigration = async () => {
        Alert.alert(
            'Confirm Migration',
            'This will generate time slots for all existing services. This may take a few minutes. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Migration',
                    onPress: async () => {
                        setMigrating(true);
                        setResult(null);
                        setProgress({ current: 0, total: 0, serviceName: '' });

                        try {
                            const migrationResult = await migrateExistingServices(
                                (current, total, serviceName) => {
                                    setProgress({ current, total, serviceName });
                                }
                            );

                            setResult(migrationResult);
                            setMigrating(false);

                            if (migrationResult.success) {
                                Alert.alert(
                                    'Migration Complete!',
                                    `Successfully migrated ${migrationResult.successfulMigrations} services.`,
                                    [{ text: 'OK' }]
                                );
                            } else {
                                Alert.alert(
                                    'Migration Completed with Errors',
                                    `${migrationResult.successfulMigrations} succeeded, ${migrationResult.failedMigrations} failed.`,
                                    [{ text: 'OK' }]
                                );
                            }
                        } catch (error: any) {
                            setMigrating(false);
                            Alert.alert('Error', error.message || 'Migration failed');
                        }
                    },
                },
            ]
        );
    };

    if (!isAdmin) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Ionicons name="lock-closed" size={64} color="#EF4444" />
                <Text className="text-gray-900 text-xl font-bold mt-4">Access Denied</Text>
                <Text className="text-gray-600 text-sm mt-2">Admin access required</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary pt-4 pb-6 px-6">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Slot Migration</Text>
                </View>
                <Text className="text-white/80 text-sm">
                    Generate time slots for existing services
                </Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Info Card */}
                <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={24} color="#3B82F6" style={{ marginRight: 12 }} />
                        <View className="flex-1">
                            <Text className="text-blue-900 font-bold mb-2">About This Migration</Text>
                            <Text className="text-blue-700 text-sm leading-5">
                                This tool generates 30 days of time slots for all existing services in the database.
                                Each service will get slots based on its duration and global working hours (9 AM - 6 PM).
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Migration Button */}
                {!migrating && !result && (
                    <PrimaryButton
                        title="Start Migration"
                        onPress={handleMigration}
                        icon="flash"
                    />
                )}

                {/* Progress Indicator */}
                {migrating && (
                    <View className="bg-white rounded-2xl p-6 shadow-sm">
                        <View className="items-center mb-4">
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text className="text-gray-900 text-lg font-bold mt-4">
                                Migrating Services...
                            </Text>
                            <Text className="text-gray-600 text-sm mt-2">
                                {progress.current} of {progress.total}
                            </Text>
                        </View>

                        {progress.serviceName && (
                            <View className="bg-gray-50 rounded-xl p-4">
                                <Text className="text-gray-600 text-xs mb-1">Currently Processing:</Text>
                                <Text className="text-gray-900 font-semibold">{progress.serviceName}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Results */}
                {result && (
                    <View className="bg-white rounded-2xl p-6 shadow-sm">
                        <Text className="text-gray-900 text-xl font-bold mb-4">Migration Results</Text>

                        <View className="space-y-3">
                            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                <Text className="text-gray-600">Total Services</Text>
                                <Text className="text-gray-900 font-bold text-lg">{result.totalServices}</Text>
                            </View>

                            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                                <Text className="text-green-600">✅ Successful</Text>
                                <Text className="text-green-600 font-bold text-lg">{result.successfulMigrations}</Text>
                            </View>

                            <View className="flex-row justify-between items-center py-3">
                                <Text className="text-red-600">❌ Failed</Text>
                                <Text className="text-red-600 font-bold text-lg">{result.failedMigrations}</Text>
                            </View>
                        </View>

                        {result.errors && result.errors.length > 0 && (
                            <View className="mt-4 bg-red-50 rounded-xl p-4 border border-red-100">
                                <Text className="text-red-900 font-bold mb-2">Errors:</Text>
                                {result.errors.slice(0, 5).map((err: any, idx: number) => (
                                    <Text key={idx} className="text-red-700 text-xs mb-1">
                                        • {err.serviceId}: {err.error}
                                    </Text>
                                ))}
                                {result.errors.length > 5 && (
                                    <Text className="text-red-600 text-xs mt-2">
                                        ...and {result.errors.length - 5} more errors
                                    </Text>
                                )}
                            </View>
                        )}

                        <View className="mt-6">
                            <PrimaryButton
                                title="Run Migration Again"
                                onPress={handleMigration}
                                icon="refresh"
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MigrationScreen;
