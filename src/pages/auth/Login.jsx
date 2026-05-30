/**
 * Login.jsx  —  src/pages/auth/Login.jsx
 * ─────────────────────────────────────────────
 * Login page for PEAK.
 *
 * Pattern used (STANDARD — follow this in ALL future forms):
 *  1. Define Zod schema in src/validation/auth/loginSchema.js
 *  2. useForm() with zodResolver(schema) — NO useState for field values
 *  3. Each field rendered via <FormInput name control errors />
 *  4. Submit button via <FormButton isLoading={isSubmitting} />
 *  5. Layout via <FormContainer title subtitle />
 *
 * Error handling:
 *  - Field errors  → come from formState.errors (Zod) — shown inline under each input
 *  - Server errors → shown via Sonner toast (toast.error) — no extra state needed
 */

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

export default function Login() {
  const navigate = useNavigate();

  // ─── React Hook Form setup ───────────────────────────────────────────────
  // control   → passed to each <FormInput> so Controller can bind to the field
  // handleSubmit → wraps onSubmit, only calls it if Zod validation passes
  // formState.errors → Zod error messages, passed to each <FormInput>
  // formState.isSubmitting → true while onSubmit is awaiting (drives loading button)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema), // Zod validates before onSubmit is called
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ─── Submit handler ──────────────────────────────────────────────────────
  // Only runs if Zod validation passes. `data` is fully typed and validated.
  const onSubmit = async (data) => {
    try {
      console.log("Login payload →", data);

      // ════════════════════════════════════════════════════
      // TODO: Replace mock below with your real API call
      //
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });
      //
      // const result = await response.json();
      //
      // if (!response.ok) {
      //   throw new Error(result.message || "Invalid credentials");
      // }
      //
      // localStorage.setItem("token", result.token);
      // ════════════════════════════════════════════════════

      // Mock 1.5s API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // ✅ Success toast
      toast.success("Welcome back! You're now signed in.");
      navigate("/"); // Redirect to home on success
    } catch (err) {
      // ❌ Server error toast (invalid credentials, network issues, etc.)
      toast.error(err.message || "Invalid email or password. Please try again.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <FormContainer
      title="Welcome Back"
      subtitle="Sign in to your PEAK account"
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

        {/* Password field — with eye toggle and inline "Forgot password?" link */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#49454f]">
              Password
            </span>
            <Link
              to="/forgot-password"
              className="text-[10px] font-bold text-[#4f378a] hover:text-[#5f479a] transition-colors duration-200 hover:underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          {/* Pass label={null} to suppress the default label inside FormInput */}
          <FormInput
            name="password"
            control={control}
            type="password"
            placeholder="••••••••"
            errors={errors}
          />
        </div>

        {/* Submit button — isSubmitting from RHF drives the loading state */}
        <div className="pt-2">
          <FormButton
            text="Sign In"
            loadingText="Signing In..."
            isLoading={isSubmitting}
          />
        </div>
      </form>

      {/* ── Footer: link to Register ── */}
      <p className="text-center text-sm text-[#49454f] mt-8 mb-0">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-xs font-bold text-[#4f378a] hover:text-[#5f479a] transition-colors duration-200 hover:underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </FormContainer>
  );
}
