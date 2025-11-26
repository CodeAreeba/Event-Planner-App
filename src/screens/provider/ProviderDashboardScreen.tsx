import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ServiceCard from "../../components/cards/ServiceCard";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  getBookings,
  updatePastBookingsForUser,
} from "../../firebase/bookings";
import { getAllServices } from "../../firebase/services";
import { AppStackNavigationProp } from "../../types/navigation";
import { Service } from "../../types/service";

const ProviderDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AppStackNavigationProp>();
  const { userProfile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    // Service stats
    totalServices: 0,
    pendingServices: 0,
    approvedServices: 0,
    rejectedServices: 0,
    // Booking stats
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    // Financial
    totalEarnings: 0,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      console.log("❌ No user found, cannot load data");
      return;
    }

    setLoading(true);

    try {
      // Auto-update past bookings for this user to 'completed' status
      try {
        await updatePastBookingsForUser(user.uid);
      } catch (updateError) {
        // Silently fail if there's an issue
        console.log("Could not auto-update past bookings");
      }

      const { success: serviceSuccess, services: allServices } =
        await getAllServices();
      if (serviceSuccess && allServices) {
        const myServices = allServices.filter((s) => s.createdBy === user.uid);
        setServices(myServices);

        // Count service statuses
        const pendingServices = myServices.filter(
          (s) => s.status === "pending"
        ).length;
        const approvedServices = myServices.filter(
          (s) => s.status === "approved"
        ).length;
        const rejectedServices = myServices.filter(
          (s) => s.status === "rejected"
        ).length;

        try {
          const { success: bookingSuccess, bookings: providerBookings } =
            await getBookings({
              providerId: user.uid,
            });

          // Count booking statuses
          let pendingCount = 0;
          let confirmedCount = 0;
          let completedCount = 0;
          let cancelledCount = 0;
          let earnings = 0;

          if (bookingSuccess && providerBookings) {
            providerBookings.forEach((booking) => {
              switch (booking.status) {
                case "pending":
                  pendingCount++;
                  break;
                case "confirmed":
                  confirmedCount++;
                  break;
                case "completed":
                  completedCount++;
                  earnings += booking.price;
                  break;
                case "cancelled":
                  cancelledCount++;
                  break;
              }
            });
          }

          setStats({
            totalServices: myServices.length,
            pendingServices,
            approvedServices,
            rejectedServices,
            pendingBookings: pendingCount,
            confirmedBookings: confirmedCount,
            completedBookings: completedCount,
            cancelledBookings: cancelledCount,
            totalEarnings: earnings,
          });
        } catch (bookingError: any) {}
      } else {
        console.log("❌ Failed to fetch services or no services returned");
      }
    } catch (error: any) {
      // Set empty state on error
      setServices([]);
      setStats({
        totalServices: 0,
        pendingServices: 0,
        approvedServices: 0,
        rejectedServices: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalEarnings: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // Update past bookings for this user before reloading
    if (user) {
      try {
        await updatePastBookingsForUser(user.uid);
      } catch (error) {
        console.log("Could not auto-update past bookings");
      }
    }

    await loadData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View className="bg-primary pt-12 pb-6 px-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">Welcome!</Text>
            <Text className="text-white/80 text-sm mt-1">
              Hi, {userProfile?.name}
            </Text>
          </View>
          <View
            className="bg-white/30 px-5 py-2.5 rounded-full"
            style={styles.glassmorphism}
          >
            <Text className="text-white text-xs font-bold uppercase tracking-wider">
              Provider
            </Text>
          </View>
        </View>
        <Text className="text-white/95 text-base font-medium">
          Manage your services and track your bookings
        </Text>
      </View>

      <ScrollView
        className="flex-1 mt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid with Three Sections */}
        <View className="px-6 mb-6">
          {/* Section 1: Booking Overview */}
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Booking Overview
          </Text>
          <View className="flex-row gap-3 mb-6">
            {/* Pending Bookings */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ProviderBookings")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FFEDD5" }]}
              >
                <Ionicons name="calendar" size={22} color="#F97316" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.pendingBookings}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">Pending</Text>
            </TouchableOpacity>

            {/* Confirmed Bookings */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ProviderBookings")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}
              >
                <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.confirmedBookings}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">
                Confirmed
              </Text>
            </TouchableOpacity>

            {/* Completed Bookings */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ProviderBookings")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}
              >
                <Ionicons
                  name="checkmark-done-circle"
                  size={22}
                  color="#10B981"
                />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.completedBookings}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">
                Completed
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 2: Service Status */}
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Service Status
          </Text>
          <View className="flex-row gap-3 mb-6">
            {/* Pending Approval */}
            <TouchableOpacity
              onPress={() => navigation.navigate("UserServices")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="time" size={22} color="#F59E0B" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.pendingServices}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">Pending</Text>
            </TouchableOpacity>

            {/* Approved Services */}
            <TouchableOpacity
              onPress={() => navigation.navigate("UserServices")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}
              >
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.approvedServices}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">
                Approved
              </Text>
            </TouchableOpacity>

            {/* Rejected Services */}
            <TouchableOpacity
              onPress={() => navigation.navigate("UserServices")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#FEE2E2" }]}
              >
                <Ionicons name="close-circle" size={22} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.rejectedServices}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">
                Rejected
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 3: Performance */}
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Performance
          </Text>
          <View className="flex-row gap-3">
            {/* Total Earnings */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ProviderBookings")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#EDE9FE" }]}
              >
                <Ionicons name="cash" size={22} color="#8B5CF6" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mt-2">
                Rs. {stats.totalEarnings.toLocaleString()}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">
                Total Earnings
              </Text>
              <Text className="text-gray-500 text-[10px] mt-0.5">
                {stats.completedBookings} completed
              </Text>
            </TouchableOpacity>

            {/* Total Services */}
            <TouchableOpacity
              onPress={() => navigation.navigate("UserServices")}
              style={styles.statCard}
              className="flex-1"
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}
              >
                <Ionicons name="briefcase" size={22} color="#6B7280" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalServices}
              </Text>
              <Text className="text-gray-600 text-xs font-medium">
                Total Services
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View className="px-6 mb-6">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate("AddService")}
              style={styles.actionButton}
              className="flex-1"
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#EEF2FF" },
                ]}
              >
                <Ionicons name="add-circle" size={24} color="#6366F1" />
              </View>
              <Text className="text-gray-900 text-sm font-bold mt-2">
                Add Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Bookings" })
              }
              style={styles.actionButton}
              className="flex-1"
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#FEF3C7" },
                ]}
              >
                <Ionicons name="calendar" size={24} color="#F59E0B" />
              </View>
              <Text className="text-gray-900 text-sm font-bold mt-2 text-center">
                View Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Profile" })
              }
              style={styles.actionButton}
              className="flex-1"
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#FCE7F3" },
                ]}
              >
                <Ionicons name="person" size={24} color="#EC4899" />
              </View>
              <Text className="text-gray-900 text-sm font-bold mt-2">
                My Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Services Preview */}
        <View className="px-6 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 text-xl font-bold">My Services</Text>
            {services.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate("UserServices")}
              >
                <Text className="text-blue-600 text-sm font-bold">
                  See All →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 text-xl font-bold mb-2">
                No Services Yet
              </Text>
              <Text className="text-gray-600 text-base text-center mb-6 px-4">
                Start by adding your first service to get booked by customers!
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AddService")}
                style={styles.primaryButton}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-bold text-base">
                  Add Your First Service
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            services.slice(0, 3).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() =>
                  navigation.navigate("ServiceDetails", {
                    serviceId: service.id!,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  glassmorphism: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#F3F4F6",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ProviderDashboardScreen;
