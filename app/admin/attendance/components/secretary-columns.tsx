"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Attendance, DayKey, PeriodKey, AttendanceStatus } from "../../../attendance/data/schema"
import { PERIOD_KEYS } from "../../../attendance/data/schema"
import { Check, X, Clock, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const statusConfig = {
  present: { 
    icon: Check, 
    color: "text-green-600", 
    bg: "bg-green-50", 
    border: "border-green-200", 
    label: "Present" 
  },
  absent: { 
    icon: X, 
    color: "text-red-600", 
    bg: "bg-red-50", 
    border: "border-red-200", 
    label: "Absent" 
  },
  late: { 
    icon: Clock, 
    color: "text-yellow-600", 
    bg: "bg-yellow-50", 
    border: "border-yellow-200", 
    label: "Late" 
  }
} as const

export const buildSecretaryColumns = (day: DayKey, isEditable: boolean): ColumnDef<Attendance>[] => [
  {
    accessorKey: "student_id",
    header: "Student ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.student_id}
      </span>
    ),
  },
  {
    accessorKey: "student_name",
    header: "Student Name",
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.student_name}</span>
        {(row.original.grade || row.original.section) && (
          <p className="text-xs text-muted-foreground">
            {row.original.grade} {row.original.section}
          </p>
        )}
      </div>
    ),
  },

  ...PERIOD_KEYS.map((period: PeriodKey): ColumnDef<Attendance> => ({
    id: `${day}_${period}`,
    header: () => (
      <div className="text-center text-xs font-semibold">
        {period.toUpperCase()}
      </div>
    ),
    cell: ({ row, table }) => {
      const currentStatus = row.original.attendance?.[day]?.[period] as AttendanceStatus | undefined

      const handleStatusChange = (newStatus: AttendanceStatus) => {
        table.options.meta?.updateAttendance?.(
          row.index,
          day,
          period,
          newStatus
        )
      }

      // Get the current status config
      const currentConfig = currentStatus ? statusConfig[currentStatus] : null
      
      // Get the Icon component for the current status
      const StatusIcon = currentConfig?.icon || MoreHorizontal

      // Status dropdown for secretary
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-24 justify-center ${
                  currentConfig 
                    ? `${currentConfig.bg} ${currentConfig.border}`
                    : "bg-white"
                }`}
              >
                {currentConfig ? (
                  <>
                    <StatusIcon className={`h-2 w-2 ${currentConfig.color}`} />
                    <span className={currentConfig.color}>
                      {currentConfig.label}
                    </span>
                  </>
                ) : (
                  <>
                    
                    <span className="text-gray-500">Set Status</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleStatusChange("present")}>
                <Check className="h-4 w-4 text-green-600 mr-2" />
                Present
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("late")}>
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                Late
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("absent")}>
                <X className="h-4 w-4 text-red-600 mr-2" />
                Absent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  })),
]