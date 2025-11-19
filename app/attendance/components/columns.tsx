"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import type { Attendance, DayKey, PeriodKey, AttendanceStatus } from "../data/schema"
import { DAY_KEYS, PERIOD_KEYS } from "../data/schema"
import { Check, X, Clock, Minus } from "lucide-react"

// 🔥 REAL calendar day (1–31)
const REAL_TODAY = new Date().getDate()

// 🔥 Map real date into your DAY_KEYS length
// Example: 18 becomes 3 if DAY_KEYS = ["1".."15"]
const TODAY_DAY = ((REAL_TODAY - 1) % DAY_KEYS.length) + 1

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => row.getValue("id"),
  },

  {
    accessorKey: "student_name",
    header: "Student",
    cell: ({ row }) => <span className="font-medium">{row.getValue("student_name")}</span>,
  },

  // Days × Periods
  ...DAY_KEYS.flatMap((day: DayKey) =>
    PERIOD_KEYS.map((period: PeriodKey): ColumnDef<Attendance> => ({
      id: `day_${day}_${period}`,
      header: () => (
        <div className="text-center text-[10px] font-semibold">
          {day} {period.toUpperCase()}
        </div>
      ),
      cell: ({ row, table }) => {
        const status = row.original.attendance?.[day]?.[period]
        
        // ✅ FIXED: Proper type handling for both boolean and string status
        const isPresent = status === true || status === "present"
        const isAbsent = status === false || status === "absent"
        const isLate = status === "late"
        const hasData = status !== undefined

        // 🔥 The real fix:
        const isToday = Number(day) === TODAY_DAY

        return (
          <div className="flex justify-center">
            {!hasData ? (
              <div className={`flex items-center gap-1 ${!isToday ? "opacity-40" : ""}`}>
                <Minus className="h-4 w-4 text-gray-400" />
              </div>
            ) : isPresent ? (
              <div className={`flex items-center gap-1 ${!isToday ? "opacity-40" : ""}`}>
                <Check className="h-4 w-4 text-green-600" />
              </div>
            ) : isLate ? (
              <div className={`flex items-center gap-1 ${!isToday ? "opacity-40" : ""}`}>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            ) : (
              <div className={`flex items-center gap-1 ${!isToday ? "opacity-40" : ""}`}>
                <X className="h-4 w-4 text-red-600" />
              </div>
            )}
          </div>
        )
      },
    }))
  ),
]