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
} from "@tanstack/react-table"

import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "../../attendance/components/data-table-pagination"
import { DataTableToolbar } from "../../attendance/components/data-table-toolbar"
import type { Attendance, DayKey, PeriodKey, AttendanceStatus } from "../../attendance/data/schema"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    updateAttendance?: (
      rowIndex: number,
      day: DayKey,
      period: PeriodKey,
      value: boolean | AttendanceStatus
    ) => void
  }
}

interface SecretaryDataTableProps {
  columns: ColumnDef<Attendance, any>[]
  data: Attendance[]
}

export function SecretaryDataTable({ columns, data }: SecretaryDataTableProps) {
  const [internalData, setInternalData] = React.useState(data)

  // Update internal data when props change
  React.useEffect(() => {
    setInternalData(data)
  }, [data])

  const updateAttendance = (
    rowIndex: number,
    day: DayKey,
    period: PeriodKey,
    value: boolean | AttendanceStatus
  ) => {
    setInternalData((prev) =>
      prev.map((row, idx) => {
        if (idx !== rowIndex) return row

        const currentAttendance = row.attendance || {}
        const currentDay = currentAttendance[day] || {}
        
        return {
          ...row,
          attendance: {
            ...currentAttendance,
            [day]: {
              ...currentDay,
              [period]: value,
            },
          },
        }
      })
    )
  }

  const table = useReactTable({
    data: internalData,
    columns,
    meta: { updateAttendance },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar table={table} />
      
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

      <DataTablePagination table={table} />
    </div>
  )
}