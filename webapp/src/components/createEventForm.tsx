type CreateEventFormProps = {
  eventName: string;
  setEventName: (value: string) => void;

  eventDate: string;
  setEventDate: (value: string) => void;

  eventLocation: string;
  setEventLocation: (value: string) => void;

  eventDescription: string;
  setEventDescription: (value: string) => void;

  visitorFee: string;
  setVisitorFee: (value: string) => void;

  kaarigarFee: string;
  setKaarigarFee: (value: string) => void;

  eventImage: File | null;
  setEventImage: (file: File | null) => void;

  onSubmit: (e: React.FormEvent) => void;
};

export default function CreateEventForm({
  eventName,
  setEventName,
  eventDate,
  setEventDate,
  eventLocation,
  setEventLocation,
  eventDescription,
  setEventDescription,
  visitorFee,
  setVisitorFee,
  kaarigarFee,
  setKaarigarFee,
  eventImage,
  setEventImage,
  onSubmit,
}: CreateEventFormProps) {
  return (
    <form
      onSubmit={onSubmit}
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
  );
}