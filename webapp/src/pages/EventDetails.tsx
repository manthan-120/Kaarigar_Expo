import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { payWithCashfree } from "../services/payment";
import type { Event } from "../types/event";
import Navbar from "../components/Navbar";

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

type VisitorRegistration = {
  event: string | { _id: string };
  status?: string;
  paymentStatus?: string;
};

type KaarigarApplication = {
  event: string | { _id: string };
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [kaarigars, setKaarigars] = useState<Kaarigar[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [visitorRegistration, setVisitorRegistration] =
    useState<VisitorRegistration | null>(null);
  const [kaarigarApplication, setKaarigarApplication] =
    useState<KaarigarApplication | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!id) return;

        const requests = [
          api(`/events/${id}`),
          api(`/events/${id}/kaarigars`),
        ];

        if (user?.role === "VISITOR") {
          requests.push(api("/rsvps/my"));
        }

        if (user?.role === "KAARIGAR") {
          requests.push(api("/applications/my"));
        }

        const [eventData, kaarigarData, userData] =
          await Promise.all(requests);

        setEvent(eventData.event);
        setKaarigars(kaarigarData.kaarigars || []);

        if (user?.role === "VISITOR" && userData) {
          const registration = (userData.rsvps || []).find(
            (item: VisitorRegistration) => {
              const eventId =
                typeof item.event === "string"
                  ? item.event
                  : item.event?._id;
              return eventId === id;
            }
          );
          setVisitorRegistration(registration || null);
        }

        if (user?.role === "KAARIGAR" && userData) {
          const application = (userData.applications || []).find(
            (item: KaarigarApplication) => {
              const eventId =
                typeof item.event === "string"
                  ? item.event
                  : item.event?._id;
              return eventId === id;
            }
          );
          setKaarigarApplication(application || null);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user?.role]);

  const handleRegistration = async () => {
    if (!event || !user) return;

    try {
      setRegistering(true);
      setMessage("");
      setError("");

      if (user.role === "VISITOR") {
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

          navigate("/visitor");
          return;
        }

        await api("/rsvps", {
          method: "POST",
          body: JSON.stringify({ eventId: event._id }),
        });

        setMessage("Event registration completed successfully.");
        setVisitorRegistration({
          event: event._id,
          status: "REGISTERED",
          paymentStatus: "PAID",
        });
        return;
      }

      if (user.role === "KAARIGAR") {
        if (
          kaarigarApplication?.status === "APPROVED" &&
          kaarigarApplication.paymentStatus !== "PAID"
        ) {
          const payment = await payWithCashfree(
            event._id,
            "KAARIGAR_APPLICATION"
          );

          if (payment.status === "SUCCESS") {
            setMessage("Participation fee paid successfully.");
            setKaarigarApplication({
              ...kaarigarApplication,
              paymentStatus: "PAID",
            });
          } else {
            setError(
              payment.status === "PENDING"
                ? "Payment is still pending. Please check your dashboard shortly."
                : "Payment was not completed."
            );
          }
          return;
        }

        if (kaarigarApplication) return;

        if (!user.craftType || !user.description) {
          setError(
            "Complete your craft type and description in your profile before applying."
          );
          return;
        }

        const applicationData = await api("/applications", {
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
        setKaarigarApplication({
          event: event._id,
          status: applicationData.application?.status || "PENDING",
          paymentStatus: applicationData.application?.paymentStatus || "UNPAID",
        });
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
        <Navbar showAuth />

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
        <Navbar showAuth />

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

      <Navbar showAuth />

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
                {(!user || user.role === "VISITOR" || user.role === "ADMIN") && (
                  <div>
                  <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                    ₹{event.visitorFee}
                  </h2>

                  <p className="mt-1 text-sm text-[#75665e]">
                    Visitor entry fee
                  </p>
                  </div>
                )}

                {(!user || user.role === "KAARIGAR" || user.role === "ADMIN") && (
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

              {!user && (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
                >
                  Login to Register
                </button>
              )}

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

              {user?.role === "VISITOR" && visitorRegistration && (
                <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  Registration: {visitorRegistration.status || "REGISTERED"} 
                  <br />
                  Payment: {visitorRegistration.paymentStatus || "PENDING"}
                </div>
              )}

              {user?.role === "KAARIGAR" && kaarigarApplication && (
                <div
                  className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${
                    kaarigarApplication.status === "APPROVED" 
                      ? "bg-green-50 text-green-700"
                      : kaarigarApplication.status === "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  Application: {kaarigarApplication.status}
                  {kaarigarApplication.status === "APPROVED" && (
                    <>
                      <br />
                      Payment: {kaarigarApplication.paymentStatus || "UNPAID"}
                    </>
                  )}
                </div>
              )}

              {(user?.role === "VISITOR" || user?.role === "KAARIGAR") && (
                <button
                  onClick={handleRegistration}
                  disabled={
                    registering ||
                    (user?.role === "VISITOR" &&
                      visitorRegistration?.paymentStatus === "PAID") ||
                    (user?.role === "KAARIGAR" &&
                      kaarigarApplication !== null &&
                      !(
                        kaarigarApplication.status === "APPROVED" &&
                        kaarigarApplication.paymentStatus !== "PAID"
                      ))
                  }
                  className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registering
                    ? "Processing..."
                    : user?.role === "VISITOR"
                      ? visitorRegistration?.paymentStatus === "PAID"
                        ? "Already Registered"
                        : visitorRegistration
                          ? "Pay Now"
                        : event.visitorFee > 0
                          ? "Register & Pay"
                          : "Register for Event"
                      : kaarigarApplication
                        ? kaarigarApplication.status === "APPROVED" &&
                          kaarigarApplication.paymentStatus !== "PAID"
                          ? "Pay Participation Fee"
                          : kaarigarApplication.paymentStatus === "PAID"
                            ? "Payment Paid"
                            : `Application ${kaarigarApplication.status}`
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
