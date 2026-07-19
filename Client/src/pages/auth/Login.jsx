/**
 * Login.jsx  —  src/pages/auth/Login.jsx
 * ─────────────────────────────────────────────
 * Login page for PEAK with Customer / Admin toggle.
 *
 * - Customer mode: real backend login (/api/auth/login)
 * - Admin mode: real backend admin login (/api/auth/admin-login)
 * - "Forgot password?" only shown for customers
 */

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

// Validation schema (Zod)
import { loginSchema } from "../../Validation/auth/LoginSchema";

// Reusable form components
import FormContainer from "../../Components/form/FormContainer";
import FormInput from "../../Components/form/FormInput";
import FormButton from "../../Components/form/FormButton";

// API functions (axios)
import { loginUser, adminLogin } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer"); // "customer" or "admin"
  const { login } = useAuth();

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
      // Choose which API endpoint to call
      const apiCall = role === "admin" ? adminLogin : loginUser;
      const response = await apiCall(data);

      // Extract token and user from response
      const { token, user } = response.data;

      // Store authentication data globally
      login(user, token);

      toast.success(response.data.message || "Login successful");

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Handle errors from the backend
      const errorMsg = err.response?.data?.message || "Invalid email or password. Please try again.";
      toast.error(errorMsg);
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