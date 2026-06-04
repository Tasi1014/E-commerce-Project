/**
 * FormInput.jsx
 * ─────────────────────────────────────────────
 * Reusable controlled input component for React Hook Form.
 *
 * This component NEVER manages its own state.
 * All state is owned by React Hook Form via the `Controller` wrapper.
 *
 * Props:
 *  - name        (string)   : RHF field name — must match the schema key
 *  - control     (object)   : RHF `control` object from useForm()
 *  - label       (string)   : Label text displayed above the input
 *  - type        (string)   : Input type — "text" | "email" | "password" (default: "text")
 *  - placeholder (string)   : Placeholder text inside the input
 *  - errors      (object)   : RHF `formState.errors` object — used to display field errors
 *
 * Usage:
 *  <FormInput
 *    name="email"
 *    control={control}
 *    label="Email Address"
 *    type="email"
 *    placeholder="you@example.com"
 *    errors={errors}
 *  />
 */

import { useState } from "react";
import { Controller } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function FormInput({
  name,
  control,
  label,
  type = "text",
  placeholder,
  errors,
  dark = false,
}) {
  // Local state ONLY for the password visibility toggle (UI concern, not form state)
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  // Determine the actual input type — if password field, toggle between "password" and "text"
  const inputType = isPassword && showPassword ? "text" : type;

  // Extract the error message for this specific field, if any
  const errorMessage = errors?.[name]?.message;

  return (
    <div className="mb-1 relative w-full">
      {/* ── Label ── */}
      {label && (
        <label
          className={`block text-[10px] font-bold uppercase tracking-wider mb-2 text-left ${
            dark ? "text-[#9ca3af]" : "text-[#49454f]"
          }`}
        >
          {label}
        </label>
      )}

      {/* ── Input wrapper with animated bottom border ── */}
      <div
        className={`relative flex items-center border-b transition-colors duration-200 ${
          errorMessage
            ? "border-red-400"                     // Red border when there's an error
            : dark
            ? "border-white/[0.08] focus-within:border-[#7c5cbf]/60" // Purple/violet in dark admin mode
            : "border-[#e6e0e9] focus-within:border-[#4f378a]" // Purple on light mode focus
        }`}
      >
        {/*
         * Controller is the RHF bridge between the uncontrolled DOM input
         * and RHF's internal form state. It provides `field` which contains:
         *   field.value    — the current value
         *   field.onChange — the RHF change handler
         *   field.onBlur   — the RHF blur handler (triggers validation)
         *   field.name     — the field name
         *   field.ref      — ref for focus management
         */}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field} // spread all RHF field props (value, onChange, onBlur, ref, name)
              type={inputType}
              placeholder={placeholder}
              className={`w-full pb-2 pt-1 text-sm bg-transparent outline-none border-none transition-colors duration-200 ${
                dark
                  ? "text-[#e8e3f0] placeholder-[#6b7280]"
                  : "text-[#1d1b20] placeholder-[#7a7582]"
              }`}
            />
          )}
        />

        {/* ── Password visibility toggle (eye icon) ── */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-0 bottom-2 bg-transparent border-none cursor-pointer flex items-center justify-center p-1 transition-colors duration-200 ${
              dark
                ? "text-[#6b7280] hover:text-[#7c5cbf]"
                : "text-[#49454f] hover:text-[#4f378a]"
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>

      {/* ── Inline error message (from Zod via RHF) ── */}
      {errorMessage && (
        <p className="mt-1.5 text-[11px] text-red-500 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
