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
import type { Payment, PaymentStatus, PaymentMethod } from "../data/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

// Status badge configuration
const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  processing: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Processing" },
  completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
  failed: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
  cancelled: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Cancelled" },
} as const

// Method badge configuration
const methodConfig = {
  gcash: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "GCash" },
  cash: { color: "bg-green-100 text-green-800 border-green-200", label: "Cash" },
  bank_transfer: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Bank Transfer" },
} as const

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "student_id",
    header: "Student ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.student_id}</span>
    ),
  },
  {
    accessorKey: "student_name",
    header: "Student Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.student_name}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.grade} - {row.original.section}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "adviser",
    header: "Adviser",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium">₱{row.original.amount.toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Method",
    cell: ({ row }) => {
      const method = row.original.payment_method as PaymentMethod
      const config = methodConfig[method]
      return (
        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status as PaymentStatus
      const config = statusConfig[status]
      return (
        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "reference_number",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.reference_number || "-"}
      </span>
    ),
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.due_date ? new Date(row.original.due_date).toLocaleDateString() : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter()
      const payment = row.original

      const handleView = () => {
        router.push(`/payments/view/${payment.id}`)
      }

      const handleQRCode = () => {
        router.push(`/payments/students/qr/${payment.id}`)
      }

      return (
        <div className="flex gap-2">
        
          {payment.payment_method === "gcash" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={handleQRCode}
            >
              <QrCode className="h-3 w-3" />
              QR
            </Button>
          )}
        </div>
      )
    },
  },
]

interface PaymentsTableProps {
  data: Payment[]
}

export function PaymentsTable({ data }: PaymentsTableProps) {
  const table = useReactTable({
    data,
    columns,
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
                  No payments found.
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