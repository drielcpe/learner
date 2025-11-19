import { z } from "zod"

// Days 1–31
export const DAY_KEYS = [
  "1","2","3","4","5","6","7","8","9","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30","31"
] as const

export type DayKey = (typeof DAY_KEYS)[number]

// Periods per day
export const PERIOD_KEYS = [
  "period1",
  "period2",
  "period3",
  "period4",
  "period5",
] as const

export type PeriodKey = (typeof PERIOD_KEYS)[number]

// Schema for one day
const daySchema = z.object({
  period1: z.boolean(),
  period2: z.boolean(),
  period3: z.boolean(),
  period4: z.boolean(),
  period5: z.boolean(),
})

// Full student record
export const attendanceSchema = z.object({
  id: z.number(),
  student_name: z.string(),
  attendance: z.record(z.string(), daySchema),
})

export type Attendance = z.infer<typeof attendanceSchema>
