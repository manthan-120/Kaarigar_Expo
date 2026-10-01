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

  const selectedRole = role === "kaarigar" ? "Kaarigar" : "Visitor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
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
      }
  };

  return (
    <KeyboardAvoider>
      <View className="bg-[#FFF8EF]">

      {/* Header */}
      <View className="mt-20">
        <Text className="text-[22px] font-extrabold tracking-[1px] text-[#C65D3A]">
              KAARIGAR
        </Text>

        <Text className="text-[10px] font-bold tracking-[4px] text-[#6F8060]">
              EXPO
        </Text>

        <Text className="mt-2 text-[24px] font-bold text-[#3B2923]">
          {selectedRole} Login
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Welcome back! Login to continue.
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
          placeholder="Enter your email"
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
            className="flex-1 px-4 py-4"
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
          className="mt-7 items-center rounded-[14px] bg-[#C65D3A] py-4"
        >
          <Text className="text-[16px] font-bold text-white">
            Login
          </Text>
        </TouchableOpacity>

        {/* Register */}
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
          >
            <Text className="text-[14px] font-bold text-[#C65D3A]">
              Register
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-8 items-center"
      >
        <Text className="text-[14px] font-semibold text-[#6F8060]">
          Back
        </Text>
      </TouchableOpacity>

      </View>
    </KeyboardAvoider>
  );
}