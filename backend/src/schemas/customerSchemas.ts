import { z } from "zod";
import { paginationFields } from "./common";

// Field list matches CustomerInput in customerService.ts
const customerFields = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(1).max(20),
  // Indian GSTIN: 2-digit state code + 10-char PAN + entity code + 'Z' + checksum.
  // Normalized to uppercase so "27aapfu..." and "27AAPFU..." can't coexist.
  gst_number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Invalid GST number format (e.g. 22AAAAA0000A1Z5)"),
});

export const createCustomerSchema = customerFields.partial({ email: true, phone: true, gst_number: true });

export const updateCustomerSchema = customerFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const listCustomersQuerySchema = z.object({
  ...paginationFields,
  search: z.string().max(100).optional(),
});
