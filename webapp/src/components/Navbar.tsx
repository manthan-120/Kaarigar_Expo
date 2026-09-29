import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type NavbarProps = {
  role?: "ADMIN" | "KAARIGAR" | "VISITOR";
};

export default function Navbar({ role }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentRole = role || user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-[#eaded2] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="font-['Playfair_Display'] text-2xl font-bold tracking-wide text-[#3b2923]"
        >
          KAARIGAR EXPO
        </button>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/#events")}
            className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
          >
            Events
          </button>

          <button
            onClick={() => navigate("/#crafts")}
            className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
          >
            Crafts
          </button>

          <button
            onClick={() => navigate("/#about")}
            className="text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
          >
            About
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {currentRole === "ADMIN" ? (
            <>
              <button
                onClick={() => navigate("/admin")}
                className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:bg-[#fff8ef]"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-[#3b2923] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#251915]"
              >
                Logout
              </button>
            </>
          ) : user ? (
            <>
              <button
                onClick={() =>
                  navigate(
                    currentRole === "KAARIGAR"
                      ? "/kaarigar"
                      : "/"
                  )
                }
                className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:bg-[#fff8ef]"
              >
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-[#3b2923] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#251915]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:bg-[#fff8ef]"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="rounded-lg bg-[#c65d3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b45131]"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}