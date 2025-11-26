import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ServiceCard from "../../components/cards/ServiceCard";
import SearchInput from "../../components/inputs/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { CATEGORIES } from "../../constants/categories";
import { useAuth } from "../../context/AuthContext";
import { getBookings } from "../../firebase/bookings";
import { getActiveServices } from "../../firebase/services";
import { AppStackNavigationProp } from "../../types/navigation";
import { Service } from "../../types/service";
import AdminDashboardScreen from "../admin/AdminDashboardScreen";
import ProviderDashboardScreen from "../provider/ProviderDashboardScreen";

interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<AppStackNavigationProp>();
  const { userProfile, isAdmin, user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0,
    upcoming: 0,
    completed: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [isAdmin, user]);

  const loadData = async () => {
    setLoading(true);

    // Load active services
    const { success, services: fetchedServices } = await getActiveServices();
    if (success && fetchedServices) {
      setServices(fetchedServices);
    }

    // Load user bookings for stats
    if (user) {
      const { success: bookingSuccess, bookings } = await getBookings({
        userId: user.uid,
      });
      if (bookingSuccess && bookings) {
        const now = new Date();
        const upcoming = bookings.filter(
          (b) =>
            new Date(b.date) > now &&
            (b.status === "pending" || b.status === "confirmed")
        ).length;
        const completed = bookings.filter(
          (b) => b.status === "completed"
        ).length;

        setBookingStats({
          total: bookings.length,
          upcoming,
          completed,
        });

        // Get recent bookings (last 3)
        const sorted = [...bookings].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentBookings(sorted.slice(0, 3));
      }
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleServicePress = (serviceId: string) => {
    navigation.navigate("ServiceDetails", { serviceId });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  // Admin Dashboard View
  if (isAdmin) {
    return <AdminDashboardScreen />;
  }

  // Provider Dashboard View
  if (userProfile?.role === "provider") {
    return <ProviderDashboardScreen />;
  }

  // Regular User Dashboard View
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section with Gradient */}
      <View className="bg-primary pt-12 pb-8 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-white/80 text-sm">{getGreeting()},</Text>
            <Text className="text-white text-2xl font-bold">
              {userProfile?.name || "User"}
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-lg font-bold">
              {userProfile?.name ? getInitials(userProfile.name) : "U"}
            </Text>
          </View>
        </View>
        <Text className="text-white/90 text-sm mb-4">
          Plan your perfect event with our services
        </Text>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search services..."
          onFocus={() => navigation.navigate("Search")}
        />
      </View>

      {/* Quick Stats */}
      <View className="px-6 -mt-6 mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="gap-x-3"
        >
          <View
            className="bg-white rounded-2xl p-4 shadow-sm"
            style={{ width: 140 }}
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {bookingStats.total}
            </Text>
            <Text className="text-gray-500 text-xs">Total Bookings</Text>
          </View>

          <View
            className="bg-white rounded-2xl p-4 shadow-sm"
            style={{ width: 140 }}
          >
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {bookingStats.upcoming}
            </Text>
            <Text className="text-gray-500 text-xs">Upcoming</Text>
          </View>

          <View
            className="bg-white rounded-2xl p-4 shadow-sm"
            style={{ width: 140 }}
          >
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {bookingStats.completed}
            </Text>
            <Text className="text-gray-500 text-xs">Completed</Text>
          </View>
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View className="px-6 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            className="bg-white rounded-2xl p-4 shadow-sm flex-1"
            style={{ minWidth: "47%" }}
          >
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
              <Ionicons name="search" size={24} color="#6366F1" />
            </View>
            <Text className="text-gray-900 font-semibold">Browse Services</Text>
            <Text className="text-gray-500 text-xs mt-1">
              Find perfect services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "Bookings" })
            }
            className="bg-white rounded-2xl p-4 shadow-sm flex-1"
            style={{ minWidth: "47%" }}
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
            </View>
            <Text className="text-gray-900 font-semibold">My Bookings</Text>
            <Text className="text-gray-500 text-xs mt-1">
              View all bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("CreateBooking", {})}
            className="bg-white rounded-2xl p-4 shadow-sm flex-1"
            style={{ minWidth: "47%" }}
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="add-circle-outline" size={24} color="#10B981" />
            </View>
            <Text className="text-gray-900 font-semibold">Create Booking</Text>
            <Text className="text-gray-500 text-xs mt-1">Book a service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "Profile" })
            }
            className="bg-white rounded-2xl p-4 shadow-sm flex-1"
            style={{ minWidth: "47%" }}
          >
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="person-outline" size={24} color="#8B5CF6" />
            </View>
            <Text className="text-gray-900 font-semibold">My Profile</Text>
            <Text className="text-gray-500 text-xs mt-1">
              View & edit profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Recent Bookings
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Bookings" })
              }
            >
              <Text className="text-primary text-sm font-semibold">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {recentBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              onPress={() =>
                navigation.navigate("BookingDetails", {
                  bookingId: booking.id!,
                })
              }
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-gray-900 font-semibold flex-1">
                  {booking.serviceName}
                </Text>
                <View
                  className={`px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}
                >
                  <Text className="text-xs font-semibold capitalize">
                    {booking.status}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-1">
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#9CA3AF"
                  className="ml-3"
                />
                <Text className="text-gray-500 text-sm ml-1">
                  {booking.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Categories */}
      <View className="px-6 mb-6">
        <Text className="text-gray-900 text-lg font-bold mb-4">Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="gap-x-3"
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => navigation.navigate("Search")}
              className="bg-white rounded-2xl p-4 shadow-sm items-center"
              style={{ width: 110 }}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: category.color + "20" }}
              >
                <Text className="text-3xl">{category.icon}</Text>
              </View>
              <Text className="text-gray-900 text-xs font-semibold text-center">
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Services */}
      <View className="px-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-900 text-lg font-bold">
            Featured Services
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Text className="text-primary text-sm font-semibold">See All</Text>
          </TouchableOpacity>
        </View>

        {services.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="No Services Available"
            description="Check back later for available services"
          />
        ) : (
          services
            .slice(0, 5)
            .map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => handleServicePress(service.id!)}
              />
            ))
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
