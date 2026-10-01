import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import ApplicationCard from "../../components/ApplicationCard";
import { useAuth } from "../../hooks/useAuth";
import { openCashfreeCheckout } from "../../services/cashfreePayment";
import { api } from "../../services/api";

type Application = {
  _id: string;
  event: { _id: string; name: string; date: string; location: string };
  craftType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
};

export default function KaarigarApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  useAuth();

  const fetchApplications = async () => {
    try {
      const data = await api("/applications/my");
      setApplications(data.applications || []);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchApplications(); }, []));

  const handlePayment = async (application: Application) => {
    try {
      setPayingId(application._id);
      const order = await api("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({
          eventId: application.event._id,
          purpose: "KAARIGAR_APPLICATION",
        }),
      });

      if (!order.checkoutUrl) throw new Error("Checkout URL was not returned by the server.");

      const result = await openCashfreeCheckout({
        checkoutUrl: order.checkoutUrl,
        redirectUrl: "mobileapp://payment-result",
      });

      const verification = await api("/payments/verify", {
        method: "POST",
        body: JSON.stringify({ orderId: result.orderId }),
      });

      Alert.alert(
        verification.status === "SUCCESS" ? "Payment Successful" : "Payment Update",
        verification.status === "SUCCESS"
          ? "Your application payment has been completed."
          : verification.status === "PENDING"
            ? "Payment is still being processed."
            : "The payment was not completed."
      );

      await fetchApplications();
    } catch (error) {
      Alert.alert("Payment Error", error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}>
        <Text onPress={() => router.back()} className="font-semibold text-[#C65D3A]">← Back</Text>
        <Text className="mt-7 text-[28px] font-extrabold text-[#C65D3A]">My Applications</Text>
        <Text className="mt-2 text-[14px] text-[#75665E]">Track your mela applications and participation payments.</Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#C65D3A" />
          </View>
        ) : applications.length === 0 ? (
          <View className="mt-8 rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">You have not applied to any event yet.</Text>
          </View>
        ) : (
          applications.map((application) => (
            <View key={application._id} className="mt-5">
              <ApplicationCard
                application={application}
                onPay={() => handlePayment(application)}
                onView={() =>
                  router.push({
                    pathname: "/visitor/event-details",
                    params: { id: application.event._id, role: "kaarigar" },
                  })
                }
                paying={payingId === application._id}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
