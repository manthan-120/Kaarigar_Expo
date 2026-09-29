import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminStatCard from "../components/AdminStatCard";
import EventCard from "../components/EventCard";
import { api } from "../services/api";
import { useEvents } from "../hooks/useEvents";

type Application = {
  _id: string;
  event: {
    _id: string;
    name: string;
    date: string;
    location: string;
  };
  kaarigar: {
    _id: string;
    name: string;
    email: string;
  };
  craftType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type Visitor = {
  _id: string;
  visitor?: {
    _id: string;
    name: string;
    email: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  paymentStatus?: string;
  status?: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationLoading, setApplicationLoading] = useState<string | null>(
    null
  );
  const [visitorLoading, setVisitorLoading] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [visitorFee, setVisitorFee] = useState("");
  const [kaarigarFee, setKaarigarFee] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visitorSectionRef = useRef<HTMLElement>(null);
  const {
  events,
  loading: eventsLoading,
  error: eventsError,
  refetch: refetchEvents,
} = useEvents();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    fetchDashboard();
  }, [user]);

  useEffect(() => {
    if (!selectedEvent) return;

    requestAnimationFrame(() => {
      visitorSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [selectedEvent]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const applicationsData = await api("/applications");

      setApplications(applicationsData.applications || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError("");
            setMessage("");

            if (
            !eventName ||
            !eventDate ||
            !eventLocation ||
            !visitorFee ||
            !kaarigarFee
            ) {
            setError("Please fill all required event fields.");
            return;
            }

            const formData = new FormData();

            formData.append("name", eventName);
            formData.append("date", eventDate);
            formData.append("location", eventLocation);
            formData.append("description", eventDescription);
            formData.append("visitorFee", String(Number(visitorFee)));
            formData.append("kaarigarFee", String(Number(kaarigarFee)));

            if (eventImage) {
            formData.append("image", eventImage);
            }

            await api("/events", {
            method: "POST",
            body: formData,
            });

            setMessage("Event created successfully.");

            setEventName("");
            setEventDate("");
            setEventLocation("");
            setEventDescription("");
            setVisitorFee("");
            setKaarigarFee("");
            setEventImage(null);

            setShowCreateEvent(false);

            await fetchDashboard();
            await refetchEvents();
        } catch (err) {
            setError(
            err instanceof Error ? err.message : "Failed to create event"
            );
        }
    };

  const handleApplicationStatus = async (
    applicationId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setApplicationLoading(applicationId);
      setError("");
      setMessage("");

      await api(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      });

      setMessage(
        status === "APPROVED"
          ? "Application approved successfully."
          : "Application rejected successfully."
      );

      await fetchDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update application"
      );
    } finally {
      setApplicationLoading(null);
    }
  };

  const handleViewVisitors = async (eventId: string) => {
    try {
      setSelectedEvent(eventId);
      setVisitorLoading(true);
      setError("");

      const data = await api(`/rsvps/event/${eventId}`);

      setVisitors(data.rsvps || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load event visitors"
      );
      setVisitors([]);
    } finally {
      setVisitorLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pendingApplications = applications.filter(
    (application) => application.status === "PENDING"
  );

  const approvedApplications = applications.filter(
    (application) => application.status === "APPROVED"
  );

  if (loading||eventsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]">
        <p className="text-[#75665e]">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] text-[#3b2923]">
      {/* Header */}
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#75665e]">
              Manage Kaarigar Expo events and participants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:bg-[#fff8ef]"
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
        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {(error||eventsError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error||eventsError}
          </div>
        )}

        {/* Statistics */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Total Events"
            value={events.length}
          />

          <AdminStatCard
            title="Applications"
            value={applications.length}
          />

          <AdminStatCard
            title="Pending"
            value={pendingApplications.length}
            valueClassName="text-amber-600"
          />

          <AdminStatCard
            title="Approved"
            value={approvedApplications.length}
            valueClassName="text-green-600"
          />
        </section>

        {/* Create Event */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold">
                Events
              </h2>

              <p className="mt-1 text-sm text-[#75665e]">
                Create and manage Expo events.
              </p>
            </div>

            <button
              onClick={() => setShowCreateEvent(!showCreateEvent)}
              className="rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
            >
              {showCreateEvent ? "Close Form" : "+ Create Event"}
            </button>
          </div>

          {showCreateEvent && (
            <form
              onSubmit={handleCreateEvent}
              className="mt-6 rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm"
            >
              <h3 className="font-['Playfair_Display'] text-xl font-bold">
                Create New Event
              </h3>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">
                    Event Name
                  </label>

                  <input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Goa Handicraft Mela"
                    className="mt-2 w-full rounded-lg border border-[#d9c9bd] px-4 py-3 outline-none focus:border-[#c65d3a]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Event Date
                  </label>

                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#d9c9bd] px-4 py-3 outline-none focus:border-[#c65d3a]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Location
                  </label>

                  <input
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Panjim, Goa"
                    className="mt-2 w-full rounded-lg border border-[#d9c9bd] px-4 py-3 outline-none focus:border-[#c65d3a]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Visitor Fee
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={visitorFee}
                    onChange={(e) => setVisitorFee(e.target.value)}
                    placeholder="100"
                    className="mt-2 w-full rounded-lg border border-[#d9c9bd] px-4 py-3 outline-none focus:border-[#c65d3a]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Kaarigar Fee
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={kaarigarFee}
                    onChange={(e) => setKaarigarFee(e.target.value)}
                    placeholder="500"
                    className="mt-2 w-full rounded-lg border border-[#d9c9bd] px-4 py-3 outline-none focus:border-[#c65d3a]"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold">
                  Description
                </label>

                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe the event..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-[#d9c9bd] px-4 py-3 outline-none focus:border-[#c65d3a]"
                />
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold">
                    Event Image
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                    setEventImage(e.target.files?.[0] || null);
                    }}
                    className="mt-2 block w-full rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm"
                />

                {eventImage && (
                    <p className="mt-2 text-sm text-[#75665e]">
                    Selected: {eventImage.name}
                    </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-6 rounded-lg bg-[#c65d3a] px-6 py-3 font-semibold text-white transition hover:bg-[#b45131]"
              >
                Create Event
              </button>
            </form>
          )}

          {/* Events */}
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-[#eaded2] bg-white p-8 text-center text-[#75665e] md:col-span-2 lg:col-span-3">
                No events available.
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
                    role="ADMIN"
                    description={
                      event.description || "Discover this upcoming exhibition."
                    }
                    image={event.image}
                    footer={
                      <button
                        onClick={() => handleViewVisitors(event._id)}
                        className="mt-6 w-full rounded-lg border border-[#c65d3a] px-4 py-3 text-sm font-semibold text-[#c65d3a] transition hover:bg-[#c65d3a] hover:text-white"
                      >
                        View Registered Visitors
                      </button>
                    }
                  />
                ))
              )}
          </div>
        </section>

        {/* Applications */}
        <section className="mt-12">
          <div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold">
              Kaarigar Applications
            </h2>

            <p className="mt-1 text-sm text-[#75665e]">
              Review applications and approve or reject participation.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-[#75665e]">
                No Kaarigar applications yet.
              </div>
            ) : (
              <div className="divide-y divide-[#eaded2]">
                {applications.map((application) => (
                  <div
                    key={application._id}
                    className="p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold">
                            {application.kaarigar?.name || "Kaarigar"}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              application.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : application.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-[#75665e]">
                          {application.kaarigar?.email}
                        </p>

                        <p className="mt-3 text-sm">
                          <span className="font-semibold">Event:</span>{" "}
                          {application.event?.name}
                        </p>

                        <p className="mt-1 text-sm">
                          <span className="font-semibold">Craft:</span>{" "}
                          {application.craftType}
                        </p>

                        {application.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75665e]">
                            {application.description}
                          </p>
                        )}
                      </div>

                      {application.status === "PENDING" && (
                        <div className="flex shrink-0 gap-3">
                          <button
                            disabled={
                              applicationLoading === application._id
                            }
                            onClick={() =>
                              handleApplicationStatus(
                                application._id,
                                "APPROVED"
                              )
                            }
                            className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {applicationLoading === application._id
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            disabled={
                              applicationLoading === application._id
                            }
                            onClick={() =>
                              handleApplicationStatus(
                                application._id,
                                "REJECTED"
                              )
                            }
                            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Visitor Registrations */}
        {selectedEvent && (
          <section ref={visitorSectionRef} className="mt-12 scroll-mt-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-['Playfair_Display'] text-2xl font-bold">
                  Registered Visitors
                </h2>

                <p className="mt-1 text-sm text-[#75665e]">
                  Visitors registered for the selected event.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setVisitors([]);
                }}
                className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm">
              {visitorLoading ? (
                <div className="p-8 text-center text-[#75665e]">
                  Loading visitors...
                </div>
              ) : visitors.length === 0 ? (
                <div className="p-8 text-center text-[#75665e]">
                  No visitors registered for this event.
                </div>
              ) : (
                <div className="divide-y divide-[#eaded2]">
                  {visitors.map((visitor, index) => {
                    const person = visitor.visitor || visitor.user;

                    return (
                      <div
                        key={visitor._id}
                        className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-semibold">
                            {index + 1}.{" "}
                            {person?.name || "Visitor"}
                          </p>

                          <p className="mt-1 text-sm text-[#75665e]">
                            {person?.email || "Email unavailable"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {visitor.status && (
                            <span className="rounded-full bg-[#f4eee8] px-3 py-1 text-xs font-semibold">
                              {visitor.status}
                            </span>
                          )}

                          {visitor.paymentStatus && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Payment: {visitor.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
