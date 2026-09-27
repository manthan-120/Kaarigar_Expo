import { useEffect, useState } from "react";
import { router } from "expo-router";

import EventCard from "../../components/EventCard";
import PaymentHistoryCard from "../../components/PaymentHistoryCard";
import ProfileButton from "../../components/ProfileButton";

import { useAuth } from "../../hooks/useAuth";
import { openCashfreeCheckout } from "../../services/cashfreePayment";
import { api } from "../../services/api";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  visitorFee: number;
  kaarigarFee: number;
};

type RSVP = {
  _id: string;
  status: string;
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
    visitorFee: number;
  };
};

type PaymentHistory = {
  paymentId: string;
  event?: {
    name?: string;
    date?: string;
    location?: string;
  };
  amount: number;
  currency: string;
  status: string;
  purpose: "VISITOR_RSVP" | "KAARIGAR_APPLICATION";
  paymentDate: string;
  cashfreePaymentId?: string;
  cashfreeOrderId?: string;
};

export default function VisitorDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<RSVP[]>([]);
  const [paymentHistory, setPaymentHistory] =
    useState<PaymentHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingRsvpId, setPayingRsvpId] =
    useState<string | null>(null);

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [
        eventsData,
        registrationsData,
        paymentHistoryData,
      ] = await Promise.all([
        api("/events"),
        api("/rsvps/my"),
        api(
          "/payments/my-history?purpose=VISITOR_RSVP"
        ),
      ]);

      const upcomingEvents = eventsData.events.filter(
        (event: Event) =>
          new Date(event.date) >= new Date()
      );

      setEvents(upcomingEvents);

      setRegistrations(
        registrationsData.rsvps || []
      );

      setPaymentHistory(
        paymentHistoryData.payments || []
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load visitor dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleVisitorPayment = async (
    rsvp: RSVP
  ) => {
    try {
      setPayingRsvpId(rsvp._id);

      const order = await api(
        "/payments/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            eventId: rsvp.event._id,
            purpose: "VISITOR_RSVP",
          }),
        }
      );

      if (!order.checkoutUrl) {
        throw new Error(
          "Checkout URL was not returned by the server."
        );
      }

      const result =
        await openCashfreeCheckout({
          checkoutUrl: order.checkoutUrl,
          redirectUrl:
            "mobileapp://payment-result",
        });

      console.log(
        "Visitor payment result:",
        result
      );

      const verification = await api(
        "/payments/verify",
        {
          method: "POST",
          body: JSON.stringify({
            orderId: result.orderId,
          }),
        }
      );

      console.log(
        "Visitor payment verification:",
        verification
      );

      if (
        verification.status === "SUCCESS"
      ) {
        Alert.alert(
          "Payment Successful",
          "Your event registration has been confirmed."
        );
      } else if (
        verification.status === "PENDING"
      ) {
        Alert.alert(
          "Payment Pending",
          "Payment is still being processed."
        );
      } else {
        Alert.alert(
          "Payment Failed",
          "The payment was not completed."
        );
      }

      await fetchData();
    } catch (error) {
      Alert.alert(
        "Payment Error",
        error instanceof Error
          ? error.message
          : "Unable to complete payment."
      );
    } finally {
      setPayingRsvpId(null);
    }
  };

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Profile */}
        <View className="mb-3 flex-row items-center justify-end">
          <ProfileButton />
        </View>

        {/* Header */}
        <Text className="text-[28px] font-extrabold text-[#C65D3A]">
          KAARIGAR EXPO
        </Text>

        <Text className="mt-2 text-[24px] font-bold text-[#3B2923]">
          Welcome, {user?.name || "Visitor"}
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Explore upcoming exhibitions and melas.
        </Text>

        {/* Upcoming Events */}
        <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
          Upcoming Events
        </Text>

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator
              size="large"
              color="#C65D3A"
            />

            <Text className="mt-3 text-[#75665E]">
              Loading events...
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View className="rounded-[16px] bg-white p-5">
            <Text className="text-center text-[15px] text-[#75665E]">
              No upcoming events available.
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              fee={event.visitorFee}
              feeLabel="Visitor Entry Fee"
              onPress={() =>
                router.push({
                  pathname:
                    "/visitor/event-details",
                  params: {
                    id: event._id,
                  },
                })
              }
              actionLabel="View Event →"
            />
          ))
        )}

        {/* My Registrations */}
        <Text className="mb-4 mt-9 text-[20px] font-bold text-[#3B2923]">
          My Registrations
        </Text>

        {registrations.length === 0 ? (
          <View className="rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">
              You have not registered for any event yet.
            </Text>
          </View>
        ) : (
          registrations.map((rsvp) => {
            const eventDetails = events.find(
              (event) => event._id === rsvp.event._id
            );

            const fee = eventDetails?.visitorFee ?? 0;

            const isPaid =
              rsvp.paymentStatus === "PAID";

            const isPaying =
              payingRsvpId === rsvp._id;

            return (
              <View
                key={rsvp._id}
                className="mb-4 rounded-[16px] bg-white p-5"
              >
                <Text className="text-[18px] font-bold text-[#3B2923]">
                  {rsvp.event?.name}
                </Text>

                <Text className="mt-2 text-[#75665E]">
                  {rsvp.event?.location}
                </Text>

                <Text className="mt-2 text-[#75665E]">
                  Registration: {rsvp.status}
                </Text>

                {fee > 0 ? (
                  <>
                    <Text className="mt-2 text-[18px] font-bold text-[#C65D3A]">
                      ₹{fee}
                    </Text>

                    <Text
                      className={`mt-2 font-bold ${
                        isPaid
                          ? "text-green-600"
                          : "text-[#C65D3A]"
                      }`}
                    >
                      Payment:{" "}
                      {isPaid
                        ? "PAID"
                        : "UNPAID"}
                    </Text>

                    {!isPaid && (
                      <TouchableOpacity
                        onPress={() =>
                          handleVisitorPayment(
                            rsvp
                          )
                        }
                        disabled={isPaying}
                        className="mt-4 items-center rounded-[12px] bg-[#C65D3A] py-3"
                      >
                        <Text className="font-bold text-white">
                          {isPaying
                            ? "Processing..."
                            : "Pay Now"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text className="mt-2 font-bold text-green-600">
                    Payment: Not Required
                  </Text>
                )}
              </View>
            );
          })
        )}

        {/* Payment History */}
        <Text className="mb-4 mt-9 text-[20px] font-bold text-[#3B2923]">
          Payment History
        </Text>

        {paymentHistory.length === 0 ? (
          <View className="rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">
              No payments yet.
            </Text>
          </View>
        ) : (
          paymentHistory.map((payment) => (
            <PaymentHistoryCard
              key={payment.paymentId}
              payment={payment}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}