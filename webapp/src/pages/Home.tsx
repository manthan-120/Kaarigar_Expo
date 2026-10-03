import { useEffect } from "react";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../hooks/useEvents";
import CraftItem from "../components/CraftItem";
import EventHeroCarousel from "../components/EventCarousel";
export default function Home() {
  const { user, logout } = useAuth();
  const { events, loading: loadingEvents } = useEvents();

  useEffect(() => {
    if (user) {
      logout();
    }
  }, [user, logout]);

  const scrollToEvents = () => {
    document
      .getElementById("events")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fff8ef] text-[#3b2923]">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-[#eaded2] bg-[#fff8ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-wide text-[#3b2923]">
              KAARIGAR
            </span>

            <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
              EXPO
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#events"
              className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
            >
              Events
            </a>

            <a
              href="#crafts"
              className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
            >
              Crafts
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
            >
              About
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-[#c65d3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b45131]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>

        <section className="relative overflow-hidden border-b border-[#eaded2]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">

              <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#c65d3a] sm:text-sm">
                CRAFT • CULTURE • COMMUNITY
              </p>

              <h1 className="font-['Playfair_Display'] text-5xl font-semibold leading-[1.05] text-[#3b2923] sm:text-6xl lg:text-7xl">
                Discover the
                <br />
                <span className="text-[#c65d3a]">
                  Art of India
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-[#75665e] sm:text-lg">
                Explore traditional crafts, meet talented kaarigars,
                and experience the culture behind every handmade creation.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={scrollToEvents}
                  className="rounded-lg bg-[#c65d3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
                >
                  Explore Events →
                </button>

                <Link
                  to="/register"
                  className="rounded-lg border border-[#d9c9bd] bg-white px-6 py-3 text-center text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
                >
                  Join as Kaarigar
                </Link>
              </div>
            </div>
            {/* RIGHT SIDE CAROUSEL */}
            <div className="absolute right-5 top-16 hidden w-[42%] max-w-xl md:block lg:right-8 lg:top-20">
              <EventHeroCarousel events={events} />
            </div>
          </div>
        </section>

        {/* ================= EVENTS ================= */}
        <section
          id="events"
          className="scroll-mt-24 border-b border-[#eaded2] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            {/* Section Heading */}
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
                  DISCOVER
                </p>

                <h2 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923] sm:text-5xl">
                  Upcoming Melas
                </h2>
              </div>

            </div>

            {/* Events */}
            {loadingEvents ? (
              <div className="rounded-xl border border-[#eaded2] bg-white p-8 text-center text-[#75665e]">
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border border-[#eaded2] bg-white p-8 text-center text-[#75665e]">
                No upcoming events available.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    id={event._id}
                    title={event.name}
                    location={event.location}
                    date={new Date(event.date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                    visitorFee={event.visitorFee}
                    kaarigarFee={event.kaarigarFee}
                    role={user?.role}
                    image={event.image}
                    description={
                      event.description ||
                      "Discover this upcoming exhibition."
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= CRAFTS ================= */}
        <section
          id="crafts"
          className="scroll-mt-24 border-b border-[#eaded2] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
              EXPLORE
            </p>

            <h2 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923] sm:text-5xl">
              Crafts & Traditions
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              <CraftItem icon="🏺" title="Pottery" />
              <CraftItem icon="🧵" title="Textiles" />
              <CraftItem icon="🪵" title="Woodwork" />
              <CraftItem icon="💍" title="Jewellery" />
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section
          id="about"
          className="scroll-mt-24 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">

            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
              OUR PURPOSE
            </p>

            <h2 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923] sm:text-5xl">
              Keeping Craft Alive
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#75665e] sm:text-lg">
              Kaarigar Expo brings artisans, visitors and cultural
              experiences together in one place. Discover the people,
              skills and traditions behind India's beautiful handmade work.
            </p>

            <button className="mt-8 rounded-lg bg-[#c65d3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]">
              Discover More →
            </button>
          </div>
        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#eaded2] bg-[#3b2923]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-8 text-center sm:px-8">

          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-wide text-white">
              KAARIGAR
            </span>

            <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
              EXPO
            </span>
          </Link>

          <p className="text-sm text-[#75665e]">
            Craft • Culture • Community
          </p>

          <p className="text-xs text-[#75665e]">
            © 2026 Kaarigar Expo
          </p>
        </div>
      </footer>
    </div>
  );
}

