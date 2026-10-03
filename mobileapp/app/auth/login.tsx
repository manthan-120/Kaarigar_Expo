import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { api } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import usePasswordVisibility from "../../hooks/usePasswordVisibility";
import { useAuth } from "../../hooks/useAuth";
import KeyboardAvoider from "../../components/KeyboardAvoider";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";

export default function LoginScreen() {
  const { role } = useLocalSearchParams();
  const { saveAuth } = useAuth();

  const selectedRole =
    role === "kaarigar"
      ? "Kaarigar"
      : role === "admin"
      ? "Admin"
      : "Visitor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    showPassword,
    togglePasswordVisibility,
  } = usePasswordVisibility();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      await saveAuth(data);

      console.log("Login response:", data);

      if (data.user.role === "KAARIGAR") {
        router.replace("/kaarigar/dashboard");
      } else if (data.user.role === "VISITOR") {
        router.replace("/visitor/dashboard");
      } else if (data.user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      }
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoider>
      <View className="bg-[#FFF8EF]">

        {/* Header */}
        <View className="mt-20 items-center">
          <Text className="text-[22px] font-extrabold tracking-[1px] text-[#C65D3A]">
            KAARIGAR
          </Text>

          <Text className="text-[10px] font-bold tracking-[4px] text-[#6F8060]">
            EXPO
          </Text>

          <Text className="mt-2 text-[20px] font-bold text-[#3B2923]">
            {selectedRole} Login
          </Text>

          <Text className="mt-2 text-[13px] text-[#75665E]">
            {role === "admin"
              ? "Sign in to manage the expo."
              : "Welcome back! Login to continue."}
          </Text>
        </View>

        {/* Form */}
        <View className="mt-10">

          <Text className="mb-2 text-[14px] font-semibold text-[#3B2923]">
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={role === "admin" ? "Admin email" : "Enter your email"}
            placeholderTextColor="#A89B94"
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4 text-[15px] text-[#3B2923]"
          />

          <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
            Password
          </Text>

          <View className="flex-row items-center rounded-[14px] border border-[#E5D8CC] bg-white">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter a password"
              placeholderTextColor="#A89B94"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 px-4 py-4 text-black"
            />

            <Pressable
              onPress={togglePasswordVisibility}
              className="px-4"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#75665E"
              />
            </Pressable>
          </View>

          {/* Login */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`mt-7 items-center rounded-[14px] py-4 ${
              loading ? "bg-[#D8B5A5]" : "bg-[#C65D3A]"
            }`}
          >
            <Text className="text-[16px] font-bold text-white">
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* Register */}
          {role !== "admin" && (
            <View className="mt-6 flex-row justify-center">
              <Text className="text-[14px] text-[#75665E]">
                Don't have an account?{" "}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (role === "kaarigar") {
                    router.push("/auth/register-kaarigar");
                  } else {
                    router.push("/auth/register-visitor");
                  }
                }}
                disabled={loading}
              >
                <Text
                  className={`text-[14px] font-bold ${
                    loading ? "text-[#D8B5A5]" : "text-[#C65D3A]"
                  }`}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          className="mt-8 items-center"
        >
          <Text
            className={`text-[14px] font-semibold ${
              loading ? "text-[#BDB1AA]" : "text-[#6F8060]"
            }`}
          >
            Back
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoider>
  );
}