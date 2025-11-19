"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import type { Attendance, DayKey, PeriodKey } from "../data/schema"
import { PERIOD_KEYS } from "../data/schema"
import { Check, X } from "lucide-react"

export const buildDailyColumns = (day: DayKey, isEditable: boolean): ColumnDef<Attendance>[] => [
  {
    accessorKey: "student_name",
    header: "Student",
    cell: ({ row }) => (
      <span className={"font-medium"}>
        {row.original.student_name}
      </span>
    ),
  },

  ...PERIOD_KEYS.map((period: PeriodKey): ColumnDef<Attendance> => ({
    id: `${day}_${period}`,
    header: () => (
      <div className="text-center text-xs font-semibold">
        {period.toUpperCase()}
      </div>
    ),
    cell: ({ row }) => {
      const checked = row.original.attendance?.[day]?.[period] ?? false

      return (
        <div className="flex justify-center">
          {checked ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Present</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              <span className="text-sm font-medium">Absent</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  })),
]