// app/student-management/data/schema.ts
import { z } from "zod"

const emailSchema = z.string()
  .refine((email) => email === "" || z.string().email().safeParse(email).success, {
    message: "Invalid email address"
  })
  .optional()
  .default("")

// Make sure this is named studentSchema (not Student)
export const studentSchema = z.object({
  id: z.union([z.number(), z.string()]),
  student_id: z.string(),
  student_name: z.string(),
  grade: z.string(),
  section: z.string(),
  adviser: z.string().nullable().optional(),
  contact_number: z.string().optional().default(""),
  email: emailSchema,
  address: z.string().optional().default(""),
  birth_date: z.string().nullable().optional().default(null),
  qr_code: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED", "DELETED"]).default("ACTIVE"),
  created_at: z.string(),
  updated_at: z.string(),
  enrollment_date: z.string().optional(),
})

// Export the TypeScript type
export type Student = z.infer<typeof studentSchema>

export const createStudentSchema = studentSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  qr_code: true 
})

export const updateStudentSchema = createStudentSchema.partial()