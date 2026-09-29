import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";

type Event = {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  visitorFee: number;
  kaarigarFee: number;
  image?: string;
};

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [visitorFee, setVisitorFee] = useState("");
  const [kaarigarFee, setKaarigarFee] = useState("");
  const [eventImage, setEventImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await api("/events");
      setEvents(data.events);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      formData.append("visitorFee", String(visitorFeeNumber));
      formData.append("kaarigarFee", String(kaarigarFeeNumber));

      if (eventImage) {
        formData.append("image", {
          uri: eventImage.uri,
          name: eventImage.fileName || `event-${Date.now()}.jpg`,
          type: eventImage.mimeType || "image/jpeg",
        } as unknown as Blob);
      }

      const data = await api("/events", {
        method: "POST",
        body: formData,
      });

      Alert.alert("Success", data.message);

      setName("");
      setDate("");
      setLocation("");
      setDescription("");
      setVisitorFee("");
      setKaarigarFee("");
      setEventImage(null);

      fetchEvents();
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

    const result = await ImagePicker.launchImageLibraryAsync({
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
    <ScrollView
      className="flex-1 bg-[#FFF8EF]"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="font-semibold text-[#C65D3A]">
          ← Back
        </Text>
      </TouchableOpacity>

      <Text className="mt-6 text-[28px] font-extrabold text-[#C65D3A]">
        KAARIGAR EXPO
      </Text>

      <Text className="mt-6 text-[25px] font-bold text-[#3B2923]">
        Manage Melas
      </Text>

      <Text className="mt-2 text-[14px] text-[#75665E]">
        Create and manage upcoming exhibitions.
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

      <TouchableOpacity
        onPress={handleCreateEvent}
        disabled={creating}
        className="mt-7 items-center rounded-[14px] bg-[#C65D3A] py-4"
      >
        <Text className="text-[16px] font-bold text-white">
          {creating ? "Creating..." : "Create Mela"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={pickEventImage}
        className="mt-5 rounded-[14px] border border-[#E5D8CC] bg-white p-4"
      >
        <Text className="font-semibold text-[#3B2923]">
          {eventImage ? "Change Event Image" : "Choose Event Image"}
        </Text>
        <Text className="mt-1 text-[13px] text-[#75665E]">
          {eventImage?.fileName || "Optional image uploaded to Cloudinary"}
        </Text>
      </TouchableOpacity>

      {eventImage ? (
        <Image
          source={{ uri: eventImage.uri }}
          className="mt-3 h-48 w-full rounded-[14px]"
          resizeMode="cover"
        />
      ) : null}

      {/* Existing Events */}
      <Text className="mb-4 mt-10 text-[20px] font-bold text-[#3B2923]">
        Existing Melas
      </Text>

      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator size="small" color="#C65D3A" />
        </View>
      ) : events.length === 0 ? (
        <View className="rounded-[16px] bg-white p-5">
          <Text className="text-center text-[#75665E]">
            No melas created yet.
          </Text>
        </View>
      ) : (
        events.map((event) => (
          <View
            key={event._id}
            className="mb-3 rounded-[16px] bg-white p-5"
          >
            {event.image ? (
              <Image
                source={{ uri: event.image }}
                className="mb-4 h-40 w-full rounded-[14px]"
                resizeMode="cover"
              />
            ) : null}

            <Text className="text-[17px] font-bold text-[#3B2923]">
              {event.name}
            </Text>

            <Text className="mt-2 text-[13px] text-[#75665E]">
              📅 {new Date(event.date).toLocaleDateString()}
            </Text>

            <Text className="mt-1 text-[13px] text-[#75665E]">
              📍 {event.location}
            </Text>

            <Text className="mt-2 text-[13px] text-[#C65D3A]">
              Visitor: ₹{event.visitorFee} | Kaarigar: ₹
              {event.kaarigarFee}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}