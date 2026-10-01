import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

type Event = {
  _id: string;
  name: string;
  date: string;
  image?: string;
};

type EventCarouselProps = {
  events: Event[];
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 40;

const isUpcoming = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(date).getTime() >= today.getTime();
};

export default function EventCarousel({
  events,
}: EventCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselEvents = useMemo(
    () =>
      [...events]
        .filter((event) => isUpcoming(event.date))
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
        .slice(0, 3),
    [events]
  );

  useEffect(() => {
    if (carouselEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        const nextIndex =
          previousIndex + 1 >= carouselEvents.length
            ? 0
            : previousIndex + 1;

        scrollRef.current?.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselEvents.length]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / CARD_WIDTH);

    if (
      index >= 0 &&
      index < carouselEvents.length &&
      index !== currentIndex
    ) {
      setCurrentIndex(index);
    }
  };

  if (carouselEvents.length === 0) {
    return null;
  }

  return (
    <View className="mt-8">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
      >
        {carouselEvents.map((event) => (
          <View
            key={event._id}
            style={{
              width: CARD_WIDTH,
              marginRight: 0,
            }}
            className="overflow-hidden rounded-[22px]"
          >
            {event.image ? (
              <Image
                source={{ uri: event.image }}
                className="h-[210px] w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-[210px] w-full items-center justify-center bg-[#E5D8CC]">
                <Text className="text-[14px] font-semibold text-[#75665E]">
                  No image available
                </Text>
              </View>
            )}

            {/* Bottom dark overlay */}
            <View className="absolute bottom-0 left-0 right-0 px-4 py-3">
            <Text
                numberOfLines={2}
                className="text-[15px] font-bold text-white"
            >
                {event.name}
            </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      {carouselEvents.length > 1 && (
        <View className="mt-3 flex-row items-center justify-center">
          {carouselEvents.map((event, index) => (
            <View
              key={event._id}
              className={`mx-1 h-2 rounded-full ${
                index === currentIndex
                  ? "w-5 bg-[#C65D3A]"
                  : "w-2 bg-[#D8C9BE]"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}