import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import ServiceCard from '../../components/cards/ServiceCard';
import SearchInput from '../../components/inputs/SearchInput';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import { Service, getServices, searchServices } from '../../firebase/services';
import { AppStackNavigationProp } from '../../types/navigation';

const SearchScreen: React.FC = () => {
    const navigation = useNavigation<AppStackNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAllServices();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            handleSearch();
        } else {
            loadAllServices();
        }
    }, [searchQuery]);

    const loadAllServices = async () => {
        setLoading(true);
        const { success, services: fetchedServices } = await getServices();
        if (success && fetchedServices) {
            setServices(fetchedServices);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        setLoading(true);
        const { success, services: searchResults } = await searchServices(searchQuery);
        if (success && searchResults) {
            setServices(searchResults);
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Search Header */}
            <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
                <Text className="text-gray-900 text-2xl font-bold mb-4">
                    Search Services
                </Text>
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name, category, or location..."
                />
            </View>

            {/* Results */}
            <ScrollView className="flex-1 px-6 pt-4">
                {loading ? (
                    <Loader text="Searching..." />
                ) : services.length === 0 ? (
                    <EmptyState
                        icon="search-outline"
                        title="No Services Found"
                        description={
                            searchQuery
                                ? `No results for "${searchQuery}"`
                                : 'No services available'
                        }
                    />
                ) : (
                    <>
                        <Text className="text-gray-600 text-sm mb-4">
                            {services.length} service{services.length !== 1 ? 's' : ''} found
                        </Text>
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onPress={() =>
                                    navigation.navigate('ServiceDetails', { serviceId: service.id! })
                                }
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default SearchScreen;
