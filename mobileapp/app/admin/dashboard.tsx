import { router } from "expo-router";
import { useEffect, useState } from "react";
import ProfileButton from "../../components/ProfileButton";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";

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

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const data = await api("/applications");
      setApplications(data.applications);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (
    applicationId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingId(applicationId);

      await api(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      });

      Alert.alert(
        "Success",
        `Application ${status.toLowerCase()} successfully.`
      );

      fetchApplications();
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

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        <View className="mb-3 flex-row items-center justify-end">
          <ProfileButton />
        </View>

        <Text className="text-[28px] font-extrabold text-[#C65D3A]">
          KAARIGAR EXPO
        </Text>

        <Text className="mt-8 text-[26px] font-bold text-[#3B2923]">
          Admin Dashboard
        </Text>

        <Text className="mt-2 text-[15px] text-[#75665E]">
          Manage melas, kaarigars and visitors.
        </Text>

        {/* Manage Melas */}
        <TouchableOpacity
          onPress={() => router.push("/admin/events")}
          className="mt-8 rounded-[18px] bg-white p-5"
        >
          <Text className="text-[18px] font-bold text-[#3B2923]">
            🎪 Manage Melas
          </Text>

          <Text className="mt-2 text-[13px] text-[#75665E]">
            Event management will be added next.
          </Text>
        </TouchableOpacity>

        {/* Kaarigar Applications */}
        <View className="mt-4 rounded-[18px] bg-white p-5">
          <Text className="text-[18px] font-bold text-[#3B2923]">
            🎨 Kaarigar Applications
          </Text>

          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#C65D3A" />

              <Text className="mt-3 text-[#75665E]">
                Loading applications...
              </Text>
            </View>
          ) : applications.length === 0 ? (
            <Text className="mt-4 text-center text-[14px] text-[#75665E]">
              No Kaarigar applications found.
            </Text>
          ) : (
            applications.map((application) => (
              <View
                key={application._id}
                className="mt-4 rounded-[14px] border border-[#E5D8CC] p-4"
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

                {application.description && (
                  <Text className="mt-2 text-[13px] leading-[19px] text-[#75665E]">
                    {application.description}
                  </Text>
                )}

                <View className="mt-3 rounded-[10px] bg-[#FFF8EF] p-3">
                  <Text className="text-[13px] font-semibold text-[#3B2923]">
                    Event: {application.event.name}
                  </Text>

                  <Text className="mt-1 text-[12px] text-[#75665E]">
                    📅{" "}
                    {new Date(
                      application.event.date
                    ).toLocaleDateString()}
                  </Text>

                  <Text className="mt-1 text-[12px] text-[#75665E]">
                    📍 {application.event.location}
                  </Text>
                </View>

                <Text className="mt-3 text-[14px] font-bold text-[#3B2923]">
                  Status: {application.status}
                </Text>

                {application.status === "PENDING" && (
                  <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() =>
                        updateStatus(application._id, "APPROVED")
                      }
                      disabled={updatingId === application._id}
                      className="flex-1 items-center rounded-[10px] bg-[#6F8060] py-3"
                    >
                      <Text className="font-bold text-white">
                        {updatingId === application._id
                          ? "Updating..."
                          : "Approve"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        updateStatus(application._id, "REJECTED")
                      }
                      disabled={updatingId === application._id}
                      className="flex-1 items-center rounded-[10px] bg-[#C65D3A] py-3"
                    >
                      <Text className="font-bold text-white">
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Registered Visitors */}
        <TouchableOpacity
          onPress={() => router.push("/admin/visitors")}
          className="mt-4 rounded-[18px] bg-white p-5"
        >
          <Text className="text-[18px] font-bold text-[#3B2923]">
            👥 Registered Visitors
          </Text>

          <Text className="mt-2 text-[13px] text-[#75665E]">
            Visitor management will be added next.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}