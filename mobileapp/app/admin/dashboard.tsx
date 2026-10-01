import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DashboardHeader from "../../components/DashboardHeader";
import DashboardDrawer from "../../components/DashboardDrawer";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

type Application = {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  kaarigar: {
    _id: string;
    name: string;
    email: string;
  };
  craftType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
};

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [applicationsData, eventsData] = await Promise.all([
        api("/applications"),
        api("/events"),
      ]);

      setApplications(applicationsData.applications || []);
      setEvents(eventsData.events || []);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load admin dashboard"
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

  const updateStatus = async (
    applicationId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingId(applicationId);

      await api(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      Alert.alert("Success", `Application ${status.toLowerCase()} successfully.`);
      await fetchData();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = applications.filter((a) => a.status === "PENDING").length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;

  const statCard = (
    title: string,
    value: number,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View className="w-[48%] rounded-[18px] bg-white p-5">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF8EF]">
        <Ionicons name={icon} size={21} color="#C65D3A" />
      </View>
      <Text className="mt-4 text-[26px] font-extrabold text-[#3B2923]">
        {value}
      </Text>
      <Text className="mt-1 text-[12px] font-semibold text-[#75665E]">
        {title}
      </Text>
    </View>
  );

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
        <DashboardHeader
          onMenuPress={() => setDrawerVisible(true)}
        />

        <Text className="text-[28px] font-extrabold text-[#3B2923]">
          Admin Overview
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Welcome back, {user?.name || "Admin"}. Manage your melas and applications.
        </Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#C65D3A" />
            <Text className="mt-3 text-[#75665E]">Loading analytics...</Text>
          </View>
        ) : (
          <>
            <View className="mt-7 flex-row flex-wrap justify-between gap-y-3">
              {statCard("Total Melas", events.length, "calendar-outline")}
              {statCard("Applications", applications.length, "document-text-outline")}
              {statCard("Pending", pending, "time-outline")}
              {statCard("Approved", approved, "checkmark-circle-outline")}
            </View>

            <View className="mt-3 flex-row justify-between">
              <View className="w-[48%] rounded-[18px] bg-white p-5">
                <Text className="text-[26px] font-extrabold text-[#C65D3A]">
                  {rejected}
                </Text>
                <Text className="mt-1 text-[12px] font-semibold text-[#75665E]">
                  Rejected
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/admin/events")}
                className="w-[48%] rounded-[18px] bg-[#3B2923] p-5"
              >
                <Text className="text-[15px] font-bold text-white">
                  Manage Melas
                </Text>
                <Text className="mt-2 text-[12px] text-[#EADAD0]">
                  Create and update events
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-9 flex-row items-center justify-between">
              <Text className="text-[20px] font-bold text-[#3B2923]">
                Kaarigar Applications
              </Text>
              <Text className="text-[12px] font-semibold text-[#75665E]">
                {pending} pending
              </Text>
            </View>

            {applications.length === 0 ? (
              <View className="mt-4 rounded-[18px] bg-white p-5">
                <Text className="text-center text-[14px] text-[#75665E]">
                  No Kaarigar applications found.
                </Text>
              </View>
            ) : (
              applications.slice(0, 5).map((application) => (
                <View
                  key={application._id}
                  className="mt-4 rounded-[18px] bg-white p-5"
                >
                  <Text className="text-[17px] font-bold text-[#3B2923]">
                    {application.kaarigar.name}
                  </Text>
                  <Text className="mt-1 text-[13px] text-[#75665E]">
                    {application.kaarigar.email}
                  </Text>
                  <Text className="mt-3 text-[14px] font-semibold text-[#C65D3A]">
                    Craft: {application.craftType}
                  </Text>

                  <View className="mt-3 rounded-[10px] bg-[#FFF8EF] p-3">
                    <Text className="text-[13px] font-semibold text-[#3B2923]">
                      Event: {application.event.name}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color="#75665E" />
                      <Text className="ml-2 text-[12px] text-[#75665E]">
                        {new Date(application.event.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="mt-1 flex-row items-center">
                      <Ionicons name="location-outline" size={14} color="#75665E" />
                      <Text className="ml-2 text-[12px] text-[#75665E]">
                        {application.event.location}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-3 text-[14px] font-bold text-[#3B2923]">
                    Status: {application.status}
                  </Text>

                  {application.status === "PENDING" && (
                    <View className="mt-4 flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => updateStatus(application._id, "APPROVED")}
                        disabled={updatingId === application._id}
                        className="flex-1 items-center rounded-[10px] bg-[#6F8060] py-3"
                      >
                        <Text className="font-bold text-white">
                          {updatingId === application._id ? "Updating..." : "Approve"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => updateStatus(application._id, "REJECTED")}
                        disabled={updatingId === application._id}
                        className="flex-1 items-center rounded-[10px] bg-[#C65D3A] py-3"
                      >
                        <Text className="font-bold text-white">Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}

            {applications.length > 5 && (
              <TouchableOpacity
                onPress={() => router.push("/admin/dashboard")}
                className="mt-4 items-center"
              >
                <Text className="font-bold text-[#C65D3A]">
                  Showing latest applications
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.push("/admin/visitors")}
              className="mt-8 rounded-[18px] bg-white p-5"
            >
              <Text className="text-[18px] font-bold text-[#3B2923]">
                Registered Visitors
              </Text>
              <Text className="mt-2 text-[13px] text-[#75665E]">
                Select a mela to view its registered visitors.
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <DashboardDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        role="ADMIN"
      />
    </View>
  );
}
