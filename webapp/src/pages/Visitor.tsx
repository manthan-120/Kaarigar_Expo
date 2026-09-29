import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../hooks/useEvents";
import { api } from "../services/api";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";

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
  const { user } = useAuth();
  const {
  events,
  loading: eventsLoading,
  error: eventsError,
  } = useEvents();

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

      try {
        await api("/payments/reconcile", {
          method: "POST",
        });
      } catch (reconcileError) {
        console.error(
          "Payment reconciliation failed:",
          reconcileError
        );
      }

      const registrationsData =
        await api("/rsvps/my");

      setRegistrations(
        registrationsData.rsvps || []
      );
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
  if (loading || eventsLoading) {
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
      <Navbar role="VISITOR" />

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ================= ERROR ================= */}
        {(error || eventsError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || eventsError}
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

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#eaded2]">
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
                <EventCard
                  key={event._id}
                  id={event._id}
                  title={event.name}
                  location={event.location}
                  date={new Date(event.date).toLocaleDateString()}
                  visitorFee={event.visitorFee}
                  kaarigarFee={event.kaarigarFee}
                  role="VISITOR"
                  image={event.image}
                  description={
                    event.description ||
                    "Discover this upcoming exhibition."
                  }
                />
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
