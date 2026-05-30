/**
 * Login.jsx  —  src/pages/auth/Login.jsx
 * ─────────────────────────────────────────────
 * Login page for PEAK with Customer / Admin toggle.
 *
 * - Customer mode: normal login (API call mock)
 * - Admin mode: hardcoded credentials, "Forgot password?" hidden
 */

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

// Validation schema (Zod)
import { loginSchema } from "../../validation/auth/loginSchema";

// Reusable form components
import FormContainer from "../../components/form/FormContainer";
import FormInput from "../../components/form/FormInput";
import FormButton from "../../components/form/FormButton";

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@peak.com",
  password: "admin123",
};

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer"); // "customer" or "admin"

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      if (role === "admin") {
        // ─── Admin login (hardcoded) ──────────────────────────
        if (
          data.email === ADMIN_CREDENTIALS.email &&
          data.password === ADMIN_CREDENTIALS.password
        ) {
          toast.success("Admin login successful!");
          // TODO: store admin token/session if needed
          navigate("/admin/dashboard"); // Redirect to admin panel
        } else {
          throw new Error("Invalid admin credentials");
        }
      } else {
        // ─── Customer login (API mock – replace with real call) ──
        console.log("Customer login payload →", data);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Welcome back! You're now signed in.");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Invalid email or password. Please try again.");
    }
  };

  // Toggle between customer and admin
  const toggleRole = () => {
    setRole((prev) => (prev === "customer" ? "admin" : "customer"));
    reset(); // Clear form fields when switching roles
  };

  return (
    <FormContainer
      title="Welcome Back"
      subtitle={
        role === "admin"
          ? "Admin access – secure sign in"
          : "Sign in to your PEAK account"
      }
    >

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Email field */}
        <FormInput
          name="email"
          control={control}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          errors={errors}
        />

        {/* Password field + conditional "Forgot password?" */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#49454f]">
              Password
            </span>
            {/* Show "Forgot password?" only in customer mode */}
            {role === "customer" && (
              <Link
                to="/forgot-password"
                className="text-[10px] font-bold text-[#4f378a] hover:text-[#5f479a] transition-colors duration-200 hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <FormInput
            name="password"
            control={control}
            type="password"
            placeholder="password"
            errors={errors}
          />
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <FormButton
            text={role === "admin" ? "Admin Sign In" : "Sign In"}
            loadingText="Signing In..."
            isLoading={isSubmitting}
          />
        </div>
      </form>

      {/* ── Footer: link to Register (only for customer mode) ── */}
      {role === "customer" && (
        <p className="text-center text-sm text-[#49454f] mt-8 mb-0">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-xs font-bold text-[#4f378a] hover:text-[#5f479a] transition-colors duration-200 hover:underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      )}
      {/* ── Toggle Button ── */}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={toggleRole}
          className={`
            relative inline-flex h-8 w-16 items-center rounded-full transition-colors
            ${role === "admin" ? "bg-[#4f378a]" : "bg-gray-300"}
          `}
        >
          <span
            className={`
              inline-block h-6 w-6 transform rounded-full bg-white transition-transform
              ${role === "admin" ? "translate-x-9" : "translate-x-1"}
            `}
          />
        </button>
        <span className="ml-3 text-sm font-medium text-[#49454f]">
          {role === "customer" ? "Customer Login" : "Admin Login"}
        </span>
      </div>
    </FormContainer>
    
  );
}