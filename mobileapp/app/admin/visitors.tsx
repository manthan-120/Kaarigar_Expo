import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VisitorCard from "../../components/VisitorCard";
import { api } from "../../services/api";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
};

type VisitorRegistration = {
  _id: string;
  visitor: {
    _id: string;
    name: string;
    email: string;
  };
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  status: "REGISTERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "PAID" | "REFUNDED";
};

export default function AdminVisitorsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    null
  );
  const [visitors, setVisitors] = useState<VisitorRegistration[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingVisitors, setLoadingVisitors] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await api("/events");
      setEvents(data.events);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load events"
      );
    } finally {
      setLoadingEvents(false);
    }
  };

    const fetchVisitors = async (eventId: string) => {
    try {
        setSelectedEventId(eventId);
        setLoadingVisitors(true);

        const data = await api(`/rsvps/event/${eventId}`);

        console.log("Visitors API Response:", data);

        const visitorList = Array.isArray(data.visitors)
        ? data.visitors
        : Array.isArray(data.rsvps)
        ? data.rsvps
        : [];

        setVisitors(visitorList);
    } catch (error) {
        Alert.alert(
        "Error",
        error instanceof Error
            ? error.message
            : "Failed to load visitors"
        );
    } finally {
        setLoadingVisitors(false);
    }
    };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-[#FFF8EF]"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="font-semibold text-[#C65D3A]">
          ← Back
        </Text>
      </TouchableOpacity>

      <Text className="mt-6 text-[28px] font-extrabold text-[#C65D3A]">
        KAARIGAR EXPO
      </Text>

      <Text className="mt-6 text-[25px] font-bold text-[#3B2923]">
        Registered Visitors
      </Text>

      <Text className="mt-2 text-[14px] text-[#75665E]">
        Select a mela to view registered visitors.
      </Text>

      {/* Events */}
      <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
        Select Mela
      </Text>

      {loadingEvents ? (
        <View className="items-center py-8">
          <ActivityIndicator size="small" color="#C65D3A" />
        </View>
      ) : events.length === 0 ? (
        <View className="rounded-[16px] bg-white p-5">
          <Text className="text-center text-[#75665E]">
            No melas available.
          </Text>
        </View>
      ) : (
        events.map((event) => (
          <TouchableOpacity
            key={event._id}
            onPress={() => fetchVisitors(event._id)}
            className={`mb-3 rounded-[16px] p-5 ${
              selectedEventId === event._id
                ? "bg-[#F1DDD3]"
                : "bg-white"
            }`}
          >
            <Text className="text-[17px] font-bold text-[#3B2923]">
              {event.name}
            </Text>

            <Text className="mt-2 text-[13px] text-[#75665E]">
              📅 {new Date(event.date).toLocaleDateString()}
            </Text>

            <Text className="mt-1 text-[13px] text-[#75665E]">
              📍 {event.location}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* Visitors */}
      {selectedEventId && (
        <>
          <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
            Visitors
          </Text>

          {loadingVisitors ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#C65D3A" />
            </View>
          ) : visitors.length === 0 ? (
            <View className="rounded-[16px] bg-white p-5">
              <Text className="text-center text-[#75665E]">
                No visitors registered for this mela.
              </Text>
            </View>
          ) : (
            visitors.map((registration) => (
              <VisitorCard
                key={registration._id}
                registration={registration}
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}