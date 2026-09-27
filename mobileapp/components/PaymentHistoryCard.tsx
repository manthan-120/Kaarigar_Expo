import { Text, View } from "react-native";

type PaymentHistoryCardProps = {
  payment: {
    event?: {
      name?: string;
      date?: string;
      location?: string;
    };
    amount: number;
    status: string;
    purpose?: "VISITOR_RSVP" | "KAARIGAR_APPLICATION";
    paymentDate: string;
    cashfreePaymentId?: string;
    cashfreeOrderId?: string;
  };
};

export default function PaymentHistoryCard({
  payment,
}: PaymentHistoryCardProps) {
  const formattedDate = new Date(
    payment.paymentDate
  ).toLocaleString();

  return (
    <View className="mb-4 rounded-[16px] bg-white p-5">
      <Text className="text-[18px] font-bold text-[#3B2923]">
        {payment.event?.name || "Event"}
      </Text>

      <Text className="mt-2 text-[#75665E]">
        {payment.purpose === "VISITOR_RSVP"
            ? "Event Registration Fee"
            : "Kaarigar Participation Fee"}
      </Text>

      <Text className="mt-3 text-[20px] font-bold text-[#C65D3A]">
        ₹{payment.amount}
      </Text>

      <Text className="mt-2 font-bold text-green-600">
        {payment.status === "SUCCESS"
          ? "PAID"
          : payment.status}
      </Text>

      <Text className="mt-1 text-[#75665E]">
        {formattedDate}
      </Text>

      {payment.cashfreePaymentId && (
        <Text className="mt-2 text-[12px] text-[#75665E]">
          Payment ID: {payment.cashfreePaymentId}
        </Text>
      )}
    </View>
  );
}