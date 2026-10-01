import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <View className="flex-1 items-center justify-center px-6">

        {/* Logo */}
         <Text className="text-[32px] font-extrabold tracking-[1px] text-[#C65D3A]">
              KAARIGAR
          </Text>

          <Text className="text-[14px] font-bold tracking-[4px] text-[#6F8060]">
              EXPO
          </Text>

        <Text className="mt-1.5 w-full text-center text-[14px] tracking-[1px] text-[#6F8060]">
          Craft • Culture • Community
        </Text>

        {/* Hero */}
        <View className="mb-[35px] mt-[45px] items-center">
          <View className="mb-[18px] h-20 w-20 items-center justify-center rounded-full bg-[#F8E3DA]">
            <Ionicons
              name="color-palette-outline"
              size={40}
              color="#C65D3A"
            />
          </View>

          <Text className="text-center text-[26px] font-bold text-[#3B2923]">
            Welcome to Kaarigar Expo
          </Text>

          <Text className="mt-3 max-w-[350px] text-center text-[15px] leading-[23px] text-[#75665E]">
            Discover traditional crafts, meet talented artisans,
            and explore upcoming exhibitions.
          </Text>
        </View>

        {/* Role */}
        <Text className="mb-4 text-[18px] font-semibold text-[#3B2923]">
          Who are you?
        </Text>

        <View className="w-full flex-row gap-[14px]">

          {/* Kaarigar */}
          <TouchableOpacity
            onPress={() => router.push("/auth/login?role=kaarigar")}
            className="flex-1 items-center rounded-[18px] bg-white px-3 py-6"
            style={{
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }}
          >
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-[#F8E3DA]">
              <Ionicons
                name="color-palette-outline"
                size={30}
                color="#C65D3A"
              />
            </View>

            <Text className="text-[17px] font-bold text-[#3B2923]">
              Kaarigar
            </Text>

            <Text className="mt-[5px] text-center text-[12px] text-[#75665E]">
              Showcase your craft
            </Text>
          </TouchableOpacity>

          {/* Visitor */}
          <TouchableOpacity
            onPress={() => router.push("/auth/login?role=visitor")}
            className="flex-1 items-center rounded-[18px] bg-white px-3 py-6"
            style={{
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }}
          >
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-[#E8EEE3]">
              <Ionicons
                name="person-outline"
                size={30}
                color="#6F8060"
              />
            </View>

            <Text className="text-[17px] font-bold text-[#3B2923]">
              Visitor
            </Text>

            <Text className="mt-[5px] text-center text-[12px] text-[#75665E]">
              Explore upcoming melas
            </Text>
          </TouchableOpacity>

        </View>

        {/* Admin */}
        <TouchableOpacity
          onPress={() => router.push("/admin/login")}
          className="mt-7 flex-row items-center px-6 py-3"
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#C65D3A"
          />

          <Text className="ml-2 text-[14px] font-semibold text-[#C65D3A]">
            Admin Login
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}