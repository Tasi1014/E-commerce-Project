/**
 * Register.jsx  —  src/pages/auth/Register.jsx
 * ─────────────────────────────────────────────
 * Register page for PEAK.
 *
 * Pattern used (STANDARD — follow this in ALL future forms):
 *  1. Define Zod schema in src/validation/auth/registerSchema.js
 *  2. useForm() with zodResolver(schema) — NO useState for field values
 *  3. Each field rendered via <FormInput name control errors />
 *  4. Submit button via <FormButton isLoading={isSubmitting} />
 *  5. Layout via <FormContainer title subtitle />
 *
 * Error handling:
 *  - Field errors  → come from formState.errors (Zod) — shown inline under each input
 *  - Server errors → shown via Sonner toast (toast.error) — no extra state needed
 *  - Cross-field (confirmPassword) → handled by Zod .refine() in registerSchema.js
 */

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

// Validation schema (Zod)
import { registerSchema } from "../../validation/auth/registerSchema";

// Reusable form components
import FormContainer from "../../components/form/FormContainer";
import FormInput from "../../components/form/FormInput";
import FormButton from "../../components/form/FormButton";

export default function Register() {
  const navigate = useNavigate();

  // ─── React Hook Form setup ───────────────────────────────────────────────
  // Same pattern as Login — just a different schema and more fields.
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema), // Zod validates before onSubmit is called
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ─── Submit handler ──────────────────────────────────────────────────────
  // Only runs if Zod validation passes (including the .refine() password match check).
  const onSubmit = async (data) => {
    try {
      console.log("Register payload →", data);

      // ════════════════════════════════════════════════════
      // TODO: Replace mock below with your real API call
      //
      // const response = await fetch("/api/auth/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     firstName: data.firstName,
      //     email: data.email,
      //     password: data.password,
      //   }),
      // });
      //
      // const result = await response.json();
      //
      // if (!response.ok) {
      //   throw new Error(result.message || "Registration failed");
      // }
      //
      // localStorage.setItem("token", result.token);
      // ════════════════════════════════════════════════════

      // Mock 1.5s API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // ✅ Success toast — then redirect to login
      toast.success("Account created! Welcome to PEAK.");
      navigate("/login");
    } catch (err) {
      // ❌ Server error toast (email already exists, network issues, etc.)
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <FormContainer
      title="Join PEAK"
      subtitle="Create an account to start your curated journey."
    >

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* First name field */}
        <FormInput
          name="firstName"
          control={control}
          label="First Name"
          type="text"
          placeholder="Your first name"
          errors={errors}
        />

        {/* Email field */}
        <FormInput
          name="email"
          control={control}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          errors={errors}
        />

        {/* Password field */}
        <FormInput
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="Password"
          errors={errors}
        />

        {/* Confirm password field */}
        {/* The "Passwords do not match" error comes from Zod .refine() in registerSchema.js */}
        <FormInput
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          type="password"
          placeholder="Confirm Password"
          errors={errors}
        />

        {/* Submit button — isSubmitting from RHF drives the loading state */}
        <div className="pt-2">
          <FormButton
            text="Create Account"
            loadingText="Creating Account..."
            isLoading={isSubmitting}
          />
        </div>
      </form>

      {/* ── Footer: link to Login ── */}
      <p className="text-center text-sm text-[#49454f] mt-8 mb-0">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-xs font-bold text-[#4f378a] hover:text-[#5f479a] transition-colors duration-200 hover:underline underline-offset-4"
        >
          Sign In
        </Link>
      </p>
    </FormContainer>
  );
}
