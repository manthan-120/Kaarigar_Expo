import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { payWithCashfree } from "../services/payment";
import type { Event } from "../types/event";
import Navbar from "../components/Navbar";
import { CalendarDays, MapPin } from "lucide-react";

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
  _id?: string;

  event: string | { _id: string };

  status?: string;

  paymentStatus?: string;

  ticketNumber?: string;
};

type KaarigarApplication = {
  _id?: string;

  event: string | { _id: string };

  status: "PENDING" | "APPROVED" | "REJECTED";

  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";

  ticketNumber?: string;
};

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);

  const [kaarigars, setKaarigars] = useState<Kaarigar[]>([]);

  const [loading, setLoading] = useState(true);

  const [registering, setRegistering] =
    useState(false);

  const [visitorRegistration, setVisitorRegistration] =
    useState<VisitorRegistration | null>(null);

  const [kaarigarApplication, setKaarigarApplication] =
    useState<KaarigarApplication | null>(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =====================================================
     LOAD EVENT DETAILS
  ===================================================== */

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!id) return;

        setLoading(true);
        setError("");

        /* -----------------------------------------------
           Event
        ------------------------------------------------ */

        const eventData = await api(
          `/events/${id}`
        );

        setEvent(eventData.event);

        /* -----------------------------------------------
           Kaarigars
        ------------------------------------------------ */

        try {
          const kaarigarData = await api(
            `/events/${id}/kaarigars`
          );

          setKaarigars(
            kaarigarData.kaarigars || []
          );
        } catch (kaarigarError) {
          console.error(
            "Failed to load kaarigars:",
            kaarigarError
          );

          setKaarigars([]);
        }

        /* -----------------------------------------------
           Visitor registration
        ------------------------------------------------ */

        if (user?.role === "VISITOR") {
          try {
            const userData = await api("/rsvps/my");

            const registration = (
              userData.rsvps || []
            ).find(
              (item: VisitorRegistration) => {
                const eventId =
                  typeof item.event === "string"
                    ? item.event
                    : item.event?._id;

                return eventId === id;
              }
            );

            setVisitorRegistration(
              registration || null
            );
          } catch (visitorError) {
            console.error(
              "Failed to load visitor registration:",
              visitorError
            );

            setVisitorRegistration(null);
          }
        }

        /* -----------------------------------------------
           Kaarigar application
        ------------------------------------------------ */

        if (user?.role === "KAARIGAR") {
          try {
            const userData = await api(
              "/applications/my"
            );

            const application = (
              userData.applications || []
            ).find(
              (item: KaarigarApplication) => {
                const eventId =
                  typeof item.event === "string"
                    ? item.event
                    : item.event?._id;

                return eventId === id;
              }
            );

            setKaarigarApplication(
              application || null
            );
          } catch (applicationError) {
            console.error(
              "Failed to load application:",
              applicationError
            );

            setKaarigarApplication(null);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load event:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user?.role]);

  /* =====================================================
     VISITOR REGISTRATION
  ===================================================== */

  const handleVisitorRegistration = async () => {
    if (!event || !user) return;

    try {
      setRegistering(true);

      setMessage("");

      setError("");

      /* -----------------------------------------------
         Already registered
      ------------------------------------------------ */

      if (
        visitorRegistration?.paymentStatus ===
        "PAID"
      ) {
        return;
      }

      /* -----------------------------------------------
         PAID EVENT
      ------------------------------------------------ */

      if (event.visitorFee > 0) {
        const payment = await payWithCashfree(
          event._id,
          "VISITOR_RSVP"
        );

        /* ---------------------------------------------
           Payment failed / pending
        --------------------------------------------- */

        if (payment.status !== "SUCCESS") {
          setError(
            payment.status === "PENDING"
              ? "Payment is still pending. Please check your registration status shortly."
              : "Payment was not completed."
          );

          return;
        }

        /* ---------------------------------------------
           Payment successful

           Fetch RSVP again because backend creates
           the ticket number.
        --------------------------------------------- */

        const registrationsData =
          await api("/rsvps/my");

        const registration =
          (
            registrationsData.rsvps || []
          ).find(
            (item: VisitorRegistration) => {
              const eventId =
                typeof item.event === "string"
                  ? item.event
                  : item.event?._id;

              return eventId === event._id;
            }
          );

        if (registration) {
          setVisitorRegistration(
            registration
          );
        } else {
          /*
            Fallback in case backend response is
            slightly delayed.
          */
          setVisitorRegistration({
            event: event._id,
            status: "REGISTERED",
            paymentStatus: "PAID",
          });
        }

        setMessage(
          "Registration completed successfully."
        );

        return;
      }

      /* -----------------------------------------------
         FREE EVENT
      ------------------------------------------------ */

      const response = await api("/rsvps", {
        method: "POST",

        body: JSON.stringify({
          eventId: event._id,
        }),
      });

      setVisitorRegistration(
        response.rsvp || {
          event: event._id,
          status: "REGISTERED",
          paymentStatus: "PAID",
        }
      );

      setMessage(
        "Event registration completed successfully."
      );
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

  /* =====================================================
     KAARIGAR REGISTRATION / PAYMENT
  ===================================================== */

  const handleKaarigarRegistration = async () => {
    if (!event || !user) return;

    try {
      setRegistering(true);

      setMessage("");

      setError("");

      /* -----------------------------------------------
         APPROVED → PAY
      ------------------------------------------------ */

      if (
        kaarigarApplication?.status ===
          "APPROVED" &&
        kaarigarApplication.paymentStatus !==
          "PAID"
      ) {
        const payment = await payWithCashfree(
          event._id,
          "KAARIGAR_APPLICATION"
        );

        /* ---------------------------------------------
           Payment failed / pending
        --------------------------------------------- */

        if (payment.status !== "SUCCESS") {
          setError(
            payment.status === "PENDING"
              ? "Payment is still pending. Please check your application status shortly."
              : "Payment was not completed."
          );

          return;
        }

        /* ---------------------------------------------
           Fetch application again.

           Backend generates KRG ticket here.
        --------------------------------------------- */

        const applicationsData =
          await api("/applications/my");

        const updatedApplication =
          (
            applicationsData.applications ||
            []
          ).find(
            (item: KaarigarApplication) => {
              const eventId =
                typeof item.event === "string"
                  ? item.event
                  : item.event?._id;

              return eventId === event._id;
            }
          );

        if (updatedApplication) {
          setKaarigarApplication(
            updatedApplication
          );
        } else {
          setKaarigarApplication({
            ...kaarigarApplication,
            paymentStatus: "PAID",
          });
        }

        setMessage(
          "Participation fee paid successfully."
        );

        return;
      }

      /* -----------------------------------------------
         Application already exists
      ------------------------------------------------ */

      if (kaarigarApplication) {
        return;
      }

      /* -----------------------------------------------
         Profile validation
      ------------------------------------------------ */

      if (
        !user.craftType ||
        !user.description
      ) {
        setError(
          "Complete your craft type and description in your profile before applying."
        );

        return;
      }

      /* -----------------------------------------------
         Create application
      ------------------------------------------------ */

      const applicationData = await api(
        "/applications",
        {
          method: "POST",

          body: JSON.stringify({
            eventId: event._id,

            craftType: user.craftType,

            description: user.description,
          }),
        }
      );

      const newApplication =
        applicationData.application;

      setKaarigarApplication({
        event: event._id,

        status:
          newApplication?.status ||
          "PENDING",

        paymentStatus:
          newApplication?.paymentStatus ||
          "UNPAID",

        ticketNumber:
          newApplication?.ticketNumber,
      });

      setMessage(
        "Application submitted. Payment will be available after admin approval."
      );
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Application failed"
      );
    } finally {
      setRegistering(false);
    }
  };

  /* =====================================================
     COMMON REGISTRATION HANDLER
  ===================================================== */

  const handleRegistration = async () => {
    if (!user) return;

    if (user.role === "VISITOR") {
      await handleVisitorRegistration();

      return;
    }

    if (user.role === "KAARIGAR") {
      await handleKaarigarRegistration();

      return;
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

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

  /* =====================================================
     EVENT NOT FOUND
  ===================================================== */

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

  /* =====================================================
     STATUS FLAGS
  ===================================================== */

  const visitorPaid =
    user?.role === "VISITOR" &&
    visitorRegistration?.paymentStatus ===
      "PAID";

  const kaarigarPaid =
    user?.role === "KAARIGAR" &&
    kaarigarApplication?.status ===
      "APPROVED" &&
    kaarigarApplication.paymentStatus ===
      "PAID";

  const kaarigarApproved =
    user?.role === "KAARIGAR" &&
    kaarigarApplication?.status ===
      "APPROVED";

  return (
    <div className="min-h-screen bg-[#fff8ef]">
      <Navbar showAuth />

      <main>
        {/* =================================================
            HERO
        ================================================= */}

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-sm font-semibold text-[#75665e] transition hover:text-[#c65d3a]"
          >
            Back to Events
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
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} strokeWidth={1.8} />
                  <span>
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} strokeWidth={1.8} />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-8 max-w-3xl text-base leading-8 text-[#75665e]">
                {event.description ||
                  "Discover traditional crafts, talented kaarigars and cultural experiences at this event."}
              </p>
            </div>

            {/* =================================================
                REGISTRATION CARD
            ================================================= */}

            <div className="h-fit rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
              {/* ---------------------------------------------
                  VISITOR FEES
              --------------------------------------------- */}

              {user?.role === "VISITOR" &&
              !visitorPaid ? (
                <>
                  <p className="text-xs font-bold tracking-[0.16em] text-[#c65d3a]">
                    EVENT FEES
                  </p>

                  <div className="mt-3">
                    <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                      ₹{event.visitorFee}
                    </h2>

                    <p className="mt-1 text-sm text-[#75665e]">
                      Visitor entry fee
                    </p>
                  </div>
                </>
              ) : null}

              {/* ---------------------------------------------
                  KAARIGAR FEES
              --------------------------------------------- */}

              {user?.role === "KAARIGAR" &&
              !kaarigarPaid ? (
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-[#c65d3a]">
                    EVENT FEES
                  </p>

                  <div className="mt-3">
                    <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                      ₹{event.kaarigarFee}
                    </h2>

                    <p className="mt-1 text-sm text-[#75665e]">
                      Kaarigar participation fee
                    </p>
                  </div>
                </div>
              ) : null}

              {/* ---------------------------------------------
                  LOGGED OUT
              --------------------------------------------- */}

              {!user && (
                <>
                  <p className="text-xs font-bold tracking-[0.16em] text-[#c65d3a]">
                    EVENT FEES
                  </p>

                  <div className="mt-3 space-y-3">
                    <div>
                      <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                        ₹{event.visitorFee}
                      </h2>

                      <p className="mt-1 text-sm text-[#75665e]">
                        Visitor entry fee
                      </p>
                    </div>

                    <div>
                      <h2 className="font-['Playfair_Display'] text-3xl font-semibold text-[#3b2923]">
                        ₹{event.kaarigarFee}
                      </h2>

                      <p className="mt-1 text-sm text-[#75665e]">
                        Kaarigar participation fee
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/login")
                    }
                    className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
                  >
                    Register
                  </button>
                </>
              )}

              {/* ---------------------------------------------
                  VISITOR CONFIRMED
              --------------------------------------------- */}

              {user?.role === "VISITOR" &&
                visitorPaid && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <p className="text-xs font-bold tracking-[0.16em] text-green-700">
                      REGISTRATION CONFIRMED
                    </p>

                    <p className="mt-2 text-sm font-semibold text-green-700">
                      You are registered for this event.
                    </p>

                    <p className="mt-2 text-xs text-green-700">
                      Payment: PAID
                    </p>

                    {visitorRegistration?.ticketNumber && (
                      <div className="mt-4 rounded-lg bg-white p-4">
                        <p className="text-xs font-bold tracking-[0.12em] text-[#75665e]">
                          TICKET NUMBER
                        </p>

                        <p className="mt-1 text-lg font-bold tracking-[0.08em] text-[#c65d3a]">
                          {
                            visitorRegistration.ticketNumber
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* ---------------------------------------------
                  KAARIGAR CONFIRMED
              --------------------------------------------- */}

              {user?.role === "KAARIGAR" &&
                kaarigarPaid && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <p className="text-xs font-bold tracking-[0.16em] text-green-700">
                      PARTICIPATION CONFIRMED
                    </p>

                    <p className="mt-2 text-sm font-semibold text-green-700">
                      Your participation has been confirmed.
                    </p>

                    <p className="mt-2 text-xs text-green-700">
                      Payment: PAID
                    </p>

                    {kaarigarApplication?.ticketNumber && (
                      <div className="mt-4 rounded-lg bg-white p-4">
                        <p className="text-xs font-bold tracking-[0.12em] text-[#75665e]">
                          TICKET NUMBER
                        </p>

                        <p className="mt-1 text-lg font-bold tracking-[0.08em] text-[#c65d3a]">
                          {
                            kaarigarApplication.ticketNumber
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* ---------------------------------------------
                  VISITOR OLD STATUS / PENDING
              --------------------------------------------- */}

              {user?.role === "VISITOR" &&
                visitorRegistration &&
                !visitorPaid && (
                  <div className="mt-4 rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-700">
                    <p>
                      Registration:{" "}
                      {visitorRegistration.status ||
                        "REGISTERED"}
                    </p>

                    <p>
                      Payment:{" "}
                      {visitorRegistration.paymentStatus ||
                        "PENDING"}
                    </p>
                  </div>
                )}

              {/* ---------------------------------------------
                  KAARIGAR APPLICATION STATUS
              --------------------------------------------- */}

              {user?.role === "KAARIGAR" &&
                kaarigarApplication &&
                !kaarigarPaid && (
                  <div
                    className={`mt-4 rounded-lg px-3 py-3 text-sm font-semibold ${
                      kaarigarApplication.status ===
                      "APPROVED"
                        ? "bg-green-50 text-green-700"
                        : kaarigarApplication.status ===
                          "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Application:{" "}
                    {kaarigarApplication.status}

                    {kaarigarApplication.status ===
                      "APPROVED" && (
                      <>
                        <br />

                        Payment:{" "}
                        {kaarigarApplication.paymentStatus ||
                          "UNPAID"}
                      </>
                    )}
                  </div>
                )}

              {/* ---------------------------------------------
                  VISITOR BUTTON
              --------------------------------------------- */}

              {user?.role === "VISITOR" && (
                <button
                  onClick={handleRegistration}
                  disabled={
                    registering ||
                    visitorPaid
                  }
                  className={`mt-6 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white transition ${
                    visitorPaid
                      ? "cursor-not-allowed bg-[#9c8c84]"
                      : "bg-[#c65d3a] hover:bg-[#b45131]"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {registering
                    ? "Processing..."
                    : visitorPaid
                    ? "Registered"
                    : event.visitorFee > 0
                    ? "Register & Pay"
                    : "Register for Event"}
                </button>
              )}

              {/* ---------------------------------------------
                  KAARIGAR BUTTON
              --------------------------------------------- */}

              {user?.role === "KAARIGAR" &&
                !kaarigarPaid && (
                  <button
                    onClick={handleRegistration}
                    disabled={
                      registering ||
                      (kaarigarApplication !==
                        null &&
                        !kaarigarApproved)
                    }
                    className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {registering
                      ? "Processing..."
                      : kaarigarApplication
                      ? kaarigarApplication.status ===
                        "APPROVED"
                        ? "Pay Participation Fee"
                        : `Application ${kaarigarApplication.status}`
                      : "Apply for Event"}
                  </button>
                )}

              {/* ---------------------------------------------
                  MESSAGES
              --------------------------------------------- */}

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
            </div>
          </div>
        </section>

        {/* =================================================
            KAARIGARS
        ================================================= */}

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

      {/* =================================================
          FOOTER
      ================================================= */}

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