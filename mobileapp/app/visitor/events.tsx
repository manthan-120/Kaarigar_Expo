import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import EventCard from "../../components/EventCard";
import { api } from "../../services/api";

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

export default function VisitorEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/events")
      .then((data) =>
        setEvents(
          (data.events || []).sort(
            (a: Event, b: Event) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
          )
        )
      )
      .catch((error) =>
        Alert.alert("Error", error instanceof Error ? error.message : "Failed to load events")
      )
      .finally(() => setLoading(false));
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}>
        <Text onPress={() => router.back()} className="font-semibold text-[#C65D3A]">← Back</Text>
        <Text className="mt-7 text-[28px] font-extrabold text-[#C65D3A]">Events</Text>
        <Text className="mt-2 text-[14px] text-[#75665E]">Explore all melas and exhibitions.</Text>

        {events.length === 0 ? (
          <View className="mt-8 rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">No events available.</Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event._id} className="mt-5">
              <EventCard
                event={event}
                fee={event.visitorFee}
                feeLabel="Visitor Entry Fee"
                onPress={() =>
                  router.push({
                    pathname: "/visitor/event-details",
                    params: { id: event._id },
                  })
                }
                actionLabel="View Event"
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
