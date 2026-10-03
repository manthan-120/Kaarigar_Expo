import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProfileButton from "../../components/ProfileButton";
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

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 50,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchEvents();
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
          Events
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          View and manage all melas.
        </Text>

        {/* Create Mela */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/admin/create-event")}
          className="mt-7 flex-row items-center justify-center rounded-[14px] bg-[#C65D3A] py-4"
        >
          <Ionicons
            name="add"
            size={20}
            color="#FFFFFF"
          />

          <Text className="ml-2 text-[16px] font-bold text-white">
            Create Mela
          </Text>
        </TouchableOpacity>

        {/* All Melas */}
        <Text className="mb-4 mt-9 text-[20px] font-bold text-[#3B2923]">
          All Melas
        </Text>

        {/* Loading */}
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator
              size="large"
              color="#C65D3A"
            />

            <Text className="mt-3 text-[13px] text-[#75665E]">
              Loading melas...
            </Text>
          </View>
        ) : events.length === 0 ? (
          /* Empty State */
          <View className="items-center rounded-[20px] bg-white px-5 py-10">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FFF8EF]">
              <Ionicons
                name="calendar-outline"
                size={25}
                color="#C65D3A"
              />
            </View>

            <Text className="mt-4 text-[16px] font-bold text-[#3B2923]">
              No melas yet
            </Text>

            <Text className="mt-1 text-center text-[13px] text-[#75665E]">
              Create your first mela using the button above.
            </Text>
          </View>
        ) : (
          /* Events */
          events.map((event) => (
            <View
              key={event._id}
              className="mb-4 rounded-[20px] bg-white p-5"
            >
              {/* Event Image */}
              {event.image ? (
                <Image
                  source={{ uri: event.image }}
                  className="mb-4 h-44 w-full rounded-[14px]"
                  resizeMode="cover"
                />
              ) : (
                <View className="mb-4 h-44 w-full items-center justify-center rounded-[14px] bg-[#E5D8CC]">
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color="#9A8A80"
                  />

                  <Text className="mt-2 text-[12px] text-[#75665E]">
                    No image available
                  </Text>
                </View>
              )}

              {/* Event Name */}
              <Text className="text-[18px] font-bold text-[#3B2923]">
                {event.name}
              </Text>

              {/* Date */}
              <View className="mt-4 flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#75665E"
                />

                <Text className="ml-2 text-[14px] text-[#75665E]">
                  {new Date(
                    event.date
                  ).toLocaleDateString()}
                </Text>
              </View>

              {/* Location */}
              <View className="mt-2 flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#75665E"
                />

                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-[14px] text-[#75665E]"
                >
                  {event.location}
                </Text>
              </View>

              {/* Description */}
              {event.description ? (
                <Text
                  numberOfLines={3}
                  className="mt-3 text-[13px] leading-[19px] text-[#75665E]"
                >
                  {event.description}
                </Text>
              ) : null}

              {/* Fees */}
              <View className="mt-4 rounded-[12px] bg-[#FFF8EF] p-3">
                <Text className="text-[12px] font-semibold text-[#75665E]">
                  Visitor Fee
                </Text>

                <Text className="mt-1 text-[14px] font-bold text-[#C65D3A]">
                  ₹{event.visitorFee}
                </Text>

                <Text className="mt-2 text-[12px] font-semibold text-[#75665E]">
                  Kaarigar Fee
                </Text>

                <Text className="mt-1 text-[14px] font-bold text-[#C65D3A]">
                  ₹{event.kaarigarFee}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}