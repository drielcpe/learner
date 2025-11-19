"use client"

import { useMemo, useState } from "react"
import { DataTable } from "./components/data-table"
import type { Attendance, DayKey } from "./data/schema"
import { buildDailyColumns } from "./components/daily-columns"

interface Props {
  data: Attendance[]
}

export default function AttendanceClient({ data }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split("T")[0] // yyyy-mm-dd
  })

  const dayNumber: DayKey = String(new Date(selectedDate).getDate()) as DayKey

  // ✅ FIXED: Compare full dates, not just day numbers
  const today = new Date().toISOString().split("T")[0]
  const isEditable = selectedDate === today

  const columns = useMemo(
    () => buildDailyColumns(dayNumber, isEditable),
    [dayNumber, isEditable]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Select Date:</label>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {isEditable && (
          <span className="text-sm text-green-600 font-medium">✓ Editable (Today)</span>
        )}
      </div>

      {/* Attendance Table */}
      <DataTable columns={columns} data={data} />
    </div>
  )
}