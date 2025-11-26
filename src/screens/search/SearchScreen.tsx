import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceCard from '../../components/cards/ServiceCard';
import SearchInput from '../../components/inputs/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { getActiveServices } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';
import { Service } from '../../types/service';

const SearchScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    // Load all services on mount
    useEffect(() => {
        loadAllServices();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredServices(allServices);
            setSearching(false);
            return;
        }

        setSearching(true);
        const debounceTimer = setTimeout(() => {
            performSearch(searchQuery);
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, allServices]);

    const loadAllServices = async () => {
        setLoading(true);
        console.log('🔍 Loading all active services for search...');

        const { success, services: fetchedServices } = await getActiveServices();

        if (success && fetchedServices) {
            console.log('✅ Loaded', fetchedServices.length, 'services');
            setAllServices(fetchedServices);
            setFilteredServices(fetchedServices);
        } else {
            console.log('⚠️ No services loaded');
            setAllServices([]);
            setFilteredServices([]);
        }

        setLoading(false);
    };

    const performSearch = useCallback((query: string) => {
        const lowerQuery = query.toLowerCase().trim();
        console.log('🔎 Searching for:', lowerQuery);

        const results = allServices.filter(service => {
            const titleMatch = service.title?.toLowerCase().includes(lowerQuery);
            const descriptionMatch = service.description?.toLowerCase().includes(lowerQuery);
            const nameMatch = service.name?.toLowerCase().includes(lowerQuery);

            return titleMatch || descriptionMatch || nameMatch;
        });

        console.log('📊 Found', results.length, 'matching services');
        setFilteredServices(results);
        setSearching(false);
    }, [allServices]);

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilteredServices(allServices);
    };

    if (loading) {
        return <Loader fullScreen text="Loading services..." />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Search Header */}
            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-6 pt-4 pb-4 border-b border-gray-200">
                    <Text className="text-gray-900 text-2xl font-bold mb-4">
                        Search Services
                    </Text>
                    <SearchInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by name or description..."
                    />

                    {/* Search Info */}
                    <View className="flex-row items-center justify-between mt-3">
                        <Text className="text-gray-600 text-sm">
                            {searching ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator size="small" color="#6366F1" />
                                    <Text className="ml-2">Searching...</Text>
                                </View>
                            ) : (
                                <>
                                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
                                    {searchQuery ? ' found' : ' available'}
                                </>
                            )}
                        </Text>
                        {searchQuery && (
                            <Text
                                onPress={handleClearSearch}
                                className="text-blue-600 text-sm font-semibold"
                            >
                                Clear
                            </Text>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            {/* Results */}
            <ScrollView
                className="flex-1 px-6 pt-4 "
                showsVerticalScrollIndicator={false}
            >
                {filteredServices.length === 0 ? (
                    <EmptyState
                        icon="search-outline"
                        title="No Services Found"
                        description={
                            searchQuery
                                ? `No results for "${searchQuery}". Try a different search term.`
                                : 'No services available at the moment.'
                        }
                    />
                ) : (
                    <View className='pb-24'>
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onPress={() =>
                                    navigation.navigate('ServiceDetails', { serviceId: service.id! })
                                }
                            />
                        ))}
                        <View className="h-6" />
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default SearchScreen;
