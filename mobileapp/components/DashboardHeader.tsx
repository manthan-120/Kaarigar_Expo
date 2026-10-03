import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type DashboardHeaderProps = {
  onMenuPress: () => void;
};

export default function DashboardHeader({
  onMenuPress,
}: DashboardHeaderProps) {
  return (
    <View className="mb-6 flex-row items-start justify-between">
      <View>
        <Text className="text-[22px] font-extrabold tracking-[1px] text-[#C65D3A]">
          KAARIGAR
        </Text>
        <Text className="text-[10px] font-bold tracking-[4px] text-[#6F8060]">
          EXPO
        </Text>
      </View>

      <Pressable
        onPress={onMenuPress}
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons
          name="menu-outline"
          size={25}
          color="#C65D3A"
        />
      </Pressable>
    </View>
  );
}
