import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminStatCard from "../components/AdminStatCard";
import EventCard from "../components/EventCard";
import { api } from "../services/api";
import { useEvents } from "../hooks/useEvents";
import type { Application } from "../types/application";
import RegisteredVisitors from "../components/RegisteredVisitors";
import type { Visitor } from "../types/visitor";
import type { Event } from "../types/event";
import CreateEventForm from "../components/createEventForm";
import ApplicationList from "../components/ApplicationList";
import Navbar from "../components/Navbar";
export default function Admin() {
  const navigate = useNavigate();
  const { user} = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

 const handleViewVisitors = async (event: Event) => {
    try {
      setSelectedEvent(event);
      setVisitorLoading(true);
      setError("");

      const data = await api(`/rsvps/event/${event._id}`);

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

  const pendingApplications = applications.filter(
    (application) => application.status === "PENDING"
  );

  const approvedApplications = applications.filter(
    (application) => application.status === "APPROVED"
  );

  if (loading || eventsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8ef]">
        <p className="text-[#75665e]">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] text-[#3b2923]">
      {/* Header */}
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {(error || eventsError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || eventsError}
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
            <CreateEventForm
              eventName={eventName}
              setEventName={setEventName}
              eventDate={eventDate}
              setEventDate={setEventDate}
              eventLocation={eventLocation}
              setEventLocation={setEventLocation}
              eventDescription={eventDescription}
              setEventDescription={setEventDescription}
              visitorFee={visitorFee}
              setVisitorFee={setVisitorFee}
              kaarigarFee={kaarigarFee}
              setKaarigarFee={setKaarigarFee}
              eventImage={eventImage}
              setEventImage={setEventImage}
              onSubmit={handleCreateEvent}
            />
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
                        onClick={() => handleViewVisitors(event)}
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
        <ApplicationList
          applications={applications}
          applicationLoading={applicationLoading}
          onStatusChange={handleApplicationStatus}
        />

        {/* Visitor Registrations */}
        {selectedEvent && (
          <RegisteredVisitors
            visitors={visitors}
            visitorLoading={visitorLoading}
            selectedEventName={selectedEvent.name}
            sectionRef={visitorSectionRef}
            onClose={() => {
              setSelectedEvent(null);
              setVisitors([]);
            }}
          />
        )}
      </main>
    </div>
  );
}
