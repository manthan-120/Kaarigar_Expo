import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  visitorFee: number;
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

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [kaarigars, setKaarigars] = useState<Kaarigar[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const [eventData, kaarigarData] = await Promise.all([
        api(`/events/${id}`),
        api(`/events/${id}/kaarigars`),
      ]);

      setEvent(eventData.event);
      setKaarigars(kaarigarData.kaarigars);
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
  }, [id]);

  const handleRegister = async () => {
    if (!event) return;

    try {
      setRegistering(true);

      await api("/rsvps", {
        method: "POST",
        body: JSON.stringify({
          eventId: event._id,
        }),
      });

      Alert.alert(
        "Registration Successful",
        "You have successfully registered for this event."
      );
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <ActivityIndicator size="large" color="#C65D3A" />
        <Text className="mt-3 text-[#75665E]">
          Loading event...
        </Text>
      </View>
    );
  }

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
          <Text className="font-bold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#FFF8EF]"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="font-semibold text-[#C65D3A]">
          ← Back
        </Text>
      </TouchableOpacity>

      <Text className="mt-6 text-[27px] font-extrabold text-[#3B2923]">
        {event.name}
      </Text>

      <Text className="mt-4 text-[15px] text-[#75665E]">
        📅 {new Date(event.date).toLocaleDateString()}
      </Text>

      <Text className="mt-2 text-[15px] text-[#75665E]">
        📍 {event.location}
      </Text>

      {event.description && (
        <Text className="mt-5 text-[15px] leading-[23px] text-[#75665E]">
          {event.description}
        </Text>
      )}

      <View className="mt-6 rounded-[16px] bg-white p-5">
        <Text className="text-[14px] text-[#75665E]">
          Visitor Entry Fee
        </Text>

        <Text className="mt-1 text-[23px] font-bold text-[#C65D3A]">
          ₹{event.visitorFee}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={registering}
        className="mt-6 items-center rounded-[14px] bg-[#C65D3A] py-4"
      >
        <Text className="text-[16px] font-bold text-white">
          {registering ? "Registering..." : "Register for Event"}
        </Text>
      </TouchableOpacity>

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