/**
 * registerSchema.js
 * ─────────────────────────────────────────────
 * Zod validation schema for the Register form.
 *
 * Fields:
 *  - firstName       : required
 *  - email           : must be a valid email address
 *  - password        : required, minimum 6 characters
 *  - confirmPassword : must exactly match the password field
 *
 * Used with React Hook Form via zodResolver().
 */

import { z } from "zod";

export const registerSchema = z
  .object({
    // First name must be non-empty
    firstName: z
      .string()
      .min(3, "First name is required")
      .max(20, "First name must be under 50 characters"),

    // Email must be non-empty and a valid email format
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    // Password must be non-empty and at least 6 characters
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),

    // Confirm password is required (cross-field check done via .refine below)
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  // Cross-field refinement: confirmPassword must match password
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // attach the error to the confirmPassword field
  });
