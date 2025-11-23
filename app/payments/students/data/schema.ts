// app/payments/student/data/schema.ts
import { z } from "zod"

export const paymentSchema = z.object({
  id: z.number().or(z.string()), // Allow both number and string
  student_id: z.string(),
  student_name: z.string(),
  grade: z.string(),
  section: z.string(),
  adviser: z.string(),
  amount: z.number(),
  status: z.enum(["forapproval","pending", "processing", "completed", "paid", "failed", "cancelled", "reviewed"]),
  payment_method: z.string(),
  reference_number: z.string().nullable(), // Allow null
  reference_file: z.string().nullable(), // Allow null
  description: z.string().nullable(), // Allow null
  due_date: z.string().nullable(), // Allow null
  paid_date: z.string().nullable(), // Allow null
  created_at: z.string(),
  updated_at: z.string(),
})

export type Payment = z.infer<typeof paymentSchema>
export type PaymentStatus = Payment["status"]
export type PaymentMethod = "gcash" | "cash" | "bank_transfer" | string // Allow any string