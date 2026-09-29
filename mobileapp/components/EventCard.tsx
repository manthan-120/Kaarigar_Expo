import { Image, Text, TouchableOpacity, View } from "react-native";

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
    <>
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
      <Text className="text-[19px] font-bold text-[#3B2923]">
        {event.name}
      </Text>

      {/* Date */}
      <Text className="mt-2 text-[14px] text-[#75665E]">
        📅 {new Date(event.date).toLocaleDateString()}
      </Text>

      {/* Location */}
      <Text className="mt-1 text-[14px] text-[#75665E]">
        📍 {event.location}
      </Text>

      {/* Description */}
      {event.description && (
        <Text className="mt-3 text-[14px] leading-[21px] text-[#75665E]">
          {event.description}
        </Text>
      )}

      {/* Fee */}
      {fee !== undefined && feeLabel && (
        <View className="mt-4 rounded-[12px] bg-[#FFF8EF] p-3">
          <Text className="text-[13px] font-semibold text-[#3B2923]">
            {feeLabel}: ₹{fee}
          </Text>
        </View>
      )}

      {/* Action */}
      {actionLabel && (
        <Text className="mt-4 text-center font-bold text-[#C65D3A]">
          {actionLabel}
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="mb-4 rounded-[18px] bg-white p-5"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className="mb-4 rounded-[18px] bg-white p-5">
      {content}
    </View>
  );
}