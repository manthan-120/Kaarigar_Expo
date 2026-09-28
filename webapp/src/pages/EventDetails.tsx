import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { payWithCashfree } from "../services/payment";

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

type Kaarigar = {
  _id: string;
  kaarigar: {
    _id: string;
    name: string;
    email: string;
  };
  craftType: string;
  description?: string;
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [kaarigars, setKaarigars] = useState<Kaarigar[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!id) return;

        const [eventData, kaarigarData] = await Promise.all([
          api(`/events/${id}`),
          api(`/events/${id}/kaarigars`),
        ]);

        setEvent(eventData.event);
        setKaarigars(kaarigarData.kaarigars || []);
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleRegistration = async () => {
    if (!event || !user) return;

    try {
      setRegistering(true);
      setMessage("");
      setError("");

      if (user.role === "VISITOR") {
        await api("/rsvps", {
          method: "POST",
          body: JSON.stringify({ eventId: event._id }),
        });

        if (event.visitorFee > 0) {
          const payment = await payWithCashfree(
            event._id,
            "VISITOR_RSVP"
          );

          if (payment.status !== "SUCCESS") {
            setError(
              payment.status === "PENDING"
                ? "Payment is still pending. Please check your dashboard shortly."
                : "Payment was not completed."
            );
            return;
          }
        }

        setMessage("Event registration and payment completed successfully.");
        return;
      }

      if (user.role === "KAARIGAR") {
        if (!user.craftType || !user.description) {
          setError(
            "Complete your craft type and description in your profile before applying."
          );
          return;
        }

        await api("/applications", {
          method: "POST",
          body: JSON.stringify({
            eventId: event._id,
            craftType: user.craftType,
            description: user.description,
          }),
        });

        setMessage(
          "Application submitted. Payment will be available after admin approval."
        );
      }
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Registration failed"
      );
    } finally {
      setRegistering(false);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8ef]">
        <header className="border-b border-[#eaded2] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            <div
              className="flex cursor-pointer flex-col leading-none"
              onClick={() => navigate("/")}
            >
              <span className="text-xl font-bold tracking-wide text-[#3b2923]">
                KAARIGAR
              </span>

              <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
                EXPO
              </span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-[#d9c9bd] px-5 py-2.5 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
            >
              Home
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-center text-sm text-[#75665e]">
            Loading event...
          </p>
        </main>
      </div>
    );
  }

  /* Event not found */
  if (!event) {
    return (
      <div className="min-h-screen bg-[#fff8ef]">
        <header className="border-b border-[#eaded2] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            <div
              className="flex cursor-pointer flex-col leading-none"
              onClick={() => navigate("/")}
            >
              <span className="text-xl font-bold tracking-wide text-[#3b2923]">
                KAARIGAR
              </span>

              <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
                EXPO
              </span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-[#d9c9bd] px-5 py-2.5 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
            >
              Home
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
          <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
            Event not found
          </h2>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
          >
            Back to Home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef]">

      {/* Navbar */}
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <div
            className="flex cursor-pointer flex-col leading-none"
            onClick={() => navigate("/")}
          >
            <span className="text-xl font-bold tracking-wide text-[#3b2923]">
              KAARIGAR
            </span>

            <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
              EXPO
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-[#d9c9bd] px-5 py-2.5 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
          >
            Home
          </button>
        </div>
      </header>

      {/* Event Details */}
      <main>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-sm font-semibold text-[#75665e] transition hover:text-[#c65d3a]"
          >
            ← Back to Events
          </button>

          {/* Event Image */}
          {event.image ? (
            <img
              src={event.image}
              alt={event.name}
              className="h-64 w-full rounded-2xl object-cover sm:h-80 lg:h-96"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-[#eaded2] sm:h-80 lg:h-96">
              <span className="text-sm font-bold tracking-[0.2em] text-[#75665e]">
                KAARIGAR EXPO
              </span>
            </div>
          )}

          {/* Event Content */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">

            {/* Information */}
            <div>
              <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
                EVENT
              </p>

              <h1 className="font-['Playfair_Display'] text-4xl font-semibold leading-tight text-[#3b2923] sm:text-5xl">
                {event.name}
              </h1>

              {/* Meta */}
              <div className="mt-6 space-y-3 text-sm text-[#75665e]">
                <p>
                  📅{" "}
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <p>📍 {event.location}</p>
              </div>

              {/* Description */}
              <p className="mt-8 max-w-3xl text-base leading-8 text-[#75665e]">
                {event.description ||
                  "Discover traditional crafts, talented kaarigars and cultural experiences at this event."}
              </p>
            </div>

            {/* Registration Card */}
            <div className="h-fit rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">

              <p className="text-xs font-bold tracking-[0.16em] text-[#c65d3a]">
                EVENT FEES
              </p>

              <div className="mt-3 space-y-3">
                {(user?.role === "VISITOR" || user?.role === "ADMIN") && (
                  <div>
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                    ₹{event.visitorFee}
                  </h2>

                  <p className="mt-1 text-sm text-[#75665e]">
                    Visitor entry fee
                  </p>
                  </div>
                )}

                {(user?.role === "KAARIGAR" || user?.role === "ADMIN") && (
                  <div>
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                    ₹{event.kaarigarFee}
                  </h2>

                  <p className="mt-1 text-sm text-[#75665e]">
                    Kaarigar participation fee
                  </p>
                  </div>
                )}
              </div>

              {message && (
                <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              {(user?.role === "VISITOR" || user?.role === "KAARIGAR") && (
                <button
                  onClick={handleRegistration}
                  disabled={registering}
                  className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registering
                    ? "Processing..."
                    : user?.role === "VISITOR"
                      ? event.visitorFee > 0
                        ? "Register & Pay"
                        : "Register for Event"
                      : "Apply for Event"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Kaarigars */}
        <section className="border-t border-[#eaded2] bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

            <p className="text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
              MEET THE ARTISANS
            </p>

            <h2 className="mt-2 font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923]">
              Participating Kaarigars
            </h2>

            {kaarigars.length === 0 ? (
              <p className="mt-8 text-sm text-[#75665e]">
                No kaarigars have been listed for this event yet.
              </p>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {kaarigars.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-[#eaded2] bg-[#fff8ef] p-6 transition hover:-translate-y-1 hover:shadow-md"
                  >

                    {/* Avatar */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c65d3a] text-lg font-bold text-white">
                      {item.kaarigar.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Name */}
                    <h3 className="mt-5 text-lg font-semibold text-[#3b2923]">
                      {item.kaarigar.name}
                    </h3>

                    {/* Craft */}
                    <p className="mt-1 text-sm font-semibold text-[#c65d3a]">
                      {item.craftType}
                    </p>

                    {/* Description */}
                    {item.description && (
                      <p className="mt-3 text-sm leading-6 text-[#75665e]">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eaded2] bg-[#3b2923]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center sm:flex-row sm:text-left lg:px-8">

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-wide text-white">
              KAARIGAR
            </span>

            <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#e7a88f]">
              EXPO
            </span>
          </div>

          <p className="text-sm text-[#eaded2]">
            Craft • Culture • Community
          </p>

          <p className="text-sm text-[#eaded2]">
            © 2026 Kaarigar Expo
          </p>
        </div>
      </footer>
    </div>
  );
}
