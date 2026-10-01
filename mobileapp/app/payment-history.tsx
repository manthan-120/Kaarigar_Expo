import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import PaymentHistoryCard from "../components/PaymentHistoryCard";
import { api } from "../services/api";

export default function PaymentHistoryScreen() {
  const { purpose } = useLocalSearchParams<{ purpose?: string }>();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const endpoint = purpose
        ? `/payments/my-history?purpose=${purpose}`
        : "/payments/my-history";
      const data = await api(endpoint);
      setPayments(data.payments || []);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, [purpose]));

  return (
    <View className="flex-1 bg-[#FFF8EF]">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}>
        <Text onPress={() => router.back()} className="font-semibold text-[#C65D3A]">← Back</Text>
        <Text className="mt-7 text-[28px] font-extrabold text-[#C65D3A]">Payment History</Text>
        <Text className="mt-2 text-[14px] text-[#75665E]">View your completed and processed payments.</Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#C65D3A" />
          </View>
        ) : payments.length === 0 ? (
          <View className="mt-8 rounded-[16px] bg-white p-5">
            <Text className="text-center text-[#75665E]">No payments yet.</Text>
          </View>
        ) : (
          payments.map((payment) => (
            <View key={payment.paymentId} className="mt-4">
              <PaymentHistoryCard payment={payment} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
