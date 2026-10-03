import { router } from "expo-router";
import { useState } from "react";
import { api } from "../../services/api";
import KeyboardAvoider from "../../components/KeyboardAvoider";
import { Ionicons } from "@expo/vector-icons";
import usePasswordVisibility from "../../hooks/usePasswordVisibility";
import { useAuth } from "../../hooks/useAuth";
import { validateRegistration } from "../../utils/validation";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function KaarigarRegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // const [phone, setPhone] = useState("");
  const [craftType, setCraftType] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const { saveAuth } = useAuth();
 
  const {
  showPassword,
  togglePasswordVisibility,
  } = usePasswordVisibility();

  const handleRegister = async () => {
  if (!name || !email || !craftType || !description || !password) {
    Alert.alert("Missing Details", "Please fill all fields.");
    return;
  }

  const validationError = validateRegistration(email, password);

  if (validationError) {
    Alert.alert("Invalid Details", validationError);
    return;
  }

  try {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role: "KAARIGAR",
        craftType,
        description,
      }),
    });

    await saveAuth(data);

    Alert.alert("Registration Successful", data.message, [
      {
        text: "Continue",
        onPress: () => router.replace("/kaarigar/dashboard"),
      },
    ]);
  } catch (error) {
    Alert.alert(
      "Registration Failed",
      error instanceof Error ? error.message : "Something went wrong"
    );
    }
  };

  return (
    <KeyboardAvoider>
    
         <Text className="text-[22px] font-extrabold tracking-[1px] text-[#C65D3A]">
              KAARIGAR
          </Text>

          <Text className="text-[10px] font-bold tracking-[4px] text-[#6F8060]">
              EXPO
          </Text>

        <Text className="mt-6 text-[25px] font-bold text-[#3B2923]">
          Create Kaarigar Account
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Register as an artisan and showcase your craft.
        </Text>

        {/* Name */}
        <Text className="mb-2 mt-8 text-[14px] font-semibold text-[#3B2923]">
          Full Name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor="#A89B94"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Email */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#A89B94"
          keyboardType="email-address"
          autoCapitalize="none"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Phone
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Phone
        </Text>

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#A89B94"
          keyboardType="phone-pad"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        /> */}

        {/* Craft */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Craft Type
        </Text>

        <TextInput
          value={craftType}
          onChangeText={setCraftType}
          placeholder="Example: Pottery, Woodwork"
          placeholderTextColor="#A89B94"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Description */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          About Your Craft
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us about your craft"
          placeholderTextColor="#A89B94"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="h-[110px] rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Password */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Password
        </Text>

        <View className="flex-row items-center rounded-[14px] border border-[#E5D8CC] bg-white">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor="#A89B94"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
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

        {/* Register */}
        <TouchableOpacity
          onPress={handleRegister}
          className="mt-7 items-center rounded-[14px] bg-[#C65D3A] py-4"
        >
          <Text className="text-[16px] font-bold text-white">
            Create Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 items-center"
        >
          <Text className="text-[14px] font-semibold text-[#6F8060]">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      
    </KeyboardAvoider>
  );
}