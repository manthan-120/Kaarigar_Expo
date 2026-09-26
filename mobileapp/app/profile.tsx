import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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
    <View className="flex-1 bg-[#FFF8EF] px-6 pt-16">
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="font-semibold text-[#C65D3A]">
          ← Back
        </Text>
      </TouchableOpacity>

      <Text className="mt-8 text-[28px] font-extrabold text-[#C65D3A]">
        Profile
      </Text>

      <View className="mt-8 rounded-[18px] bg-white p-6">
        <Text className="text-[13px] text-[#75665E]">
          Name
        </Text>

        <Text className="mt-1 text-[18px] font-bold text-[#3B2923]">
          {user.name}
        </Text>

        <Text className="mt-5 text-[13px] text-[#75665E]">
          Email
        </Text>

        <Text className="mt-1 text-[16px] text-[#3B2923]">
          {user.email}
        </Text>

        <Text className="mt-5 text-[13px] text-[#75665E]">
          Role
        </Text>

        <Text className="mt-1 text-[16px] font-semibold text-[#C65D3A]">
          {user.role}
        </Text>

        {user.role === "KAARIGAR" && (
          <>
            <Text className="mt-5 text-[13px] text-[#75665E]">
              Craft Type
            </Text>

            <Text className="mt-1 text-[16px] text-[#3B2923]">
              {user.craftType || "Not provided"}
            </Text>

            <Text className="mt-5 text-[13px] text-[#75665E]">
              About Your Craft
            </Text>

            <Text className="mt-1 text-[15px] leading-[22px] text-[#3B2923]">
              {user.description || "Not provided"}
            </Text>
          </>
        )}
      </View>
      <TouchableOpacity
        onPress={async () => {
          await logout();
          router.replace("/");
        }}
        className="mt-8 items-center rounded-[14px] bg-[#C65D3A] py-4"
      >
        <Text className="font-bold text-white">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}