import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#fff8ef]">

      <Navbar />

      <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-sm font-semibold text-[#75665e] transition hover:text-[#c65d3a]"
          >
            ← Back
          </button>

          <section className="overflow-hidden rounded-2xl border border-[#eaded2] bg-white shadow-sm">
            <div className="border-b border-[#eaded2] bg-[#3b2923] px-6 py-8 text-white sm:px-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#c65d3a] text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-[#e7a88f]">
                    MY ACCOUNT
                  </p>
                  <h1 className="mt-2 font-['Playfair_Display'] text-3xl font-semibold sm:text-4xl">
                    {user.name}
                  </h1>
                  <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-[#eaded2]">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-8 p-6 sm:p-10">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
                  ACCOUNT DETAILS
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                      Full name
                    </span>
                    <p className="mt-2 text-sm font-semibold text-[#3b2923]">
                      {user.name}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                      Email address
                    </span>
                    <p className="mt-2 break-all text-sm font-semibold text-[#3b2923]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {user.role === "KAARIGAR" && (user.craftType || user.description) && (
                <div className="border-t border-[#eaded2] pt-8">
                  <p className="text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
                    CRAFT PROFILE
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {user.craftType && (
                      <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                          Craft type
                        </span>
                        <p className="mt-2 text-sm font-semibold text-[#3b2923]">
                          {user.craftType}
                        </p>
                      </div>
                    )}

                    {user.description && (
                      <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                          Craft description
                        </span>
                        <p className="mt-2 text-sm leading-6 text-[#3b2923]">
                          {user.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col justify-between gap-4 border-t border-[#eaded2] pt-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-[#3b2923]">
                    Sign out of this account
                  </p>
                  <p className="mt-1 text-xs text-[#75665e]">
                    You will return to the public home page.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-[#c65d3a] px-5 py-2.5 text-sm font-semibold text-[#c65d3a] transition hover:bg-[#c65d3a] hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

