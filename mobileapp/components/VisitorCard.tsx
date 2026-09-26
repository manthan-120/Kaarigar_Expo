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
};

type VisitorCardProps = {
  registration: VisitorRegistration;
};

export default function VisitorCard({
  registration,
}: VisitorCardProps) {
  return (
    <View className="mb-3 rounded-[16px] bg-white p-5">
      <Text className="text-[17px] font-bold text-[#3B2923]">
        {registration.visitor.name}
      </Text>

      <Text className="mt-1 text-[13px] text-[#75665E]">
        {registration.visitor.email}
      </Text>

      <Text className="mt-3 text-[13px] font-semibold text-[#C65D3A]">
        Status: {registration.status}
      </Text>

      {registration.paymentStatus && (
        <Text className="mt-1 text-[13px] text-[#75665E]">
          Payment: {registration.paymentStatus}
        </Text>
      )}
    </View>
  );
}