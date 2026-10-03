import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../../services/api";
import { openCashfreeCheckout } from "../../services/cashfreePayment";
import { useAuth } from "../../hooks/useAuth";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  visitorFee: number;
  kaarigarFee: number;
  image?: string;
};

type Kaarigar = {
  _id: string;
  kaarigar: {
    _id: string;
    name: string;
    email: string;
  };
  craftType: string;
  description?: string;
};

type RSVP = {
  _id: string;
  status: "REGISTERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  ticketNumber?: string;
  event: {
    _id: string;
  };
};

type Application = {
  _id: string;
  event: {
    _id: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
  ticketNumber?: string;
};

export default function EventDetailsScreen() {
  const { id, role } = useLocalSearchParams<{
    id: string;
    role?: string;
  }>();

  const isKaarigar = role === "kaarigar";
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [kaarigars, setKaarigars] = useState<Kaarigar[]>([]);
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const requests = [
        api(`/events/${id}`),
        api(`/events/${id}/kaarigars`),
      ];

      if (!isKaarigar) {
        requests.push(api("/rsvps/my"));
      } else {
        requests.push(api("/applications/my"));
      }

      const [eventData, kaarigarData, rsvpData] =
        await Promise.all(requests);

      setEvent(eventData.event);
      setKaarigars(kaarigarData.kaarigars);

      setRsvp(
        isKaarigar
          ? null
          : (rsvpData.rsvps || []).find(
              (item: RSVP) => item.event?._id === id
            ) || null
      );

      setApplication(
        isKaarigar
          ? (rsvpData.applications || []).find(
              (item: Application) => item.event?._id === id
            ) || null
          : null
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load event details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, isKaarigar]);

  const handleRegister = async () => {
    if (!event) return;

    try {
      setRegistering(true);

      /* =====================================================
         KAARIGAR
      ===================================================== */

      if (isKaarigar) {
        /*
          APPROVED application but payment not completed
          → start Cashfree payment
        */

        if (
          application?.status === "APPROVED" &&
          application.paymentStatus !== "PAID"
        ) {
          const order = await api(
            "/payments/create-order",
            {
              method: "POST",
              body: JSON.stringify({
                eventId: event._id,
                purpose: "KAARIGAR_APPLICATION",
              }),
            }
          );

          const result =
            await openCashfreeCheckout({
              checkoutUrl: order.checkoutUrl,
              redirectUrl:
                "mobileapp://payment-result",
            });

          const verification = await api(
            "/payments/verify",
            {
              method: "POST",
              body: JSON.stringify({
                orderId: result.orderId,
              }),
            }
          );

          if (
            verification.status ===
            "SUCCESS"
          ) {
            Alert.alert(
              "Registration Successful",
              "Your participation has been confirmed."
            );
          } else if (
            verification.status ===
            "PENDING"
          ) {
            Alert.alert(
              "Payment Pending",
              "Your payment is still being processed. Please check again shortly."
            );
          } else {
            Alert.alert(
              "Payment Failed",
              "The payment was not completed. You can try again."
            );
          }

          await fetchEventDetails();
          return;
        }

        /*
          Application already exists.

          This prevents the Kaarigar from submitting
          the same application again.
        */

        if (application) {
          return;
        }

        /*
          Profile must contain craft information
          before applying.
        */

        if (
          !user?.craftType ||
          !user.description
        ) {
          Alert.alert(
            "Profile Incomplete",
            "Add your craft type and description in your profile before applying."
          );
          return;
        }

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
          "Your application will be reviewed by the admin."
        );

        await fetchEventDetails();

        return;
      }

      /* =====================================================
         VISITOR
      ===================================================== */

      /*
        FREE EVENT
      */

      if (event.visitorFee <= 0) {
        await api("/rsvps", {
          method: "POST",
          body: JSON.stringify({
            eventId: event._id,
          }),
        });
      } else {
        /*
          PAID EVENT
          → Create Cashfree order
        */

        const order = await api(
          "/payments/create-order",
          {
            method: "POST",
            body: JSON.stringify({
              eventId: event._id,
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

        const verification = await api(
          "/payments/verify",
          {
            method: "POST",
            body: JSON.stringify({
              orderId: result.orderId,
            }),
          }
        );

        /*
          Do not mark registration successful
          unless Cashfree verification succeeds.
        */

        if (
          verification.status !==
          "SUCCESS"
        ) {
          Alert.alert(
            verification.status ===
              "PENDING"
              ? "Payment Pending"
              : "Payment Failed",
            verification.status ===
              "PENDING"
              ? "Your payment is still being processed."
              : "The payment was not completed."
          );

          return;
        }
      }

      Alert.alert(
        "Registration Successful",
        "You have successfully registered for this event."
      );

      await fetchEventDetails();
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setRegistering(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <ActivityIndicator
          size="large"
          color="#C65D3A"
        />

        <Text className="mt-3 text-[#75665E]">
          Loading event...
        </Text>
      </View>
    );
  }

  /* =====================================================
     EVENT NOT FOUND
  ===================================================== */

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF] px-6">
        <Text className="text-center text-[16px] text-[#75665E]">
          Event not found.
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 rounded-[12px] bg-[#C65D3A] px-6 py-3"
        >
          <Text className="font-bold text-white">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* =====================================================
     REGISTRATION STATUS
  ===================================================== */

  const isVisitorRegistered =
    !isKaarigar &&
    rsvp?.status === "REGISTERED" &&
    rsvp.paymentStatus === "PAID";

  const isKaarigarRegistered =
    isKaarigar &&
    application?.status === "APPROVED" &&
    application?.paymentStatus === "PAID";

  const isRegistered =
    isVisitorRegistered ||
    isKaarigarRegistered;

  const ticketNumber = isKaarigar
    ? application?.ticketNumber
    : rsvp?.ticketNumber;

  return (
    <ScrollView
      className="flex-1 bg-[#FFF8EF]"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* =================================================
          BACK
      ================================================= */}

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text className="font-semibold text-[#C65D3A]">
          Back
        </Text>
      </TouchableOpacity>

      {/* =================================================
          EVENT NAME
      ================================================= */}

      <Text className="mt-6 text-[27px] font-extrabold text-[#3B2923]">
        {event.name}
      </Text>

      {/* =================================================
          EVENT IMAGE
      ================================================= */}

      {event.image ? (
        <Image
          source={{ uri: event.image }}
          accessibilityLabel={`${event.name} event image`}
          className="mt-5 h-56 w-full rounded-[16px]"
          resizeMode="cover"
        />
      ) : null}

      {/* =================================================
          DATE
      ================================================= */}

      <View className="mt-4 flex-row items-center">
        <Ionicons
          name="calendar-outline"
          size={18}
          color="#75665E"
        />

        <Text className="ml-2 text-[15px] text-[#75665E]">
          {new Date(
            event.date
          ).toLocaleDateString()}
        </Text>
      </View>

      {/* =================================================
          LOCATION
      ================================================= */}

      <View className="mt-2 flex-row items-center">
        <Ionicons
          name="location-outline"
          size={18}
          color="#75665E"
        />

        <Text
          numberOfLines={1}
          className="ml-2 flex-1 text-[15px] text-[#75665E]"
        >
          {event.location}
        </Text>
      </View>

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      {event.description && (
        <Text className="mt-5 text-[15px] leading-[23px] text-[#75665E]">
          {event.description}
        </Text>
      )}

      {/* =================================================
          FEE / REGISTRATION CARD
      ================================================= */}

      {isRegistered ? (
        <View className="mt-6 rounded-[18px] bg-white p-5">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E7F2E3]">
              <Text className="text-[20px] font-bold text-[#6F8060]">
                ✓
              </Text>
            </View>

            <View className="ml-3">
              <Text className="text-[18px] font-bold text-[#3B2923]">
                Registered
              </Text>

              <Text className="mt-1 text-[12px] text-[#75665E]">
                Your registration is confirmed
              </Text>
            </View>
          </View>

          <View className="mt-5 rounded-[14px] bg-[#FFF8EF] p-4">
            <Text className="text-[11px] font-bold tracking-[1.5px] text-[#75665E]">
              TICKET NUMBER
            </Text>

            <Text className="mt-2 text-[21px] font-extrabold tracking-[1px] text-[#C65D3A]">
              {ticketNumber ||
                "Generating..."}
            </Text>
          </View>
        </View>
      ) : (
        <View className="mt-6 rounded-[16px] bg-white p-5">
          <Text className="text-[14px] text-[#75665E]">
            {isKaarigar
              ? "Kaarigar Participation Fee"
              : "Visitor Entry Fee"}
          </Text>

          <Text className="mt-1 text-[23px] font-bold text-[#C65D3A]">
            ₹
            {isKaarigar
              ? event.kaarigarFee
              : event.visitorFee}
          </Text>
        </View>
      )}

      {/* =================================================
          KAARIGAR
      ================================================= */}

      {isKaarigar ? (
        <View className="mt-6 rounded-[16px] bg-white p-5">
          {application ? (
            <>
              <Text className="text-center text-[15px] font-bold text-[#3B2923]">
                Application:{" "}
                {application.status}
              </Text>

              {application.status ===
                "APPROVED" && (
                <>
                  {!isKaarigarRegistered && (
                    <Text className="mt-2 text-center text-[14px] text-[#75665E]">
                      Payment:{" "}
                      {application.paymentStatus ||
                        "UNPAID"}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={
                      registering ||
                      isKaarigarRegistered
                    }
                    className={`mt-4 items-center rounded-[12px] py-3 ${
                      isKaarigarRegistered
                        ? "bg-[#D8CFC8]"
                        : "bg-[#C65D3A]"
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        isKaarigarRegistered
                          ? "text-[#75665E]"
                          : "text-white"
                      }`}
                    >
                      {isKaarigarRegistered
                        ? "Registered"
                        : registering
                          ? "Opening Payment..."
                          : "Pay Now"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <TouchableOpacity
              onPress={handleRegister}
              disabled={registering}
              className="items-center rounded-[12px] bg-[#C65D3A] py-3"
            >
              <Text className="font-bold text-white">
                {registering
                  ? "Applying..."
                  : "Apply for Event"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* =================================================
           VISITOR
        ================================================= */

        <TouchableOpacity
          onPress={handleRegister}
          disabled={
            registering || isRegistered
          }
          className={`mt-6 items-center rounded-[14px] py-4 ${
            isRegistered
              ? "bg-[#D8CFC8]"
              : "bg-[#C65D3A]"
          }`}
        >
          <Text
            className={`text-[16px] font-bold ${
              isRegistered
                ? "text-[#75665E]"
                : "text-white"
            }`}
          >
            {isRegistered
              ? "Registered"
              : registering
                ? event.visitorFee > 0
                  ? "Processing Payment..."
                  : "Registering..."
                : event.visitorFee > 0
                  ? "Register"
                  : "Register for Event"}
          </Text>
        </TouchableOpacity>
      )}

      {/* =================================================
          PARTICIPATING KAARIGARS
      ================================================= */}

      <Text className="mb-4 mt-9 text-[20px] font-bold text-[#3B2923]">
        Participating Kaarigars
      </Text>

      {kaarigars.length === 0 ? (
        <View className="rounded-[16px] bg-white p-5">
          <Text className="text-center text-[#75665E]">
            No participating kaarigars yet.
          </Text>
        </View>
      ) : (
        kaarigars.map((item) => (
          <View
            key={item._id}
            className="mb-3 rounded-[16px] bg-white p-5"
          >
            <Text className="text-[17px] font-bold text-[#3B2923]">
              {item.kaarigar.name}
            </Text>

            <Text className="mt-1 text-[14px] font-semibold text-[#C65D3A]">
              {item.craftType}
            </Text>

            {item.description && (
              <Text className="mt-2 text-[14px] leading-[21px] text-[#75665E]">
                {item.description}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}