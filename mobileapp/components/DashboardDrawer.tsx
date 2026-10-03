import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

type DashboardDrawerProps = {
  visible: boolean;
  onClose: () => void;
  role: string;
};

export default function DashboardDrawer({
  visible,
  onClose,
  role,
}: DashboardDrawerProps) {
  const { logout } = useAuth();
  // Controls whether the Modal is mounted
  const [mounted, setMounted] = useState(visible);

  // Drawer starts outside the screen on the RIGHT
  const slideX = useRef(
    new Animated.Value(DRAWER_WIDTH)
  ).current;

  // Controls dashboard dimming
  const overlayOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    if (visible) {
      // Mount modal first
      setMounted(true);

      // Start drawer outside the screen
      slideX.setValue(DRAWER_WIDTH);
      overlayOpacity.setValue(0);

      // OPEN: RIGHT → LEFT
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      // CLOSE: LEFT → RIGHT
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: DRAWER_WIDTH,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Remove Modal only AFTER animation finishes
        setMounted(false);
      });
    }
  }, [visible]);

  const navigate = (path: any) => {
    onClose();
    router.push(path);
  };

 const handleEvents = () => {
    onClose();

    if (role === "KAARIGAR") {
        router.push("/kaarigar/events");
    } else if (role === "VISITOR") {
        router.push("/visitor/events");
    } else {
        router.push("/admin/events");
    }
 };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">

        {/* ================================= */}
        {/* LEFT SIDE - DASHBOARD OVERLAY */}
        {/* ================================= */}

        <Animated.View
          className="flex-1"
          style={{
            opacity: overlayOpacity,
            backgroundColor: "rgba(0,0,0,0.10)",
          }}
        >
          <Pressable
            className="flex-1"
            onPress={onClose}
          />
        </Animated.View>

        {/* ================================= */}
        {/* RIGHT SIDE - DRAWER */}
        {/* ================================= */}

        <Animated.View
          style={{
            width: DRAWER_WIDTH,
            transform: [
              {
                translateX: slideX,
              },
            ],
            backgroundColor: "#FFF8EF",
            paddingHorizontal: 24,
            paddingTop: 60,
          }}
        >

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <View className="flex-row items-start justify-between">

            {/* Logo */}

            <View>
              <Text className="text-[24px] font-extrabold tracking-[1px] text-[#C65D3A]">
                KAARIGAR
              </Text>

              <Text className="text-[11px] font-bold tracking-[4px] text-[#6F8060]">
                EXPO
              </Text>
            </View>

            {/* Close Button */}

            <TouchableOpacity
              onPress={onClose}
              className="rounded-full p-1"
            >
              <Text className="text-[28px] text-[#75665E]">
                ×
              </Text>
            </TouchableOpacity>

          </View>

          {/* ================================= */}
          {/* MENU */}
          {/* ================================= */}

          <View className="mt-12">

            {/* PROFILE */}

            <TouchableOpacity
              className="mb-7"
              onPress={() => navigate("/profile")}
            >
              <Text className="text-[16px] font-semibold text-[#3B2923]">
                Profile
              </Text>
            </TouchableOpacity>

            {/* EVENTS */}

            <TouchableOpacity
              className="mb-7"
              onPress={handleEvents}
            >
              <Text className="text-[16px] font-semibold text-[#3B2923]">
                Events
              </Text>
            </TouchableOpacity>

            {/* ================================= */}
            {/* KAARIGAR APPLICATIONS */}
            {/* ================================= */}

            {role === "KAARIGAR" && (
              <TouchableOpacity
                className="mb-7"
                onPress={() =>
                  navigate("/kaarigar/applications")
                }
              >
                <Text className="text-[16px] font-semibold text-[#3B2923]">
                  My Applications
                </Text>
              </TouchableOpacity>
            )}

            {/* ================================= */}
            {/* VISITOR REGISTRATIONS */}
            {/* ================================= */}

            {role === "VISITOR" && (
              <TouchableOpacity
                className="mb-7"
                onPress={() =>
                  navigate("/visitor/registrations")
                }
              >
                <Text className="text-[16px] font-semibold text-[#3B2923]">
                  My Registrations
                </Text>
              </TouchableOpacity>
            )}

            {/* ================================= */}
            {/* PAYMENT HISTORY */}
            {/* ================================= */}

            {role !== "ADMIN" && (
              <TouchableOpacity
                className="mb-7"
                onPress={() => navigate("/payment-history")}
              >
                <Text className="text-[16px] font-semibold text-[#3B2923]">
                  Payment History
                </Text>
              </TouchableOpacity>
            )}

            {/* ================================= */}
            {/* DIVIDER */}
            {/* ================================= */}

            <View className="my-2 h-[1px] bg-[#E5D8CC]" />

            {/* ================================= */}
            {/* LOGOUT */}
            {/* ================================= */}

            <TouchableOpacity
              className="mt-6"
              onPress={async () => {
                  onClose();
                  await logout();
                  router.replace("/");
                }}
            >
              <Text className="text-[16px] font-bold text-[#C65D3A]">
                Logout
              </Text>
            </TouchableOpacity>

          </View>

        </Animated.View>

      </View>
    </Modal>
  );
}