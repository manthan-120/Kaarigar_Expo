import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <ActivityIndicator size="large" color="#C65D3A" />
        <Text className="mt-3 text-[#75665E]">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
        <Text className="text-[#75665E]">
          No user information available.
        </Text>
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
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="font-semibold text-[#C65D3A]">Back</Text>
        </TouchableOpacity>

        <View className="mt-8 rounded-[22px] bg-[#3B2923] p-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#C65D3A]">
            <Text className="text-[30px] font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text className="mt-5 text-[12px] font-bold tracking-[2px] text-[#E7A88F]">
            MY ACCOUNT
          </Text>
          <Text className="mt-2 text-[28px] font-bold text-white">
            {user.name}
          </Text>
          <View className="mt-3 self-start rounded-full bg-white/10 px-3 py-1.5">
            <Text className="text-[12px] font-bold tracking-[1px] text-[#EADAD0]">
              {user.role}
            </Text>
          </View>
        </View>

        <Text className="mb-4 mt-9 text-[12px] font-bold tracking-[2px] text-[#C65D3A]">
          ACCOUNT DETAILS
        </Text>

        <View className="rounded-[18px] bg-white p-5">
          <View className="border-b border-[#EADDD2] pb-4">
            <Text className="text-[12px] font-semibold uppercase tracking-wide text-[#75665E]">
              Full name
            </Text>
            <Text className="mt-2 text-[16px] font-semibold text-[#3B2923]">
              {user.name}
            </Text>
          </View>

          <View className="pt-4">
            <Text className="text-[12px] font-semibold uppercase tracking-wide text-[#75665E]">
              Email address
            </Text>
            <Text className="mt-2 text-[16px] text-[#3B2923]">
              {user.email}
            </Text>
          </View>
        </View>

        {user.role === "KAARIGAR" && (
          <>
            <Text className="mb-4 mt-9 text-[12px] font-bold tracking-[2px] text-[#C65D3A]">
              CRAFT PROFILE
            </Text>

            <View className="rounded-[18px] bg-white p-5">
              <Text className="text-[12px] font-semibold uppercase tracking-wide text-[#75665E]">
                Craft type
              </Text>
              <Text className="mt-2 text-[16px] font-semibold text-[#3B2923]">
                {user.craftType || "Not provided"}
              </Text>

              <View className="mt-5 border-t border-[#EADDD2] pt-4">
                <Text className="text-[12px] font-semibold uppercase tracking-wide text-[#75665E]">
                  About your craft
                </Text>
                <Text className="mt-2 text-[15px] leading-[22px] text-[#3B2923]">
                  {user.description || "Not provided"}
                </Text>
              </View>
            </View>
          </>
        )}

        <View className="mt-9 flex-row items-center justify-between border-t border-[#EADDD2] pt-6">
          <View className="mr-4 flex-1">
            <Text className="text-[15px] font-semibold text-[#3B2923]">
              Sign out of this account
            </Text>
            <Text className="mt-1 text-[12px] text-[#75665E]">
              You will return to the public home page.
            </Text>
          </View>

          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace("/");
            }}
            className="rounded-[12px] border border-[#C65D3A] px-5 py-3"
          >
            <Text className="font-bold text-[#C65D3A]">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}