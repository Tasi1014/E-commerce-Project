/**
 * loginSchema.js
 * ─────────────────────────────────────────────
 * Zod validation schema for the Login form.
 *
 * Fields:
 *  - email    : must be a valid email address
 *  - password : required, minimum 6 characters
 *
 * Used with React Hook Form via zodResolver().
 */

import { z } from "zod";

export const loginSchema = z.object({
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
});