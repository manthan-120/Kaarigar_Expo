import type { Application } from "../types/application";

type ApplicationListProps = {
  applications: Application[];
  applicationLoading: string | null;
  onStatusChange: (
    applicationId: string,
    status: "APPROVED" | "REJECTED"
  ) => void;
};

export default function ApplicationList({
  applications,
  applicationLoading,
  onStatusChange,
}: ApplicationListProps) {
  return (
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
                    <div className="flex shrink-0 gap-2">
                      <button
                        disabled={
                          applicationLoading === application._id
                        }
                        onClick={() =>
                          onStatusChange(
                            application._id,
                            "APPROVED"
                          )
                        }
                        className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                          onStatusChange(
                            application._id,
                            "REJECTED"
                          )
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}