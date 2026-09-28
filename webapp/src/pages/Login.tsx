import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "KAARIGAR") {
        navigate("/kaarigar");
      } else {
        navigate("/visitor");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8ef] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#eaded2] rounded-2xl shadow-sm px-6 py-8 sm:px-8">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center leading-none">
            <span className="text-2xl font-bold tracking-wide text-[#3b2923]">
              KAARIGAR
            </span>

            <span className="text-xs font-semibold tracking-[0.3em] text-[#c65d3a] mt-1">
              EXPO
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <p className="text-xs font-bold tracking-[0.18em] text-[#c65d3a] mb-2">
            WELCOME BACK
          </p>

          <h1 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923]">
            Login
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#75665e]">
            Login to manage your Kaarigar Expo activities.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-semibold text-[#3b2923]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm text-[#3b2923] outline-none transition placeholder:text-[#a5968e] focus:border-[#c65d3a] focus:ring-2 focus:ring-[#c65d3a]/10"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-[#3b2923]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm text-[#3b2923] outline-none transition placeholder:text-[#a5968e] focus:border-[#c65d3a] focus:ring-2 focus:ring-[#c65d3a]/10"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#c65d3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b45131] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-[#75665e]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#c65d3a] hover:underline"
          >
            Create Account
          </Link>
        </p>

        {/* Back Home */}
        <button
          onClick={() => navigate("/")}
          className="mt-5 w-full text-center text-sm font-medium text-[#75665e] transition hover:text-[#c65d3a]"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}