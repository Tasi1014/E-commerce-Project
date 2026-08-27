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

  stock: z
    .coerce
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
});
