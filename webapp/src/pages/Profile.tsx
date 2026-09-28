import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#fff8ef]">

      {/* Navbar */}
      <header className="border-b border-[#eaded2] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          {/* Logo */}
          <div
            className="flex cursor-pointer flex-col leading-none"
            onClick={() => navigate("/")}
          >
            <span className="text-xl font-bold tracking-wide text-[#3b2923]">
              KAARIGAR
            </span>

            <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
              EXPO
            </span>
          </div>

          {/* Home */}
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-[#d9c9bd] px-5 py-2.5 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
          >
            Home
          </button>
        </div>
      </header>

      {/* Profile */}
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm sm:p-8">

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
                MY ACCOUNT
              </p>

              <h1 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923]">
                Profile
              </h1>
            </div>

            {/* Avatar */}
            <div className="mb-8 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#c65d3a] text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-4">

              {/* Name */}
              <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                  Name
                </span>

                <strong className="mt-1 block text-sm text-[#3b2923]">
                  {user.name}
                </strong>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                  Email
                </span>

                <strong className="mt-1 block text-sm text-[#3b2923]">
                  {user.email}
                </strong>
              </div>

              {/* Role */}
              <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                  Role
                </span>

                <strong className="mt-1 block text-sm text-[#3b2923]">
                  {user.role}
                </strong>
              </div>

              {/* Kaarigar Information */}
              {user.role === "KAARIGAR" && (
                <>
                  {/* Craft Type */}
                  {user.craftType && (
                    <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                        Craft Type
                      </span>

                      <strong className="mt-1 block text-sm text-[#3b2923]">
                        {user.craftType}
                      </strong>
                    </div>
                  )}

                  {/* Description */}
                  {user.description && (
                    <div className="rounded-xl border border-[#eaded2] bg-[#fff8ef] p-4">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-[#75665e]">
                        Craft Description
                      </span>

                      <p className="mt-1 text-sm leading-6 text-[#3b2923]">
                        {user.description}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-8 w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131]"
            >
              Logout
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}

