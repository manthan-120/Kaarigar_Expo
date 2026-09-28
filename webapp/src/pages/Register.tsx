import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RegisterRole = "VISITOR" | "KAARIGAR";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [craftType, setCraftType] = useState("");
  const [description, setDescription] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<RegisterRole>("VISITOR");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: RegisterRole) => {
    setRole(newRole);

    // Clear Kaarigar-specific fields when switching to Visitor
    if (newRole === "VISITOR") {
      setCraftType("");
      setDescription("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "KAARIGAR") {
      if (!craftType.trim() || !description.trim()) {
        setError("Craft type and description are required for Kaarigar.");
        return;
      }
    }

    setLoading(true);

    try {
      const user = await register(
        name,
        email,
        password,
        role,
        role === "KAARIGAR" ? craftType : undefined,
        role === "KAARIGAR" ? description : undefined
      );

      if (user.role === "KAARIGAR") {
        navigate("/kaarigar");
      } else {
        navigate("/visitor");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8ef] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-[#eaded2] bg-white px-6 py-8 shadow-sm sm:px-8">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center leading-none">
          <span className="text-2xl font-bold tracking-wide text-[#3b2923]">
            KAARIGAR
          </span>

          <span className="mt-1 text-xs font-semibold tracking-[0.3em] text-[#c65d3a]">
            EXPO
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c65d3a]">
            JOIN KAARIGAR EXPO
          </p>

          <h1 className="font-['Playfair_Display'] text-4xl font-semibold text-[#3b2923]">
            Create Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#75665e]">
            Join as a visitor or become a Kaarigar.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-[#3b2923]"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm text-[#3b2923] outline-none transition placeholder:text-[#a5968e] focus:border-[#c65d3a] focus:ring-2 focus:ring-[#c65d3a]/10"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#3b2923]"
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

          {/* Role */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-[#3b2923]">
              I am joining as
            </label>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* Visitor */}
              <button
                type="button"
                onClick={() => handleRoleChange("VISITOR")}
                className={`rounded-xl border p-4 text-left transition ${
                  role === "VISITOR"
                    ? "border-[#c65d3a] bg-[#c65d3a]/5 ring-2 ring-[#c65d3a]/10"
                    : "border-[#eaded2] bg-white hover:border-[#d9c9bd]"
                }`}
              >
                <strong className="block text-sm font-semibold text-[#3b2923]">
                  Visitor
                </strong>

                <span className="mt-1 block text-xs leading-5 text-[#75665e]">
                  Explore events and register
                </span>
              </button>

              {/* Kaarigar */}
              <button
                type="button"
                onClick={() => handleRoleChange("KAARIGAR")}
                className={`rounded-xl border p-4 text-left transition ${
                  role === "KAARIGAR"
                    ? "border-[#c65d3a] bg-[#c65d3a]/5 ring-2 ring-[#c65d3a]/10"
                    : "border-[#eaded2] bg-white hover:border-[#d9c9bd]"
                }`}
              >
                <strong className="block text-sm font-semibold text-[#3b2923]">
                  Kaarigar
                </strong>

                <span className="mt-1 block text-xs leading-5 text-[#75665e]">
                  Apply to participate in events
                </span>
              </button>

            </div>
          </div>

          {/* Kaarigar Fields */}
          {role === "KAARIGAR" && (
            <>
              {/* Craft Type */}
              <div>
                <label
                  htmlFor="craftType"
                  className="mb-2 block text-sm font-semibold text-[#3b2923]"
                >
                  Craft Type
                </label>

                <input
                  id="craftType"
                  type="text"
                  placeholder="e.g. Pottery, Wood Carving, Handloom"
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm text-[#3b2923] outline-none transition placeholder:text-[#a5968e] focus:border-[#c65d3a] focus:ring-2 focus:ring-[#c65d3a]/10"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-[#3b2923]"
                >
                  Craft Description
                </label>

                <textarea
                  id="description"
                  placeholder="Briefly describe your craft..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm text-[#3b2923] outline-none transition placeholder:text-[#a5968e] focus:border-[#c65d3a] focus:ring-2 focus:ring-[#c65d3a]/10"
                />
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#3b2923]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#d9c9bd] bg-white px-4 py-3 text-sm text-[#3b2923] outline-none transition placeholder:text-[#a5968e] focus:border-[#c65d3a] focus:ring-2 focus:ring-[#c65d3a]/10"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-[#3b2923]"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-[#75665e]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#c65d3a] hover:underline"
          >
            Login
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