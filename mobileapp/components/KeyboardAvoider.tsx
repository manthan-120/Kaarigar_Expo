import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardEvent,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

type KeyboardAvoiderProps = {
  children: React.ReactNode;
};

export default function KeyboardAvoider({
  children,
}: KeyboardAvoiderProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      (event: KeyboardEvent) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF8EF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-[#FFF8EF]"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: "#FFF8EF",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom:
            keyboardHeight > 0 ? keyboardHeight + 160 : 120,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

