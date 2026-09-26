import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function ProfileButton() {
  return (
    <Pressable
      onPress={() => router.push("/profile")}
      className="h-11 w-11 items-center justify-center rounded-full bg-white"
    >
      <Ionicons
        name="person-outline"
        size={22}
        color="#C65D3A"
      />
    </Pressable>
  );
}