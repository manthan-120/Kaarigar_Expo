import { Text, View } from "react-native";

type VisitorRegistration = {
  _id: string;

  visitor: {
    _id: string;
    name: string;
    email: string;
  };

  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };

  status: "REGISTERED" | "CANCELLED";

  paymentStatus?: "PENDING" | "PAID" | "REFUNDED";

  ticketNumber?: string;
};

type VisitorCardProps = {
  registration: VisitorRegistration;
};

export default function VisitorCard({
  registration,
}: VisitorCardProps) {
  return (
    <View className="mb-3 rounded-[16px] bg-white p-5">

      {/* Event */}
      <View className="mb-4 rounded-[12px] bg-[#FFF8EF] p-3">
        <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-[#75665E]">
          Event
        </Text>

        <Text className="mt-1 text-[16px] font-bold text-[#3B2923]">
          {registration.event?.name || "Unknown Event"}
        </Text>

        <Text className="mt-1 text-[11px] text-[#75665E]">
          Event ID: {registration.event?._id || "N/A"}
        </Text>
      </View>

      {/* Visitor */}
      <Text className="text-[17px] font-bold text-[#3B2923]">
        {registration.visitor?.name || "Unknown Visitor"}
      </Text>

      <Text className="mt-1 text-[13px] text-[#75665E]">
        {registration.visitor?.email || "No email"}
      </Text>

      {/* Status */}
      <Text className="mt-3 text-[13px] font-semibold text-[#C65D3A]">
        Status: {registration.status}
      </Text>

      {/* Payment */}
      {registration.paymentStatus && (
        <Text className="mt-1 text-[13px] text-[#75665E]">
          Payment: {registration.paymentStatus}
        </Text>
      )}

      {/* Ticket */}
      {registration.ticketNumber && (
        <View className="mt-3 rounded-[10px] bg-[#FFF8EF] p-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-[#75665E]">
            Ticket Number
          </Text>

          <Text className="mt-1 text-[15px] font-bold tracking-[1px] text-[#C65D3A]">
            {registration.ticketNumber}
          </Text>
        </View>
      )}
    </View>
  );
}