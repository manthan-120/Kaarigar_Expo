import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { api } from "../../services/api";

export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { saveAuth } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Details", "Please enter email and password.");
      return;
    }

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Make sure this account is actually an Admin
      if (data.user.role !== "ADMIN") {
        Alert.alert(
          "Access Denied",
          "This account does not have Admin access."
        );
        return;
      }

      await saveAuth(data);

      router.replace("/admin/dashboard");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  };

  return (
    <View className="flex-1 bg-[#FFF8EF] px-6">
      <View className="mt-24">
        <Text className="text-[28px] font-extrabold text-[#C65D3A]">
          KAARIGAR EXPO
        </Text>

        <Text className="mt-8 text-[26px] font-bold text-[#3B2923]">
          Admin Login
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Sign in to manage the expo.
        </Text>

        <Text className="mb-2 mt-10 text-[14px] font-semibold text-[#3B2923]">
          Email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Admin email"
          placeholderTextColor="#A89B94"
          keyboardType="email-address"
          autoCapitalize="none"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Password
        </Text>

        <View className="flex-row items-center rounded-[14px] border border-[#E5D8CC] bg-white">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Admin password"
            placeholderTextColor="#A89B94"
            secureTextEntry={!showPassword}
            className="flex-1 px-4 py-4"
          />

          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            className="px-4"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#75665E"
            />
          </Pressable>
        </View>
        <TouchableOpacity
          onPress={handleLogin}
          className="mt-7 items-center rounded-[14px] bg-[#C65D3A] py-4"
        >
          <Text className="text-[16px] font-bold text-white">
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 items-center"
        >
          <Text className="text-[14px] font-semibold text-[#6F8060]">
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}