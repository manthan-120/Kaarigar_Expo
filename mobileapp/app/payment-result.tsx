import { useEffect } from "react";
import {
  Alert,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

export default function PaymentResult() {
  const { orderId, status } =
    useLocalSearchParams<{
      orderId?: string;
      status?: string;
    }>();

  useEffect(() => {
    if (status === "SUCCESS") {
      Alert.alert(
        "Payment Successful",
        "Your Kaarigar participation payment is complete.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                "/kaarigar/dashboard"
              ),
          },
        ]
      );

      return;
    }

    if (status === "FAILED") {
      Alert.alert(
        "Payment Failed",
        "The payment was not completed.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                "/kaarigar/dashboard"
              ),
          },
        ]
      );

      return;
    }

    Alert.alert(
      "Payment Pending",
      "Payment status is still pending.",
      [
        {
          text: "OK",
          onPress: () =>
            router.replace(
              "/kaarigar/dashboard"
            ),
        },
      ]
    );
  }, [status, orderId]);

  return (
    <View className="flex-1 items-center justify-center bg-[#FFF8EF]">
      <ActivityIndicator
        size="large"
        color="#C65D3A"
      />

      <Text className="mt-4 text-[#75665E]">
        Processing payment...
      </Text>
    </View>
  );
}