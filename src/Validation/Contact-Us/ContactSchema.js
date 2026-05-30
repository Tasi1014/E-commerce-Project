import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  message: z
    .string()
    .min(2, "Message is required")
    .min(10, "Message must be at least 10 characters"),
});