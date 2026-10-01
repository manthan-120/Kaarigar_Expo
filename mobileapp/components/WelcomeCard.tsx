import { Text, View } from "react-native";

type WelcomeCardProps = {
  name?: string;
  detail?: string;
  description: string;
};

export default function WelcomeCard({
  name,
  detail,
  description,
}: WelcomeCardProps) {
  return (
    <View className="rounded-[22px] bg-[#3B2923] p-6">
      <Text className="text-[13px] text-[#EADAD0]">
        Welcome back
      </Text>

      <Text className="mt-2 text-[28px] font-bold text-white">
        {name || "Welcome"}
      </Text>

      {detail && (
        <Text className="mt-2 text-[14px] font-semibold text-[#E7A88F]">
          {detail}
        </Text>
      )}

      <Text className="mt-3 text-[14px] leading-[21px] text-[#EADAD0]">
        {description}
      </Text>
    </View>
  );
}
