// app/payments/data/schema.ts
import { z } from "zod"

export const paymentStatusEnum = z.enum(["pending", "processing", "completed", "failed", "cancelled"])
export const paymentMethodEnum = z.enum(["gcash", "cash", "bank_transfer"])

export const paymentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  grade: z.string(),
  section: z.string(),
  adviser: z.string(),
  amount: z.number().positive(),
  status: paymentStatusEnum,
  payment_method: paymentMethodEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  reference_number: z.string().optional(),
  qr_code: z.string().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  description: z.string().optional(),
  transaction_proof: z.string().nullable().optional(),
  uploaded_at: z.string().datetime().nullable().optional(),
})

export type Payment = z.infer<typeof paymentSchema>
export type PaymentStatus = z.infer<typeof paymentStatusEnum>
export type PaymentMethod = z.infer<typeof paymentMethodEnum>