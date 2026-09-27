import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ProfileButton from "../../components/ProfileButton";
import { openCashfreeCheckout } from "../../services/cashfreePayment";
import PaymentHistoryCard from "../../components/PaymentHistoryCard";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EventCard from "../../components/EventCard";
import ApplicationCard from "../../components/ApplicationCard";
import { api } from "../../services/api";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  kaarigarFee: number;
};

type Application = {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  craftType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
};

export default function KaarigarDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingEventId, setApplyingEventId] = useState<string | null>(null);
  const [payingApplicationId, setPayingApplicationId] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const { user} = useAuth();

  const fetchData = async () => {
    try {
      const [eventsData, applicationsData, paymentHistoryData] = await Promise.all([
        api("/events"),
        api("/applications/my"),
        api("/payments/my-history"),
      ]);

      const upcomingEvents = eventsData.events.filter(
        (event: Event) => new Date(event.date) >= new Date()
      );

      setEvents(upcomingEvents);
      setApplications(applicationsData.applications);
      setPaymentHistory(paymentHistoryData.payments);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
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

  const handleApply = async (event: Event) => {
    if (!user?.craftType || !user?.description) {
      Alert.alert(
        "Profile Incomplete",
        "Your craft details are missing."
      );
      return;
    }

    try {
      setApplyingEventId(event._id);

      await api("/applications", {
        method: "POST",
        body: JSON.stringify({
          eventId: event._id,
          craftType: user.craftType,
          description: user.description,
        }),
      });

      Alert.alert(
        "Application Submitted",
        `Your application for ${event.name} has been submitted.`
      );

      fetchData();
    } catch (error) {
      Alert.alert(
        "Application Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setApplyingEventId(null);
    }
  };

  const handlePayment = async (
  application: Application
) => {
  try {
    setPayingApplicationId(application._id);

    const order = await api(
      "/payments/create-order",
      {
        method: "POST",
        body: JSON.stringify({
          eventId: application.event._id,
          purpose: "KAARIGAR_APPLICATION",
        }),
      }
    );

    if (!order.checkoutUrl) {
      throw new Error(
        "Checkout URL was not returned by the server."
      );
    }

   const result = await openCashfreeCheckout({
    checkoutUrl: order.checkoutUrl,
    redirectUrl: "mobileapp://payment-result",
  });

  console.log("Cashfree payment result:", result);

  const verification = await api("/payments/verify", {
    method: "POST",
    body: JSON.stringify({
      orderId: result.orderId,
    }),
  });

  console.log("Cashfree verification:", verification);

  if (verification.status === "SUCCESS") {
    Alert.alert(
      "Payment Successful",
      "Your application payment has been completed."
    );
  } else if (verification.status === "PENDING") {
    Alert.alert(
      "Payment Pending",
      "Payment is still being processed. Please refresh shortly."
    );
  } else {
    Alert.alert(
      "Payment Failed",
      "The payment was not completed."
    );
  }

  setPayingApplicationId(null);
  fetchData();
  } catch (error) {
    setPayingApplicationId(null);

    Alert.alert(
      "Payment Error",
      error instanceof Error
        ? error.message
        : "Unable to start payment."
    );
  }
};
  const getApplicationStatus = (eventId: string) => {
    return applications.find(
      (application) => application.event._id === eventId
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <ActivityIndicator size="large" color="#C65D3A" />
        <Text className="mt-3 text-[#75665E]">
          Loading dashboard...
        </Text>
      </View>
    );
  }

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
        <View className="mb-3 flex-row items-center justify-end">
          <ProfileButton />
        </View>

        <Text className="text-[28px] font-extrabold text-[#C65D3A]">
          KAARIGAR EXPO
        </Text>

        <Text className="mt-2 text-[24px] font-bold text-[#3B2923]">
          Kaarigar Dashboard
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Explore melas and manage your applications.
        </Text>

        {/* Upcoming Events */}
        <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
          Upcoming Events
        </Text>

        {events.length === 0 ? (
          <View className="rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">
              No upcoming events available.
            </Text>
          </View>
        ) : (
          events.map((event) => {
            const existingApplication = getApplicationStatus(event._id);

            return (
              <View key={event._id}>
                <EventCard
                  event={event}
                  fee={event.kaarigarFee}
                  feeLabel="Kaarigar Participation Fee"
                />

                {existingApplication ? (
                  <View className="-mt-3 mb-4 rounded-[12px] bg-[#F4EEE8] p-3">
                    <Text className="text-center text-[14px] font-bold text-[#3B2923]">
                      Application: {existingApplication.status}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleApply(event)}
                    disabled={applyingEventId === event._id}
                    className="-mt-3 mb-4 items-center rounded-[12px] bg-[#C65D3A] py-3"
                  >
                    <Text className="font-bold text-white">
                      {applyingEventId === event._id
                        ? "Applying..."
                        : "Apply for Event"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {/* My Applications */}
        <Text className="mb-4 mt-9 text-[20px] font-bold text-[#3B2923]">
          My Applications
        </Text>

        {applications.length === 0 ? (
          <View className="rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">
              You have not applied to any event yet.
            </Text>
          </View>
        ) : (
          applications.map((application) => {
            const isPaying =
              payingApplicationId === application._id;

            return (
              <View key={application._id}>
                <ApplicationCard
                  application={application}
                  onPay={() => handlePayment(application)}
                  paying={payingApplicationId === application._id}
                />
              </View>
            );
          })
        )}

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