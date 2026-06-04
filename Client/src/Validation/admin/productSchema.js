/**
 * productSchema.js
 * ─────────────────────────────────────────────
 * Zod validation schema for the Admin Add/Edit Product form.
 *
 * Fields:
 *  - name        : required, min 1, max 100 characters
 *  - price       : required, numeric, min 0.01
 *  - category    : required, must be "Men", "Women", or "Accessories"
 *  - description : required, min 1
 *  - mainImage   : required, must be a valid URL
 *  - images      : optional comma-separated list of URLs
 *  - stock       : required, integer, min 0
 *
 * Used with React Hook Form via zodResolver().
 */

import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name cannot exceed 100 characters")
    .trim(),

  price: z
    .coerce
    .number({ invalid_type_error: "Price must be a number" })
    .min(0.01, "Price must be greater than 0"),

  category: z
    .enum(["Men", "Women", "Accessories"], {
      errorMap: () => ({ message: "Category is required" }),
    }),

  description: z
    .string()
    .min(1, "Description is required")
    .trim(),

  mainImage: z
    .string()
    .min(1, "Main image URL is required")
    .url("Please enter a valid URL (starting with http:// or https://)")
    .trim(),

  images: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Check if all comma separated items are valid URLs if provided
        const urls = val.split(",").map((s) => s.trim()).filter(Boolean);
        return urls.every((url) => {
          try {
            new URL(url);
            return true;
          } catch (_) {
            return false;
          }
        });
      },
      { message: "Please ensure all additional image URLs are valid and comma-separated" }
    ),

  stock: z
    .coerce
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
});
