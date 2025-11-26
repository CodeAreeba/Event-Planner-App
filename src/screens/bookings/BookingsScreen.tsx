import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import BookingCard from "../../components/cards/BookingCard";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  Booking,
  cancelBooking,
  subscribeToBookings,
  updatePastBookingsForUser,
} from "../../firebase/bookings";
import { AppStackNavigationProp } from "../../types/navigation";

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<AppStackNavigationProp>();
  const { user, isAdmin, userProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "past" | "cancelled"
  >("all");

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    console.log("\n📅 ===== BOOKINGS SCREEN LOAD =====");
    console.log("👤 User ID:", user.uid);
    console.log("🎭 User Role:", userProfile?.role || "unknown");
    console.log("👑 Is Admin:", isAdmin);

    // Determine filter based on user role
    let filterConfig = {};

    if (isAdmin) {
      // Admin sees all bookings
      console.log("🔍 Filter: ALL BOOKINGS (admin view)");
      filterConfig = {};
    } else if (userProfile?.role === "provider") {
      // Provider sees bookings for their services
      console.log("🔍 Filter: PROVIDER BOOKINGS (providerId:", user.uid, ")");
      filterConfig = { providerId: user.uid };
    } else {
      // Customer sees their own bookings
      console.log("🔍 Filter: CUSTOMER BOOKINGS (userId:", user.uid, ")");
      filterConfig = { userId: user.uid };
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribeToBookings((fetchedBookings) => {
      console.log("📊 Received", fetchedBookings.length, "bookings");
      setBookings(fetchedBookings);
      setLoading(false);
      setRefreshing(false);
    }, filterConfig);

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, isAdmin, userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Update past bookings for current user
    if (user) {
      try {
        await updatePastBookingsForUser(user.uid);
      } catch (error) {
        console.log("Could not auto-update past bookings");
      }
    }
    // Real-time listener will automatically update the list
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking for "${booking.serviceName}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const { success } = await cancelBooking(booking.id!);
            if (success) {
              Alert.alert("Success", "Booking cancelled successfully");
            } else {
              Alert.alert(
                "Error",
                "Failed to cancel booking. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const getFilteredBookings = () => {
    const now = new Date();
    switch (filter) {
      case "upcoming":
        return bookings.filter(
          (b) =>
            b.status !== "cancelled" &&
            b.status !== "completed" &&
            new Date(b.date) >= now
        );
      case "past":
        return bookings.filter(
          (b) => b.status === "completed" || new Date(b.date) < now
        );
      case "cancelled":
        return bookings.filter((b) => b.status === "cancelled");
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return <Loader fullScreen text="Loading bookings..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white px-6 pb-4 border-b border-gray-200"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text className="text-gray-900 text-2xl font-bold mb-4">
          {isAdmin
            ? "Booking Management"
            : userProfile?.role === "provider"
              ? "Provider Bookings"
              : "My Bookings"}
        </Text>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(["all", "upcoming", "past", "cancelled"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              className={`mr-3 px-4 py-2 rounded-full ${
                filter === tab ? "bg-primary" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  filter === tab ? "text-white" : "text-gray-700"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Bookings Found"
            description="You haven't made any bookings yet. Browse services to get started!"
            action={
              <PrimaryButton
                title="Browse Services"
                onPress={() => navigation.navigate("Search")}
              />
            }
          />
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() =>
                navigation.navigate("BookingDetails", {
                  bookingId: booking.id!,
                })
              }
              onCancel={() => handleCancelBooking(booking)}
              showCancelButton={true}
              showUserInfo={isAdmin}
            />
          ))
        )}
      </ScrollView>

      {/* Create Booking FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate("CreateBooking", {})}
        className="absolute right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
        style={{ bottom: 80 + insets.bottom }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default BookingsScreen;
