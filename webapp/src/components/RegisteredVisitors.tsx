import type { RefObject } from "react";
import type { Visitor } from "../types/visitor";

type RegisteredVisitorsProps = {
  visitors: Visitor[];
  visitorLoading: boolean;
  selectedEventName: string;
  sectionRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export default function RegisteredVisitors({
  visitors,
  visitorLoading,
  selectedEventName,
  sectionRef,
  onClose,
}: RegisteredVisitorsProps) {
  return (
    <section ref={sectionRef} className="mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Playfair_Display'] text-2xl font-bold">
            Registered Visitors
          </h2>

          <p className="mt-1 text-sm text-[#75665e]">
            Visitors registered for {selectedEventName}.
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg border border-[#d9c8bb] px-4 py-2 text-sm font-semibold transition hover:bg-[#fff8ef]"
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
            No visitors registered for this event yet.
          </div>
        ) : (
          <div className="divide-y divide-[#eaded2]">
            {visitors.map((visitor) => {
              const person = visitor.visitor || visitor.user;

              return (
                <div
                  key={visitor._id}
                  className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {person?.name || "Visitor"}
                    </h3>

                    <p className="mt-1 text-sm text-[#75665e]">
                      {person?.email || "No email available"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {visitor.status && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {visitor.status}
                      </span>
                    )}

                    {visitor.paymentStatus && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
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
  );
}