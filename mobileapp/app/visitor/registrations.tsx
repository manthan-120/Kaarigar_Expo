import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../services/api";
import { openCashfreeCheckout } from "../../services/cashfreePayment";

type RSVP = {
  _id: string;
  status: string;
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
  event: { _id: string; name: string; date: string; location: string; visitorFee: number };
};

export default function VisitorRegistrationsScreen() {
  const [registrations, setRegistrations] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      const data = await api("/rsvps/my");
      setRegistrations(data.rsvps || []);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchRegistrations(); }, []));

  const handlePayment = async (rsvp: RSVP) => {
    try {
      setPayingId(rsvp._id);
      const order = await api("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ eventId: rsvp.event._id, purpose: "VISITOR_RSVP" }),
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
          ? "Your event registration has been confirmed."
          : verification.status === "PENDING"
            ? "Payment is still being processed."
            : "The payment was not completed."
      );

      await fetchRegistrations();
    } catch (error) {
      Alert.alert("Payment Error", error instanceof Error ? error.message : "Unable to complete payment.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}>
        <Text onPress={() => router.back()} className="font-semibold text-[#C65D3A]">Back</Text>
        <Text className="mt-7 text-[22px] font-extrabold text-[#C65D3A]">My Registrations</Text>
        <Text className="mt-2 text-[13px] text-[#75665E]">Track your event registrations and payments.</Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#C65D3A" />
          </View>
        ) : registrations.length === 0 ? (
          <View className="mt-8 rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">You have not registered for any event yet.</Text>
          </View>
        ) : (
          registrations.map((rsvp) => {
            const isPaid = rsvp.paymentStatus === "PAID";
            return (
              <View key={rsvp._id} className="mt-4 rounded-[16px] bg-white p-5">
                <Text className="text-[18px] font-bold text-[#3B2923]">{rsvp.event?.name}</Text>
                <Text className="mt-2 text-[#75665E]">{rsvp.event?.location}</Text>
                <Text className="mt-2 text-[#75665E]">Registration: {rsvp.status}</Text>

                {rsvp.event?.visitorFee > 0 ? (
                  <>
                    <Text className="mt-2 text-[18px] font-bold text-[#C65D3A]">₹{rsvp.event.visitorFee}</Text>
                    <Text className={`mt-2 font-bold ${isPaid ? "text-green-600" : "text-[#C65D3A]"}`}>
                      Payment: {isPaid ? "PAID" : "UNPAID"}
                    </Text>
                    {!isPaid && (
                      <TouchableOpacity
                        onPress={() => handlePayment(rsvp)}
                        disabled={payingId === rsvp._id}
                        className="mt-4 items-center rounded-[12px] bg-[#C65D3A] py-3"
                      >
                        <Text className="font-bold text-white">
                          {payingId === rsvp._id ? "Processing..." : "Pay Now"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text className="mt-2 font-bold text-green-600">Payment: Not Required</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
