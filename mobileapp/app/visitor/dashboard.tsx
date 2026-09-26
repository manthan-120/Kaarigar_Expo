import { useEffect, useState } from "react";
import { router } from "expo-router";
import EventCard from "../../components/EventCard";
import { useAuth } from "../../hooks/useAuth";
import ProfileButton from "../../components/ProfileButton";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
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
  kaarigarFee: number;
};

export default function VisitorDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user} = useAuth();

  const fetchEvents = async () => {
    try {
      const data = await api("/events");

      const upcomingEvents = data.events.filter(
        (event: Event) => new Date(event.date) >= new Date()
      );

      setEvents(upcomingEvents);
    } catch (error) {
      console.log("Failed to fetch events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
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
        <View className="mb-3 flex-row items-center justify-end">
          <ProfileButton />
        </View>

        <Text className="text-[28px] font-extrabold text-[#C65D3A]">
          KAARIGAR EXPO
        </Text>

        <Text className="mt-2 text-[24px] font-bold text-[#3B2923]">
          Welcome, {user?.name || "Visitor"}
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Explore upcoming exhibitions and melas.
        </Text>

        <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
          Upcoming Events
        </Text>

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#C65D3A" />
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
                  pathname: "/visitor/event-details",
                  params: { id: event._id },
                })
              }
              actionLabel="View Event →"
            />

          ))
        )}
      </ScrollView>
    </View>
  );
}