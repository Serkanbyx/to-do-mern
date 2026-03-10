import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const INITIAL_FORM = { name: "", email: "", password: "" };

const validate = ({ name, email, password }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  return errors;
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      toast.success("Account created successfully!");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name.trim() && formData.email.trim() && formData.password.trim();

  const inputClass = (field) =>
    `block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:outline-none transition ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Start organizing your tasks today
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
        >
          {/* API Error Alert */}
          {apiError && (
            <div
              role="alert"
              className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {apiError}
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClass("name")}
            />
            {fieldErrors.name && (
              <p className="mt-1.5 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

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
              className={inputClass("email")}
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
            )}
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputClass("password")}
            />
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition"
          >
            {loading && <Spinner size="sm" className="border-white border-t-transparent" />}
            {loading ? "Creating account…" : "Create account"}
          </button>

          {/* Link to Login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
