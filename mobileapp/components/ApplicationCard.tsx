import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Application = {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  craftType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
};

type ApplicationCardProps = {
  application: Application;
  onPay?: () => void;
  paying?: boolean;
};

export default function ApplicationCard({
  application,
  onPay,
  paying = false,
}: ApplicationCardProps) {
  const canPay =
    application.status === "APPROVED" &&
    application.paymentStatus === "UNPAID";

  return (
    <View className="mb-4 rounded-[16px] bg-white p-5">

      {/* Event */}
      <Text className="text-[17px] font-bold text-[#3B2923]">
        {application.event.name}
      </Text>

      {/* Date */}
      <Text className="mt-2 text-[14px] text-[#75665E]">
        📅{" "}
        {new Date(
          application.event.date
        ).toLocaleDateString()}
      </Text>

      {/* Location */}
      <Text className="mt-1 text-[14px] text-[#75665E]">
        📍 {application.event.location}
      </Text>

      {/* Application Status */}
      <View className="mt-4 rounded-[10px] bg-[#F4EEE8] px-3 py-2">
        <Text className="text-[13px] font-semibold text-[#3B2923]">
          Application: {application.status}
        </Text>
      </View>

      {/* Payment Status */}
      {application.paymentStatus && (
        <Text className="mt-2 text-[13px] text-[#75665E]">
          Payment: {application.paymentStatus}
        </Text>
      )}

      {/* Pay Button */}
      {canPay && onPay && (
        <TouchableOpacity
          onPress={onPay}
          disabled={paying}
          className="mt-4 items-center rounded-[12px] bg-[#C65D3A] py-3"
        >
          <Text className="font-bold text-white">
            {paying ? "Opening Payment..." : "Pay Now"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Paid State */}
      {application.status === "APPROVED" &&
        application.paymentStatus === "PAID" && (
          <View className="mt-4 items-center rounded-[12px] bg-[#E8EEE3] py-3">
            <Text className="font-bold text-[#6F8060]">
              Payment Completed
            </Text>
          </View>
        )}
    </View>
  );
}