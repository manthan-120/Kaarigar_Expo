import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

type EventCardProps = {
  id: string;
  title: string;
  location: string;
  date: string;
  visitorFee: number;
  kaarigarFee: number;
  role?: "VISITOR" | "KAARIGAR" | "ADMIN";
  description: string;
  image?:string;
  footer?: ReactNode;
};

export default function EventCard({
  id,
  title,
  location,
  date,
  visitorFee,
  kaarigarFee,
  role,
  description,
  image,
  footer,
}: EventCardProps) {
  const navigate = useNavigate();

  return (
    <article className="overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Event Image */}
      {image ? (
        <img
          src={image}
          alt={title}
          className="mb-4 h-48 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-[#eaded2]">
          <span className="text-xs font-bold tracking-[0.2em] text-[#75665e]">
            KAARIGAR EXPO
          </span>
        </div>
      )}
     
      {/* Content */}
      <div className="p-6">

        {/* Fees */}
        <div className="mb-4 space-y-1 text-sm font-bold text-[#c65d3a]">
          {(!role || role === "VISITOR" || role === "ADMIN") && (
            <p>Visitor Fee: ₹{visitorFee}</p>
          )}
          {(!role || role === "KAARIGAR" || role === "ADMIN") && (
            <p>Kaarigar Fee: ₹{kaarigarFee}</p>
          )}
        </div>

        {/* Title */}
        <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-[#3b2923]">
          {title}
        </h3>

        {/* Date */}
        <p className="mt-4 text-sm text-[#75665e]">
          📅 {date}
        </p>

        {/* Location */}
        <p className="mt-2 text-sm text-[#75665e]">
          📍 {location}
        </p>

        {/* Description */}
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#75665e]">
          {description}
        </p>

        {footer || (
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="mt-6 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
          >
            View Event
          </button>
        )}
      </div>
    </article>
  );
}

