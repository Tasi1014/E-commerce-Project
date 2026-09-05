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
import { registerSchema } from "../../Validation/auth/registerSchema";

// Reusable form components
import FormContainer from "../../Components/form/FormContainer";
import FormInput from "../../Components/form/FormInput";
import FormButton from "../../Components/form/FormButton";
import { GoogleLogin } from "@react-oauth/google";

// API function (axios)
import { registerUser, googleLoginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { login } = useAuth();

  const handleAuthSuccess = (responseData, defaultMsg) => {
    const { token, user, message } = responseData;
    // Auto-login globally
    login(user, token);
    toast.success(message || defaultMsg);
    // Redirect to home page
    navigate("/");
  };

  const onSubmit = async (data) => {
    try {
      // Map frontend fields to backend expectations
      const payload = {
        name: data.firstName,    // backend expects 'name'
        email: data.email,
        password: data.password,
      };

      const response = await registerUser(payload);
      handleAuthSuccess(response.data, "Account created! Welcome to PEAK.");
    } catch (err) {
      // Handle server errors (e.g., email already exists)
      const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Google sign-in failed: no credential received");
        return;
      }
      const response = await googleLoginUser(credentialResponse.credential);
      handleAuthSuccess(response.data, "Welcome to PEAK!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Google Sign-In failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In failed. Please try again.");
  };

  return (
    <FormContainer
      title="Join PEAK"
      subtitle="Create an account to start your curated journey."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormInput
          name="firstName"
          control={control}
          label="First Name"
          type="text"
          placeholder="Your first name"
          errors={errors}
        />

        <FormInput
          name="email"
          control={control}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          errors={errors}
        />

        <FormInput
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="Password"
          errors={errors}
        />

        <FormInput
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          type="password"
          placeholder="Confirm Password"
          errors={errors}
        />

        <div className="pt-2">
          <FormButton
            text="Create Account"
            loadingText="Creating Account..."
            isLoading={isSubmitting}
          />
        </div>
      </form>

      {/* ── Divider ── */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e6e0e9]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-xs uppercase tracking-wider text-[#79747e] font-medium">
            or
          </span>
        </div>
      </div>

      {/* ── Google Sign-In Button ── */}
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          shape="rectangular"
          theme="outline"
          size="large"
          width="360"
          text="signup_with"
        />
      </div>

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