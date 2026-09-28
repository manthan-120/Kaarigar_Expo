import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

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

type Registration = {
  _id: string;

  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
    visitorFee?: number;
  };

  status?: string;
  paymentStatus?: string;

  payment?: {
    orderId?: string;
    paymentId?: string;
    amount?: number;
    status?: string;
  };

  createdAt?: string;
};

export default function Visitor() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "VISITOR") {
      navigate("/");
      return;
    }

    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsData, registrationsData] = await Promise.all([
        api("/events"),
        api("/rsvps/my"),
      ]);

      setEvents(eventsData.events || []);
      setRegistrations(registrationsData.rsvps || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load visitor dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]">
        <p className="text-[#75665e]">
          Loading visitor dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] text-[#3b2923]">

      {/* ================= HEADER ================= */}
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold">
              Visitor Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#75665e]">
              Discover events and manage your registrations
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold transition hover:bg-[#fff8ef]"
            >
              Home
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-[#3b2923] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#251915]"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================= WELCOME ================= */}
        <section className="rounded-2xl bg-[#3b2923] p-7 text-white shadow-sm">
          <p className="text-sm text-[#eaded2]">
            Welcome back
          </p>

          <h2 className="mt-1 font-['Playfair_Display'] text-3xl font-bold">
            {user?.name}
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#eaded2]">
            Explore upcoming exhibitions, discover traditional
            artisans and register for events.
          </p>
        </section>

        {/* ================= STATS ================= */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              Upcoming Events
            </p>

            <p className="mt-2 text-3xl font-bold">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              My Registrations
            </p>

            <p className="mt-2 text-3xl font-bold">
              {registrations.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              Confirmed Registrations
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                registrations.filter(
                  (registration) =>
                    registration.status === "REGISTERED" ||
                    registration.paymentStatus === "PAID"
                ).length
              }
            </p>
          </div>

        </section>

        {/* ================= UPCOMING EVENTS ================= */}
        <section className="mt-12">

          <div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold">
              Upcoming Events
            </h2>

            <p className="mt-1 text-sm text-[#75665e]">
              Discover events and register to attend.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {events.length === 0 ? (
              <div className="rounded-2xl border border-[#eaded2] bg-white p-8 text-center text-[#75665e] md:col-span-2 lg:col-span-3">
                No upcoming events available.
              </div>
            ) : (
              events.map((event) => (
                <article
                  key={event._id}
                  className="overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Event top */}
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[#eaded2]">
                      <span className="text-xs font-bold tracking-[0.2em] text-[#75665e]">
                        KAARIGAR EXPO
                      </span>
                    </div>
                  )}

                  <div className="p-6">

                    <div className="mb-3 inline-block rounded-full bg-[#c65d3a]/10 px-3 py-1 text-xs font-bold text-[#c65d3a]">
                      Visitor Fee: ₹{event.visitorFee}
                    </div>

                    <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                      {event.name}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-[#75665e]">
                      <p>
                        📅{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </p>

                      <p>
                        📍 {event.location}
                      </p>
                    </div>

                    {event.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#75665e]">
                        {event.description}
                      </p>
                    )}

                    <button
                      onClick={() =>
                        navigate(`/events/${event._id}`)
                      }
                      className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
                    >
                      View Event →
                    </button>

                  </div>
                </article>
              ))
            )}

          </div>
        </section>

        {/* ================= MY REGISTRATIONS ================= */}
        <section className="mt-12">

          <div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold">
              My Registrations
            </h2>

            <p className="mt-1 text-sm text-[#75665e]">
              View your registered events and payment status.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm">

            {registrations.length === 0 ? (
              <div className="p-8 text-center">

                <p className="text-[#75665e]">
                  You have not registered for any event yet.
                </p>

                <button
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="mt-4 rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
                >
                  Explore Events
                </button>

              </div>
            ) : (
              <div className="divide-y divide-[#eaded2]">

                {registrations.map((registration) => {

                  const event = registration.event;

                  const registrationStatus =
                    registration.status || "REGISTERED";

                  const paymentStatus =
                    registration.paymentStatus ||
                    registration.payment?.status ||
                    "PENDING";

                  return (
                    <div
                      key={registration._id}
                      className="p-6"
                    >

                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                        {/* Event information */}
                        <div>

                          <h3 className="font-['Playfair_Display'] text-xl font-bold">
                            {event?.name || "Event"}
                          </h3>

                          <div className="mt-3 space-y-1 text-sm text-[#75665e]">

                            {event?.date && (
                              <p>
                                📅{" "}
                                {new Date(
                                  event.date
                                ).toLocaleDateString()}
                              </p>
                            )}

                            {event?.location && (
                              <p>
                                📍 {event.location}
                              </p>
                            )}

                          </div>

                          {registration.createdAt && (
                            <p className="mt-3 text-xs text-[#75665e]">
                              Registered on{" "}
                              {new Date(
                                registration.createdAt
                              ).toLocaleDateString()}
                            </p>
                          )}

                        </div>

                        {/* Status */}
                        <div className="flex flex-wrap items-center gap-3">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              registrationStatus ===
                              "REGISTERED"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {registrationStatus}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              paymentStatus === "PAID"
                                ? "bg-green-100 text-green-700"
                                : paymentStatus ===
                                  "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Payment: {paymentStatus}
                          </span>

                          {event?._id && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/events/${event._id}`
                                )
                              }
                              className="rounded-lg border border-[#c65d3a] px-4 py-2 text-sm font-semibold text-[#c65d3a] transition hover:bg-[#c65d3a] hover:text-white"
                            >
                              View Event
                            </button>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}
