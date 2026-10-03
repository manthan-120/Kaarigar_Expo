import { useEffect, useMemo, useState } from "react";

type Event = {
  _id: string;
  name: string;
  location: string;
  image?: string;
  createdAt?: string;
};

type EventHeroCarouselProps = {
  events: Event[];
};

export default function EventHeroCarousel({
  events,
}: EventHeroCarouselProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const latestEvents = useMemo(() => {
    return [...events]
      .filter((event) => event.image)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();

        return dateB - dateA;
      })
      .slice(0, 4);
  }, [events]);

  useEffect(() => {
    if (latestEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCarouselIndex((previousIndex) =>
        previousIndex + 1 >= latestEvents.length
          ? 0
          : previousIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [latestEvents.length]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [latestEvents]);

  if (latestEvents.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-3xl bg-[#eaded2]">
        <span className="text-xs font-bold tracking-[0.2em] text-[#75665e]">
          KAARIGAR EXPO
        </span>
      </div>
    );
  }

  const activeEvent = latestEvents[carouselIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg">
      {/* FULL IMAGE */}
      <img
        key={activeEvent._id}
        src={activeEvent.image}
        alt={activeEvent.name}
        className="aspect-4/3 h-full w-full object-cover"
      />

      {/* DARK GRADIENT OVER IMAGE */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-6 pb-5 pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
          Upcoming Mela
        </p>

        <h3 className="mt-1 font-['Playfair_Display'] text-2xl font-semibold text-white">
          {activeEvent.name}
        </h3>

        {/* <p className="mt-1 text-sm text-white/80">
          {activeEvent.location}
        </p> */}
      </div>

      {/* DOTS ON IMAGE */}
      {latestEvents.length > 1 && (
        <div className="absolute bottom-4 right-5 flex items-center gap-2">
          {latestEvents.map((event, index) => (
            <button
              key={event._id}
              onClick={() => setCarouselIndex(index)}
              aria-label={`Show ${event.name}`}
              className={`rounded-full transition-all duration-300 ${
                index === carouselIndex
                  ? "h-2.5 w-7 bg-white"
                  : "h-2.5 w-2.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}