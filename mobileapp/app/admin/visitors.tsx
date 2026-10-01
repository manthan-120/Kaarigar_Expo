import { Ionicons } from "@expo/vector-icons";
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

import ProfileButton from "../../components/ProfileButton";
import VisitorCard from "../../components/VisitorCard";
import { useAuth } from "../../hooks/useAuth";
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

  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);

      const data = await api("/events");

      setEvents(data.events || []);
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
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-start justify-between">
          <View>
            <Text className="text-[22px] font-extrabold tracking-[1px] text-[#C65D3A]">
              KAARIGAR
            </Text>

            <Text className="text-[10px] font-bold tracking-[4px] text-[#6F8060]">
              EXPO
            </Text>
          </View>

          <ProfileButton />
        </View>

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6"
        >
          <Text className="font-semibold text-[#C65D3A]">
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Page Title */}
        <Text className="mt-6 text-[25px] font-bold text-[#3B2923]">
          Registered Visitors
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Select a mela to view registered visitors.
        </Text>

        {/* Select Mela */}
        <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
          Select Mela
        </Text>

        {loadingEvents ? (
          <View className="items-center py-8">
            <ActivityIndicator
              size="small"
              color="#C65D3A"
            />
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
              activeOpacity={0.8}
              className={`mb-3 rounded-[16px] p-5 ${
                selectedEventId === event._id
                  ? "bg-[#F1DDD3]"
                  : "bg-white"
              }`}
            >
              {/* Event Name */}
              <Text className="text-[17px] font-bold text-[#3B2923]">
                {event.name}
              </Text>

              {/* Date */}
              <View className="mt-2 flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#75665E"
                />

                <Text className="ml-2 text-[13px] text-[#75665E]">
                  {new Date(event.date).toLocaleDateString()}
                </Text>
              </View>

              {/* Location */}
              <View className="mt-1 flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#75665E"
                />

                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-[13px] text-[#75665E]"
                >
                  {event.location}
                </Text>
              </View>
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
                <ActivityIndicator
                  size="small"
                  color="#C65D3A"
                />
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
    </View>
  );
}