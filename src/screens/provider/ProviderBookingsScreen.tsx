import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import {
  acceptBooking,
  getBookings,
  rejectBooking,
} from "../../firebase/bookings";
import { Booking, BookingStatus } from "../../types/booking";
import { AppStackNavigationProp } from "../../types/navigation";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";

type FilterTab = "all" | "pending" | "accepted" | "completed";

const ProviderBookingsScreen: React.FC = () => {
  const navigation = useNavigation<AppStackNavigationProp>();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter]);

  const loadBookings = async () => {
    if (!user) return;

    setLoading(true);
    const { success, bookings: providerBookings } = await getBookings({
      providerId: user.uid,
    });

    if (success && providerBookings) {
      setBookings(providerBookings as Booking[]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const filterBookings = () => {
    let filtered = bookings;

    switch (activeFilter) {
      case "pending":
        filtered = bookings.filter((b) => b.status === "pending");
        break;
      case "accepted":
        filtered = bookings.filter((b) => b.status === "accepted");
        break;
      case "completed":
        filtered = bookings.filter((b) => b.status === "completed");
        break;
      case "all":
      default:
        filtered = bookings;
        break;
    }

    setFilteredBookings(filtered);
  };

  const handleAccept = async (booking: Booking) => {
    if (!user) return;

    Alert.alert(
      "Accept Booking",
      `Accept booking from ${booking.userName} for ${booking.serviceName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          style: "default",
          onPress: async () => {
            setActionLoading(true);
            const { success, error } = await acceptBooking(
              booking.id,
              user.uid
            );

            if (success) {
              Alert.alert("Success", "Booking accepted successfully!");
              await loadBookings();
            } else {
              Alert.alert("Error", error || "Failed to accept booking");
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleRejectPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setRejectionReason("");
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!user || !selectedBooking) return;

    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    const { success, error } = await rejectBooking(
      selectedBooking.id,
      user.uid,
      rejectionReason.trim()
    );

    if (success) {
      Alert.alert("Success", "Booking rejected");
      setRejectModalVisible(false);
      setSelectedBooking(null);
      setRejectionReason("");
      await loadBookings();
    } else {
      Alert.alert("Error", error || "Failed to reject booking");
    }
    setActionLoading(false);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilterCount = (filter: FilterTab): number => {
    switch (filter) {
      case "pending":
        return bookings.filter((b) => b.status === "pending").length;
      case "accepted":
        return bookings.filter((b) => b.status === "accepted").length;
      case "completed":
        return bookings.filter((b) => b.status === "completed").length;
      case "all":
      default:
        return bookings.length;
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <View className="bg-white rounded-2xl shadow-md p-4 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
            {booking.serviceName}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Customer: {booking.userName}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}
        >
          <Text className="text-xs font-semibold capitalize">
            {booking.status}
          </Text>
        </View>
      </View>

      {/* Date & Time */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text className="text-gray-600 text-sm ml-2">
          {formatDate(booking.date)}
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="time-outline" size={16} color="#6B7280" />
        <Text className="text-gray-600 text-sm ml-2">
          {formatTime(booking.time)}
        </Text>
      </View>

      {/* Notes */}
      {booking.notes && (
        <View className="bg-gray-50 p-3 rounded-lg mb-3">
          <Text className="text-gray-600 text-xs">Note: {booking.notes}</Text>
        </View>
      )}

      {/* Rejection Reason */}
      {booking.status === "rejected" && booking.rejectionReason && (
        <View className="bg-red-50 p-3 rounded-lg mb-3">
          <Text className="text-red-600 text-xs font-semibold">
            Rejection Reason:
          </Text>
          <Text className="text-red-600 text-xs mt-1">
            {booking.rejectionReason}
          </Text>
        </View>
      )}

      {/* Price and Actions */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
        <Text className="text-primary text-xl font-bold">
          {formatCurrency(booking.price)}
        </Text>

        {booking.status === "pending" && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleAccept(booking)}
              disabled={actionLoading}
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRejectPress(booking)}
              disabled={actionLoading}
              className="bg-red-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-semibold">Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return <LoadingState message="Loading bookings..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-primary pt-4 pb-6 px-6">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">My Bookings</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {(["all", "pending", "accepted", "completed"] as FilterTab[]).map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full ${
                    activeFilter === filter ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      activeFilter === filter ? "text-primary" : "text-white"
                    }`}
                  >
                    {filter} ({getFilterCount(filter)})
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No ${activeFilter === "all" ? "" : activeFilter} bookings`}
            description={
              activeFilter === "pending"
                ? "You have no pending booking requests"
                : `No ${activeFilter} bookings found`
            }
          />
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </ScrollView>

      {/* Rejection Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Reject Booking
            </Text>
            <Text className="text-gray-600 text-sm mb-4">
              Please provide a reason for rejecting this booking:
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-900 mb-4"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setRejectModalVisible(false)}
                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRejectSubmit}
                disabled={actionLoading}
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">
                  {actionLoading ? "Rejecting..." : "Reject Booking"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProviderBookingsScreen;
