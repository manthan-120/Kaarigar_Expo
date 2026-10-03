import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import KeyboardAvoider from "../../components/KeyboardAvoider";
import ProfileButton from "../../components/ProfileButton";
import { api } from "../../services/api";

export default function CreateEventScreen() {
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [visitorFee, setVisitorFee] = useState("");
  const [kaarigarFee, setKaarigarFee] = useState("");

  const [eventImage, setEventImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const handleCreateEvent = async () => {
    if (
      !name ||
      !date ||
      !location ||
      !visitorFee ||
      !kaarigarFee
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill all required fields."
      );
      return;
    }

    const visitorFeeNumber = Number(visitorFee);
    const kaarigarFeeNumber = Number(kaarigarFee);

    if (
      Number.isNaN(visitorFeeNumber) ||
      Number.isNaN(kaarigarFeeNumber)
    ) {
      Alert.alert(
        "Invalid Fee",
        "Please enter valid numbers for the fees."
      );
      return;
    }

    try {
      setCreating(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("description", description);
      formData.append(
        "visitorFee",
        String(visitorFeeNumber)
      );
      formData.append(
        "kaarigarFee",
        String(kaarigarFeeNumber)
      );

      if (eventImage) {
        formData.append("image", {
          uri: eventImage.uri,
          name:
            eventImage.fileName ||
            `event-${Date.now()}.jpg`,
          type: eventImage.mimeType || "image/jpeg",
        } as unknown as Blob);
      }

      const data = await api("/events", {
        method: "POST",
        body: formData,
      });

      Alert.alert("Success", data.message, [
        {
          text: "OK",
          onPress: () => {
            router.replace("/admin/events");
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Creation Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setCreating(false);
    }
  };

  const pickEventImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Allow photo library access to choose an event image."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

    if (!result.canceled) {
      setEventImage(result.assets[0]);
    }
  };

  return (
    <KeyboardAvoider>
      <View className="bg-[#FFF8EF]">
        {/* Top Branding */}
        <View className="mb-6 flex-row items-start justify-between">
          <View>
            <Text className="text-[22px] font-extrabold tracking-[1px] text-[#C65D3A]">
              KAARIGAR
            </Text>

            <Text className="text-[10px] font-bold tracking-[4px] text-[#6F8060]">
              EXPO
            </Text>
          </View>

          <ProfileButton />
        </View>

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={creating}
          className="mt-6"
        >
          <Text className="font-semibold text-[#C65D3A]">
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="mt-6 text-[25px] font-bold text-[#3B2923]">
          Create Mela
        </Text>

        <Text className="mt-2 text-[14px] text-[#75665E]">
          Create a new exhibition for visitors and Kaarigars.
        </Text>

        {/* Event Name */}
        <Text className="mb-2 mt-8 text-[14px] font-semibold text-[#3B2923]">
          Event Name
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter event name"
          placeholderTextColor="#A89B94"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Date */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Date
        </Text>

        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A89B94"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Location */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Location
        </Text>

        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter event location"
          placeholderTextColor="#A89B94"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Description */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Description
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter event description"
          placeholderTextColor="#A89B94"
          multiline
          textAlignVertical="top"
          className="min-h-[100px] rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Visitor Fee */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Visitor Fee
        </Text>

        <TextInput
          value={visitorFee}
          onChangeText={setVisitorFee}
          placeholder="Enter visitor fee"
          placeholderTextColor="#A89B94"
          keyboardType="numeric"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Kaarigar Fee */}
        <Text className="mb-2 mt-5 text-[14px] font-semibold text-[#3B2923]">
          Kaarigar Fee
        </Text>

        <TextInput
          value={kaarigarFee}
          onChangeText={setKaarigarFee}
          placeholder="Enter kaarigar fee"
          placeholderTextColor="#A89B94"
          keyboardType="numeric"
          className="rounded-[14px] border border-[#E5D8CC] bg-white px-4 py-4"
        />

        {/* Event Image */}
        <TouchableOpacity
          onPress={pickEventImage}
          disabled={creating}
          className="mt-5 rounded-[14px] border border-[#E5D8CC] bg-white p-4"
        >
          <Text className="font-semibold text-[#3B2923]">
            {eventImage
              ? "Change Event Image"
              : "Choose Event Image"}
          </Text>

          <Text className="mt-1 text-[13px] text-[#75665E]">
            {eventImage?.fileName ||
              "Optional image uploaded to Cloudinary"}
          </Text>
        </TouchableOpacity>

        {/* Selected Image Preview */}
        {eventImage ? (
          <Image
            source={{ uri: eventImage.uri }}
            className="mt-3 h-48 w-full rounded-[14px]"
            resizeMode="cover"
          />
        ) : null}

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateEvent}
          disabled={creating}
          className={`mt-7 items-center rounded-[14px] py-4 ${
            creating
              ? "bg-[#D8B5A5]"
              : "bg-[#C65D3A]"
          }`}
        >
          <Text className="text-[16px] font-bold text-white">
            {creating ? "Creating..." : "Create Mela"}
          </Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View className="h-10" />
      </View>
    </KeyboardAvoider>
  );
}