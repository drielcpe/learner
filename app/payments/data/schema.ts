import { z } from "zod"

export const paymentStatusSchema = z.enum(["pending", "processing", "completed", "failed", "cancelled"])
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const paymentMethodSchema = z.enum(["gcash", "cash", "bank_transfer"])
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const paymentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  grade: z.string(),
  section: z.string(),
  adviser: z.string(),
  amount: z.number(),
  payment_method: paymentMethodSchema,
  status: paymentStatusSchema,
  reference_number: z.string().optional(),
  qr_code: z.string().optional().nullable(),
  transaction_proof: z.string().optional().nullable(), // Add this line
  uploaded_at: z.string().optional().nullable(), // Add this line
  created_at: z.string(),
  updated_at: z.string(),
  due_date: z.string().optional(),
  description: z.string().optional(),
})

export type Payment = z.infer<typeof paymentSchema>

export const PAYMENT_STATUSES = ["pending", "processing", "completed", "failed", "cancelled"] as const
export const PAYMENT_METHODS = ["gcash", "cash", "bank_transfer"] as const