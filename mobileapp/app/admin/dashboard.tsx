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
  BackHandler,
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
    ticketNumber?: string;
  };

  craftType: string;
  description?: string;
  ticketNumber?: string;
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

  const [showAllApplications, setShowAllApplications] =
    useState(false);

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
      setLoading(true);

      const [applicationsData, eventsData] = await Promise.all([
        api("/applications"),
        api("/events"),
      ]);

      setApplications(applicationsData.applications || []);
      setEvents(eventsData.events || []);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load admin dashboard"
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

      Alert.alert(
        "Success",
        `Application ${status.toLowerCase()} successfully.`
      );

      await fetchData();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = applications.filter(
    (application) => application.status === "PENDING"
  ).length;

  const approved = applications.filter(
    (application) => application.status === "APPROVED"
  ).length;

  const rejected = applications.filter(
    (application) => application.status === "REJECTED"
  ).length;

  const visibleApplications = showAllApplications
    ? applications
    : applications.slice(0, 5);

  const statCard = (
    title: string,
    value: number,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View className="w-[48%] rounded-[20px] bg-white p-5">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EC]">
        <Ionicons
          name={icon}
          size={21}
          color="#C65D3A"
        />
      </View>

      <Text className="mt-4 text-[26px] font-extrabold text-[#3B2923]">
        {value}
      </Text>

      <Text className="mt-1 text-[12px] font-semibold text-[#75665E]">
        {title}
      </Text>
    </View>
  );

  const getStatusConfig = (
    status: Application["status"]
  ) => {
    if (status === "APPROVED") {
      return {
        icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
        background: "#EEF5EB",
        text: "#6F8060",
      };
    }

    if (status === "REJECTED") {
      return {
        icon: "close-circle" as keyof typeof Ionicons.glyphMap,
        background: "#FCEDEA",
        text: "#C65D3A",
      };
    }

    return {
      icon: "time" as keyof typeof Ionicons.glyphMap,
      background: "#FFF5E8",
      text: "#A97838",
    };
  };

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
              fetchData();
            }}
            tintColor="#C65D3A"
          />
        }
      >
        {/* Header */}
        <DashboardHeader
          onMenuPress={() => setDrawerVisible(true)}
        />
        {/* Welcome */}
        <View className="mt-3">
          <Text className="text-[15px] font-semibold text-[#3B2923]">
            Welcome back, {user?.name || "Admin"}.
          </Text>

          <Text className="mt-1 text-[14px] leading-[22px] text-[#75665E]">
            Manage your melas and applications.
          </Text>
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator
              size="large"
              color="#C65D3A"
            />

            <Text className="mt-4 text-[14px] text-[#75665E]">
              Loading analytics...
            </Text>
          </View>
        ) : (
          <>
            {/* Statistics */}
            <View className="mt-8">
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {statCard(
                  "Total Melas",
                  events.length,
                  "calendar-outline"
                )}

                {statCard(
                  "Applications",
                  applications.length,
                  "document-text-outline"
                )}

                {statCard(
                  "Pending",
                  pending,
                  "time-outline"
                )}

                {statCard(
                  "Approved",
                  approved,
                  "checkmark-circle-outline"
                )}
              </View>
              {/* Rejected */}
              <View className="mt-3">
                <View className="w-[48%] rounded-[20px] bg-white p-5">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FCEDEA]">
                    <Ionicons
                      name="close-circle-outline"
                      size={21}
                      color="#C65D3A"
                    />
                  </View>

                  <Text className="mt-4 text-[26px] font-extrabold text-[#3B2923]">
                    {rejected}
                  </Text>

                  <Text className="mt-1 text-[12px] font-semibold text-[#75665E]">
                    Rejected
                  </Text>
                </View>
              </View>
              {/* Registered Visitors */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push("/admin/visitors")
                }
                className="mt-3 rounded-[20px] bg-white p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-[18px] font-bold text-[#3B2923]">
                      Registered Visitors
                    </Text>

                    <Text className="mt-2 text-[13px] leading-[19px] text-[#75665E]">
                      Select a mela to view its registered visitors.
                    </Text>
                  </View>

                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FFF3EC]">
                    <Ionicons
                      name="people-outline"
                      size={21}
                      color="#C65D3A"
                    />
                  </View>
                </View>

                <View className="mt-4 flex-row items-center">
                  <Text className="text-[13px] font-bold text-[#C65D3A]">
                    View visitors
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color="#C65D3A"
                    style={{ marginLeft: 5 }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Applications Header */}
            <View className="mt-10 flex-row items-end justify-between">
              <View className="flex-1">
                <Text className="text-[20px] font-bold text-[#3B2923]">
                  Kaarigar Applications
                </Text>

                <Text className="mt-1 text-[12px] text-[#75665E]">
                  Review recent applications
                </Text>
              </View>

              <View className="rounded-full bg-[#FFF0E8] px-3 py-1.5">
                <Text className="text-[11px] font-bold text-[#C65D3A]">
                  {pending} pending
                </Text>
              </View>
            </View>

            {/* Applications */}
            {applications.length === 0 ? (
              <View className="mt-5 items-center rounded-[20px] bg-white px-5 py-8">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FFF8EF]">
                  <Ionicons
                    name="document-text-outline"
                    size={23}
                    color="#C65D3A"
                  />
                </View>

                <Text className="mt-4 text-[15px] font-semibold text-[#3B2923]">
                  No applications
                </Text>

                <Text className="mt-1 text-center text-[12px] text-[#75665E]">
                  No Kaarigar applications have been submitted yet.
                </Text>
              </View>
            ) : (
              <>
                {visibleApplications.map((application) => {
                  const statusConfig = getStatusConfig(
                    application.status
                  );

                  return (
                    <View
                      key={application._id}
                      className="mt-4 rounded-[20px] bg-white p-5"
                    >
                      {/* Applicant */}
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="text-[17px] font-bold text-[#3B2923]">
                            {application.kaarigar.name}
                          </Text>

                          <Text className="mt-1 text-[13px] text-[#75665E]">
                            {application.kaarigar.email}
                          </Text>
                        </View>

                        {/* Status */}
                        <View
                          className="flex-row items-center rounded-full px-3 py-1.5"
                          style={{
                            backgroundColor:
                              statusConfig.background,
                          }}
                        >
                          <Ionicons
                            name={statusConfig.icon}
                            size={13}
                            color={statusConfig.text}
                          />

                          <Text
                            className="ml-1 text-[10px] font-bold"
                            style={{
                              color: statusConfig.text,
                            }}
                          >
                            {application.status}
                          </Text>
                        </View>
                      </View>

                      {/* Craft */}
                      <View className="mt-4 flex-row items-center">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FFF8EF]">
                          <Ionicons
                            name="color-palette-outline"
                            size={16}
                            color="#C65D3A"
                          />
                        </View>

                        <View className="ml-3">
                          <Text className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#9A8A80]">
                            Craft
                          </Text>

                          <Text className="mt-0.5 text-[14px] font-semibold text-[#3B2923]">
                            {application.craftType}
                          </Text>
                        </View>
                      </View>

                      {/* Event Details */}
                      <View className="mt-4 rounded-[14px] bg-[#FFF8EF] p-4">
                        <Text className="text-[13px] font-bold text-[#3B2923]">
                          {application.event.name}
                        </Text>

                        <View className="mt-2 flex-row items-center">
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#75665E"
                          />

                          <Text className="ml-2 text-[12px] text-[#75665E]">
                            {new Date(
                              application.event.date
                            ).toLocaleDateString()}
                          </Text>
                        </View>

                        <View className="mt-1.5 flex-row items-center">
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#75665E"
                          />

                          <Text
                            numberOfLines={1}
                            className="ml-2 flex-1 text-[12px] text-[#75665E]"
                          >
                            {application.event.location}
                          </Text>
                        </View>
                      </View>

                      {/* Actions */}
                      {application.status === "PENDING" && (
                        <View className="mt-4 flex-row gap-3">
                          {/* Approve */}
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                              updateStatus(
                                application._id,
                                "APPROVED"
                              )
                            }
                            disabled={
                              updatingId === application._id
                            }
                            className="flex-1 flex-row items-center justify-center rounded-[12px] bg-[#6F8060] py-3"
                          >
                            <Ionicons
                              name="checkmark-outline"
                              size={17}
                              color="#FFFFFF"
                            />

                            <Text className="ml-1.5 font-bold text-white">
                              {updatingId === application._id
                                ? "Updating..."
                                : "Approve"}
                            </Text>
                          </TouchableOpacity>

                          {/* Reject */}
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                              updateStatus(
                                application._id,
                                "REJECTED"
                              )
                            }
                            disabled={
                              updatingId === application._id
                            }
                            className="flex-1 flex-row items-center justify-center rounded-[12px] bg-[#C65D3A] py-3"
                          >
                            <Ionicons
                              name="close-outline"
                              size={18}
                              color="#FFFFFF"
                            />

                            <Text className="ml-1.5 font-bold text-white">
                              {updatingId === application._id
                                ? "Updating..."
                                : "Reject"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* View All / Show Less */}
                {applications.length > 5 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      setShowAllApplications(
                        (previous) => !previous
                      )
                    }
                    className="mt-5 flex-row items-center justify-center"
                  >
                    <Text className="text-[13px] font-bold text-[#C65D3A]">
                      {showAllApplications
                        ? "Show less"
                        : `View all ${applications.length} applications`}
                    </Text>

                    <Ionicons
                      name={
                        showAllApplications
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={16}
                      color="#C65D3A"
                      style={{ marginLeft: 5 }}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
      {/* Floating Add / Manage Melas Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/admin/create-event")}
        className="absolute bottom-16 right-6 h-14 w-14 items-center justify-center rounded-full bg-[#C65D3A]"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.2,
          shadowRadius: 5,
        }}
      >
        <Ionicons
          name="add"
          size={30}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      {/* Drawer */}
      <DashboardDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        role="ADMIN"
      />
    </View>
  );
}