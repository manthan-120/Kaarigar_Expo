import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ showAuth = false }: { showAuth?: boolean }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#eaded2] bg-[#fff8ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-wide text-[#3b2923]">
            KAARIGAR
          </span>

          <span className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-[#c65d3a]">
            EXPO
          </span>
        </div>

        {/* Profile */}
        {user ? (
          <button
            onClick={() => navigate("/profile")}
            className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
          >
            Profile
          </button>
        ) : showAuth ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border border-[#d9c9bd] px-4 py-2 text-sm font-semibold text-[#3b2923] transition hover:border-[#c65d3a] hover:text-[#c65d3a]"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="rounded-lg bg-[#c65d3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b45131]"
            >
              Register
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}