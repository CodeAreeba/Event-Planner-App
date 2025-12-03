import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ServiceForm from "../../components/forms/ServiceForm";
import { useAuth } from "../../context/AuthContext";
import { createService } from "../../firebase/services";
import { AppStackNavigationProp } from "../../types/navigation";
import { ServiceFormData } from "../../types/service";

const AddServiceScreen: React.FC = () => {
  const navigation = useNavigation<AppStackNavigationProp>();
  const { isAdmin, userProfile, user } = useAuth();

  // Role-based access control - Admin and Provider only
  const canAddService = isAdmin || userProfile?.role === "provider";

  useEffect(() => {
    if (!canAddService) {
      Alert.alert(
        "Access Denied",
        "Only administrators and service providers can add services.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [canAddService]);

  const handleSubmit = async (data: ServiceFormData) => {
    if (!user || !userProfile) {
      Alert.alert("Error", "User information not available");
      return;
    }

    const serviceData = {
      ...data,
      providerId: user.uid,
      providerName: userProfile.name,
      status: "pending" as const,
      isActive: true,
    };

    const { success, error, serviceId } = await createService(
      serviceData,
      user.uid,
      userProfile.name
    );

    if (success && serviceId) {
      // Auto-generate time slots for the next 30 days
      try {
        const providerServicesModule = await import(
          "../../firebase/providerServices"
        );
        const slotGeneratorModule = await import("../../utils/slotGenerator");

        const slotResult =
          await providerServicesModule.createProviderServiceSlots({
            serviceId,
            providerId: user.uid,
            serviceName: data.title,
            serviceDuration: data.duration,
            workingHours: slotGeneratorModule.getDefaultWorkingHours(),
            numberOfDays: 30,
            bufferMinutes: 15,
          });

        if (slotResult.success) {
          console.log(
            `✅ Generated ${slotResult.createdCount} days of time slots`
          );
          Alert.alert(
            "Success",
            `Service created successfully with ${slotResult.createdCount} days of available booking slots!`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        } else {
          // Service created but slots failed - still show success
          console.warn(
            "⚠️ Service created but slot generation failed:",
            slotResult.error
          );
          Alert.alert(
            "Service Created",
            "Service created successfully, but automatic time slot generation encountered an issue. You can still receive bookings.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      } catch (slotError) {
        console.error("❌ Error generating slots:", slotError);
        Alert.alert(
          "Service Created",
          "Service created successfully, but automatic time slot generation encountered an issue. You can still receive bookings.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } else {
      Alert.alert("Error", error || "Failed to create service");
    }
  };

  // Show access denied message if not authorized
  if (!canAddService) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-900 text-lg font-semibold">
          Access Denied
        </Text>
        <Text className="text-gray-600 text-sm mt-2">
          Only administrators and service providers can add services.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ServiceForm onSubmit={handleSubmit} submitButtonText="Create Service" />
    </SafeAreaView>
  );
};

export default AddServiceScreen;
