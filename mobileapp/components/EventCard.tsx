import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  image?: string;
};

type EventCardProps = {
  event: Event;
  fee?: number;
  feeLabel?: string;
  onPress?: () => void;
  actionLabel?: string;
};

export default function EventCard({
  event,
  fee,
  feeLabel,
  onPress,
  actionLabel,
}: EventCardProps) {
  const content = (
    <View className="flex-1">
      {/* Event Image */}
      {event.image ? (
        <Image
          source={{ uri: event.image }}
          accessibilityLabel={`${event.name} event image`}
          className="mb-4 h-44 w-full rounded-[14px]"
          resizeMode="cover"
          onError={(error) => {
            console.log("IMAGE LOAD ERROR:", error.nativeEvent.error);
            console.log("IMAGE URL:", event.image);
          }}
        />
      ) : (
        <View className="mb-4 h-44 w-full items-center justify-center rounded-[14px] bg-[#EADED2]">
          <Text className="text-xs font-bold tracking-[2px] text-[#75665E]">
            KAARIGAR EXPO
          </Text>
        </View>
      )}

      {/* Event Name */}
      <Text
        numberOfLines={2}
        className="h-[48px] text-[19px] font-bold text-[#3B2923]"
      >
        {event.name}
      </Text>

      {/* Date */}
      <View className="mt-4 flex-row items-center">
        <Ionicons
          name="calendar-outline"
          size={18}
          color="#75665E"
        />

        <Text className="ml-2 text-[15px] text-[#75665E]">
          {new Date(event.date).toLocaleDateString()}
        </Text>
      </View>

      {/* Location */}
      <View className="mt-2 flex-row items-center">
        <Ionicons
          name="location-outline"
          size={18}
          color="#75665E"
        />

        <Text
          numberOfLines={1}
          className="ml-2 flex-1 text-[15px] text-[#75665E]"
        >
          {event.location}
        </Text>
      </View>

      {/* Description - fixed space */}
      <View className="mt-3">
        {event.description ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-[14px] text-[#75665E]"
          >
            {event.description}
          </Text>
        ) : null}
      </View>

      {/* Fee - always reserves same space */}
      <View className="mt-4 h-[48px] justify-center">
        {fee !== undefined && feeLabel ? (
          <View className="justify-center rounded-[12px] bg-[#FFF8EF] p-3">
            <Text
              numberOfLines={2}
              className="text-[13px] font-semibold text-[#3B2923]"
            >
              {feeLabel}: ₹{fee}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action - always at bottom */}
      <View className="mt-auto min-h-[24px] justify-end">
        {actionLabel ? (
          <Text className="text-center font-bold text-[#C65D3A]">
            {actionLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="mb-4 h-[450px] rounded-[18px] bg-white p-5"
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className="mb-4 h-[500px] rounded-[18px] bg-white p-5">
      {content}
    </View>
  );
}