import { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import EventCarousel from "../../components/EventCarrousel";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";

import EventCard from "../../components/EventCard";
import WelcomeCard from "../../components/WelcomeCard";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardDrawer from "../../components/DashboardDrawer";
import { useAuth } from "../../hooks/useAuth";
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

const isUpcoming = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(date).getTime() >= today.getTime();
};

export default function KaarigarDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        Alert.alert(
          "Exit Kaarigar Expo?",
          "Do you want to exit the app?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Exit",
              style: "destructive",
              onPress: () => BackHandler.exitApp(),
            },
          ]
        );

        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  const fetchData = async () => {
    try {
      const data = await api("/events");
      setEvents(data.events || []);
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

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Get only the next 5 upcoming melas
  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((event) => isUpcoming(event.date))
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
        .slice(0, 5),
    [events]
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <ActivityIndicator
          size="large"
          color="#C65D3A"
        />

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
              fetchData();
            }}
          />
        }
      >

        {/* Header */}

        <DashboardHeader
          onMenuPress={() => setDrawerVisible(true)}
        />

        {/* Welcome */}

        <WelcomeCard
          name={user?.name || "Kaarigar"}
          detail={user?.craftType}
          description="Find exhibitions, explore upcoming melas, and manage your participation."
        />

        <EventCarousel events={events} />

        {/* Upcoming Melas */}

        <View className="mt-9">

          <View className="mb-4 flex-row items-center justify-between">

            <Text className="text-[20px] font-bold text-[#3B2923]">
              Upcoming Melas
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/kaarigar/events")}
            >
              <Text className="text-[13px] font-bold text-[#C65D3A]">
                View All 
              </Text>
            </TouchableOpacity>

          </View>

          {upcomingEvents.length === 0 ? (
            <View className="rounded-[16px] bg-white p-5">
              <Text className="text-center text-[14px] text-[#75665E]">
                No upcoming melas available.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 12,
              }}
            >
              {upcomingEvents.map((event) => (
                <View
                  key={event._id}
                  className="w-[300px]"
                >
                  <EventCard
                    event={event}
                    fee={event.kaarigarFee}
                    feeLabel="Kaarigar Participation Fee"
                    onPress={() =>
                      router.push({
                        pathname: "/visitor/event-details",
                        params: {
                          id: event._id,
                          role: "kaarigar",
                        },
                      })
                    }
                    actionLabel="View Event"
                  />
                </View>
              ))}
            </ScrollView>
          )}

        </View>

      </ScrollView>

      {/* Drawer */}

      <DashboardDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        role="KAARIGAR"
      />

    </View>
  );
}