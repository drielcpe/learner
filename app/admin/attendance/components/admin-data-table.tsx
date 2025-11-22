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

import { DataTablePagination } from "../../../attendance/components/data-table-pagination"
import { DataTableToolbar } from "../../../attendance/components/data-table-toolbar"
import type { Attendance, DayKey, PeriodKey, AttendanceStatus } from "../../../attendance/data/schema"

// Properly extend the table meta type
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends Attendance> {
    updateAttendance?: (
      studentId: number,
      day: DayKey,
      period: PeriodKey,
      status: AttendanceStatus
    ) => Promise<void>
  }
}

interface AdminDataTableProps {
  columns: ColumnDef<Attendance, any>[]
  data: Attendance[]
  grades?: string[]
  sections?: string[]
  selectedGrade?: string
  selectedSection?: string
  onGradeChange?: (value: string) => void
  onSectionChange?: (value: string) => void
  onUpdateAttendance?: (
    studentId: number,
    day: DayKey,
    period: PeriodKey,
    status: AttendanceStatus
  ) => Promise<void>
}

export function AdminDataTable({ 
  columns, 
  data, 
  grades = [],
  sections = [],
  selectedGrade = "all",
  selectedSection = "all",
  onGradeChange,
  onSectionChange,
  onUpdateAttendance
}: AdminDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    meta: { 
      updateAttendance: onUpdateAttendance 
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar 
        table={table} 
        grades={grades}
        sections={sections}
        selectedGrade={selectedGrade}
        selectedSection={selectedSection}
        onGradeChange={onGradeChange}
        onSectionChange={onSectionChange}
      />
      
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