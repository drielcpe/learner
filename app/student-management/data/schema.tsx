import { z } from "zod"

export const studentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  grade: z.string(),
  section: z.string(),
  adviser: z.string(),
  contact_number: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  enrollment_date: z.string(),
  status: z.enum(["active", "inactive", "graduated", "transferred"]),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Student = z.infer<typeof studentSchema>
export type StudentStatus = Student["status"]