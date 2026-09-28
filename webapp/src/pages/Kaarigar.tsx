
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
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

type Application = {
  _id: string;

  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };

  kaarigar?: {
    _id: string;
    name: string;
    email: string;
  };

  craftType: string;
  description?: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  paymentStatus?: string;

  createdAt?: string;
};

export default function Kaarigar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "KAARIGAR") {
      navigate("/");
      return;
    }

    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsData, applicationsData] = await Promise.all([
        api("/events"),
        api("/applications/my"),
      ]);

      setEvents(eventsData.events || []);
      setApplications(applicationsData.applications || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Kaarigar dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (eventId: string) => {
    try {
      setApplying(eventId);
      setError("");
      setMessage("");

      await api("/applications", {
        method: "POST",
        body: JSON.stringify({
          eventId,
          craftType: user?.craftType,
          description: user?.description,
        }),
      });

      setMessage("Application submitted successfully.");

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit application"
      );
    } finally {
      setApplying(null);
    }
  };

  const handlePayment = async (application: Application) => {
    if (!application.event?._id) return;

    try {
      setPaying(application._id);
      setError("");
      setMessage("");

      const payment = await payWithCashfree(
        application.event._id,
        "KAARIGAR_APPLICATION"
      );

      if (payment.status === "SUCCESS") {
        setMessage("Application payment completed successfully.");
        await loadDashboard();
      } else {
        setError(
          payment.status === "PENDING"
            ? "Payment is still pending. Please refresh shortly."
            : "Payment was not completed."
        );
      }
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Payment failed"
      );
    } finally {
      setPaying(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getApplicationForEvent = (eventId: string) => {
    return applications.find(
      (application) => application.event?._id === eventId
    );
  };

  const pendingApplications = applications.filter(
    (application) => application.status === "PENDING"
  );

  const approvedApplications = applications.filter(
    (application) => application.status === "APPROVED"
  );

  const rejectedApplications = applications.filter(
    (application) => application.status === "REJECTED"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]">
        <p className="text-[#75665e]">
          Loading Kaarigar dashboard...
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
              Kaarigar Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#75665e]">
              Discover events and manage your applications
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
              onClick={() => navigate("/profile")}
              className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold transition hover:bg-[#fff8ef]"
            >
              Profile
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

        {/* ================= MESSAGES ================= */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

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

          {user?.craftType && (
            <p className="mt-2 text-sm font-semibold text-[#e7a88f]">
              {user.craftType}
            </p>
          )}

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#eaded2]">
            Find upcoming exhibitions, apply to participate and
            track your application status.
          </p>

        </section>

        {/* ================= STATS ================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              Available Events
            </p>

            <p className="mt-2 text-3xl font-bold">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              My Applications
            </p>

            <p className="mt-2 text-3xl font-bold">
              {applications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingApplications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#75665e]">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {approvedApplications.length}
            </p>
          </div>

        </section>

        {/* ================= AVAILABLE EVENTS ================= */}

        <section className="mt-12">

          <div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold">
              Available Events
            </h2>

            <p className="mt-1 text-sm text-[#75665e]">
              Apply to events where you want to showcase your craft.
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {events.length === 0 ? (
              <div className="rounded-2xl border border-[#eaded2] bg-white p-8 text-center text-[#75665e] md:col-span-2 lg:col-span-3">
                No upcoming events available.
              </div>
            ) : (
              events.map((event) => {

                const application =
                  getApplicationForEvent(event._id);

                return (
                  <article
                    key={event._id}
                    className="overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

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
                        Kaarigar Fee: ₹{event.kaarigarFee}
                      </div>

                      <h3 className="font-['Playfair_Display'] text-2xl font-semibold">
                        {event.name}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-[#75665e]">

                        <p>
                          📅{" "}
                          {new Date(
                            event.date
                          ).toLocaleDateString()}
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

                      {/* Application status */}

                      {application ? (
                        <div className="mt-6">

                          <div
                            className={`rounded-lg px-4 py-3 text-center text-sm font-semibold ${
                              application.status ===
                              "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : application.status ===
                                  "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Application:{" "}
                            {application.status}
                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/events/${event._id}`
                              )
                            }
                            className="mt-3 w-full rounded-lg border border-[#c65d3a] px-5 py-3 text-sm font-semibold text-[#c65d3a] transition hover:bg-[#c65d3a] hover:text-white"
                          >
                            View Event
                          </button>

                        </div>
                      ) : (
                        <div className="mt-6 flex gap-3">

                          <button
                            onClick={() =>
                              navigate(
                                `/events/${event._id}`
                              )
                            }
                            className="flex-1 rounded-lg border border-[#d9c9bd] px-4 py-3 text-sm font-semibold transition hover:bg-[#fff8ef]"
                          >
                            View
                          </button>

                          <button
                            disabled={
                              applying === event._id
                            }
                            onClick={() =>
                              handleApply(event._id)
                            }
                            className="flex-1 rounded-lg bg-[#c65d3a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131] disabled:opacity-50"
                          >
                            {applying === event._id
                              ? "Applying..."
                              : "Apply"}
                          </button>

                        </div>
                      )}

                    </div>
                  </article>
                );
              })
            )}

          </div>

        </section>

        {/* ================= MY APPLICATIONS ================= */}

        <section className="mt-12">

          <div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold">
              My Applications
            </h2>

            <p className="mt-1 text-sm text-[#75665e]">
              Track the status of your event applications.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm">

            {applications.length === 0 ? (
              <div className="p-8 text-center text-[#75665e]">
                You have not applied to any event yet.
              </div>
            ) : (
              <div className="divide-y divide-[#eaded2]">

                {applications.map((application) => (

                  <div
                    key={application._id}
                    className="p-6"
                  >

                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                      <div>

                        <h3 className="font-['Playfair_Display'] text-xl font-bold">
                          {application.event?.name ||
                            "Event"}
                        </h3>

                        <div className="mt-3 space-y-1 text-sm text-[#75665e]">

                          {application.event?.date && (
                            <p>
                              📅{" "}
                              {new Date(
                                application.event.date
                              ).toLocaleDateString()}
                            </p>
                          )}

                          {application.event?.location && (
                            <p>
                              📍{" "}
                              {application.event.location}
                            </p>
                          )}

                        </div>

                        <p className="mt-3 text-sm">
                          <span className="font-semibold">
                            Craft:
                          </span>{" "}
                          {application.craftType}
                        </p>

                        {application.createdAt && (
                          <p className="mt-2 text-xs text-[#75665e]">
                            Applied on{" "}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}

                      </div>

                      <div className="flex flex-wrap items-center gap-3">

                        <span
                          className={`rounded-full px-4 py-2 text-xs font-bold ${
                            application.status ===
                            "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : application.status ===
                                "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {application.status}
                        </span>

                        <button
                          onClick={() =>
                            navigate(
                              `/events/${application.event?._id}`
                            )
                          }
                          className="rounded-lg border border-[#c65d3a] px-4 py-2 text-sm font-semibold text-[#c65d3a] transition hover:bg-[#c65d3a] hover:text-white"
                        >
                          View Event
                        </button>

                        {application.status === "APPROVED" &&
                          application.paymentStatus !== "PAID" && (
                            <button
                              onClick={() => handlePayment(application)}
                              disabled={paying === application._id}
                              className="rounded-lg bg-[#c65d3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b45131] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {paying === application._id
                                ? "Processing..."
                                : "Pay Participation Fee"}
                            </button>
                          )}

                        {application.paymentStatus === "PAID" && (
                          <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                            Payment: PAID
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

        </section>

        {/* ================= REJECTED INFO ================= */}

        {rejectedApplications.length > 0 && (
          <section className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">

            <h3 className="font-semibold text-red-800">
              Rejected Applications
            </h3>

            <p className="mt-1 text-sm text-red-700">
              You have {rejectedApplications.length} rejected
              application
              {rejectedApplications.length > 1 ? "s" : ""}.
            </p>

          </section>
        )}

      </main>
    </div>
  );
}

