"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TanTable,
} from "@tanstack/react-table"

import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import type { Attendance, DayKey, PeriodKey, AttendanceStatus } from "../data/schema"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    updateAttendance?: (
      rowIndex: number,
      day: DayKey,
      period: PeriodKey,
      value: boolean | AttendanceStatus // ✅ Update to accept both boolean and string
    ) => void
  }
}

const defaultDay = {
  period1: "absent" as AttendanceStatus,
  period2: "absent" as AttendanceStatus,
  period3: "absent" as AttendanceStatus,
  period4: "absent" as AttendanceStatus,
  period5: "absent" as AttendanceStatus,
}

interface DataTableProps {
  columns: ColumnDef<Attendance, any>[]
  data: Attendance[]
}

export function DataTable({ columns, data: initialData }: DataTableProps) {
  const [data, setData] = React.useState(initialData)

  const updateAttendance = (
    rowIndex: number,
    day: DayKey,
    period: PeriodKey,
    value: boolean | AttendanceStatus // ✅ Accept both types
  ) => {
    setData((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row

        const currentAttendance = row.attendance || {}
        const currentDay = currentAttendance[day] || {}
        
        return {
          ...row,
          attendance: {
            ...currentAttendance,
            [day]: {
              ...defaultDay,
              ...currentDay,
              [period]: value,
            },
          },
        }
      })
    )
  }

  const table = useReactTable({
    data,
    columns,
    meta: { updateAttendance },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-md border">
        <ShadTable>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadTable>
      </div>

      <DataTablePagination table={table as unknown as TanTable<Attendance>} />
    </div>
  )
}