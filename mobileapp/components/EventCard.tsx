import { Text, TouchableOpacity, View } from "react-native";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
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
      <Text className="text-[19px] font-bold text-[#3B2923]">
        {event.name}
      </Text>

      <Text className="mt-2 text-[14px] text-[#75665E]">
        📅 {new Date(event.date).toLocaleDateString()}
      </Text>

      <Text className="mt-1 text-[14px] text-[#75665E]">
        📍 {event.location}
      </Text>

      {event.description && (
        <Text className="mt-3 text-[14px] leading-[21px] text-[#75665E]">
          {event.description}
        </Text>
      )}

      {fee !== undefined && feeLabel && (
        <View className="mt-4 rounded-[12px] bg-[#FFF8EF] p-3">
          <Text className="text-[13px] font-semibold text-[#3B2923]">
            {feeLabel}: ₹{fee}
          </Text>
        </View>
      )}

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