import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProfileButton from "../../components/ProfileButton";
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

  ticketNumber?: string;
};

export default function AdminVisitorsScreen() {
  const [visitors, setVisitors] = useState<
    VisitorRegistration[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);

      // Get all events
      const eventData = await api("/events");

      const events: Event[] = eventData.events || [];

      // Get visitors for every event
      const visitorResponses = await Promise.all(
        events.map(async (event) => {
          try {
            const data = await api(
              `/rsvps/event/${event._id}`
            );

            const registrations = Array.isArray(
              data.rsvps
            )
              ? data.rsvps
              : Array.isArray(data.visitors)
              ? data.visitors
              : [];

            return registrations;
          } catch (error) {
            console.log(
              `Failed to fetch visitors for ${event.name}`,
              error
            );

            return [];
          }
        })
      );

      // Combine visitors from all events
      const allVisitors =
        visitorResponses.flat();

      setVisitors(allVisitors);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load visitors"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchVisitors();
            }}
            tintColor="#C65D3A"
          />
        }
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
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="mt-6 text-[25px] font-bold text-[#3B2923]">
          Registered Visitors
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          View all visitors registered for melas.
        </Text>

        {/* Total */}
        {!loading && (
          <View className="mt-7 rounded-[16px] bg-white p-5">
            <Text className="text-[13px] font-semibold text-[#75665E]">
              Total Registrations
            </Text>

            <Text className="mt-1 text-[26px] font-bold text-[#C65D3A]">
              {visitors.length}
            </Text>
          </View>
        )}

        {/* Visitors */}
        <Text className="mb-4 mt-8 text-[20px] font-bold text-[#3B2923]">
          Visitors
        </Text>

        {/* Loading */}
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator
              size="large"
              color="#C65D3A"
            />

            <Text className="mt-3 text-[13px] text-[#75665E]">
              Loading visitors...
            </Text>
          </View>
        ) : visitors.length === 0 ? (
          /* Empty */
          <View className="rounded-[16px] bg-white p-6">
            <Text className="text-center text-[#75665E]">
              No visitors registered yet.
            </Text>
          </View>
        ) : (
          /* Visitor Cards */
          visitors.map((registration) => (
            <VisitorCard
              key={registration._id}
              registration={registration}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}