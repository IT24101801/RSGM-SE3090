import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Mail,
  AlertCircle,
} from "lucide-react";

import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";

import {
  loginUser,
  saveAuth,
} from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      // Send data to ASP.NET backend.
      const response = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      console.log(
        "Login response:",
        response
      );

      // Save JWT.
      saveAuth(
        response,
        form.rememberMe
      );

      const roles = response.roles || [];
      
      if (roles.includes("SystemAdmin")) {
        navigate("/admin");
      } else if (roles.includes("Recruiter")) {
        navigate("/recruiter");
      } else if (roles.includes("HRManager")) {
        navigate("/hr");
      } else if (roles.includes("JobSeeker")) {
        navigate("/jobs");
      } else if (roles.includes("HiringPanelist")) {
        navigate("/panelist");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err.message ||
          "Unable to login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      badge="WELCOME BACK"
      title="Sign in to RSGM"
      subtitle="Access your account and continue managing your recruitment workflow."
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* EMAIL */}

        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={handleChange}
          icon={Mail}
          required
          autoComplete="email"
        />

        {/* PASSWORD */}

        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">

            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* OPTIONS */}

        <div className="flex items-center justify-between gap-4">

          <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-500">

            <input
              type="checkbox"
              name="rememberMe"
              checked={
                form.rememberMe
              }
              onChange={
                handleChange
              }
              className="w-4 h-4 rounded border-neutral-300 accent-violet-600"
            />

            Remember me

          </label>

          <button
            type="button"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition"
          >
            Forgot password?
          </button>

        </div>

        {/* LOGIN */}

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full h-12 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-3 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >

          {isLoading
            ? "Signing in..."
            : "Sign in"}

          {!isLoading && (
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          )}

        </button>

      </form>

      {/* DIVIDER */}

      <div className="relative my-7">

        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>

        <div className="relative flex justify-center">

          <span className="bg-white px-4 text-xs text-neutral-400">
            NEW TO RSGM?
          </span>

        </div>

      </div>

      {/* REGISTER */}

      <p className="text-center text-sm text-neutral-500">

        Don't have an account?{" "}

        <Link
          to="/register"
          className="font-semibold text-violet-600 hover:text-violet-700"
        >
          Create account
        </Link>

      </p>

    </AuthShell>
  );
}

export default LoginPage;