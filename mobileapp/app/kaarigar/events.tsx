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
import EventCard from "../../components/EventCard";
import ProfileButton from "../../components/ProfileButton";
import { api } from "../../services/api";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  kaarigarFee: number;
  image?: string;
};

export default function KaarigarEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await api("/events");
        const sortedEvents = (data.events || []).sort(
          (firstEvent: Event, secondEvent: Event) =>
            new Date(secondEvent.date).getTime() -
            new Date(firstEvent.date).getTime()
        );
        setEvents(sortedEvents);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Failed to load events"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <ActivityIndicator size="large" color="#C65D3A" />
        <Text className="mt-3 text-[#75665E]">Loading events...</Text>
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
      >
        <View className="mb-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="font-semibold text-[#C65D3A]">Back</Text>
          </TouchableOpacity>
          <ProfileButton />
        </View>

        <Text className="text-[28px] font-extrabold text-[#C65D3A]">
          KAARIGAR EXPO
        </Text>
        <Text className="mt-2 text-[25px] font-bold text-[#3B2923]">
          All Events
        </Text>
        <Text className="mt-2 text-[14px] text-[#75665E]">
          Explore every upcoming mela and event.
        </Text>

        <View className="mt-8">
          {events.length === 0 ? (
            <View className="rounded-[16px] bg-white p-5">
              <Text className="text-center text-[#75665E]">
                No upcoming events available.
              </Text>
            </View>
          ) : (
            events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                fee={event.kaarigarFee}
                feeLabel="Kaarigar Participation Fee"
                onPress={() =>
                  router.push({
                    pathname: "/visitor/event-details",
                    params: { id: event._id, role: "kaarigar" },
                  })
                }
                actionLabel="View Event"
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
