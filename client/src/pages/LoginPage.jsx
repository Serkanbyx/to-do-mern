import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");

    try {
      await login(formData.email.trim(), formData.password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your tasks
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
        >
          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Link to Register */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
