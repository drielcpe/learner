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
import { Eye, QrCode, CreditCard, Wallet, Banknote, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Status badge configuration
const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  processing: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Processing" },
  completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
  paid: { color: "bg-green-100 text-green-800 border-green-200", label: "Paid" },
  failed: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
  cancelled: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Cancelled" },
} as const

// Method badge configuration
const methodConfig = {
  gcash: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "GCash" },
  cash: { color: "bg-green-100 text-green-800 border-green-200", label: "Cash" },
  bank_transfer: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Bank Transfer" },
} as const

// Payment options configuration
const paymentOptions = {
  gcash: { icon: Wallet, label: "Pay with GCash", description: "Scan QR code to pay" },
  cash: { icon: Banknote, label: "Pay with Cash", description: "Pay at school cashier" },
  bank_transfer: { icon: CreditCard, label: "Bank Transfer", description: "Transfer to bank account" },
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
      // Safe access to status config with fallback
      const config = statusConfig[status] || { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        label: status.charAt(0).toUpperCase() + status.slice(1) 
      }
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

    const handlePaymentMethod = (method: PaymentMethod) => {
      // Navigate to the same payment page with method as query parameter
      router.push(`/payments/students/pay/${payment.id}?method=${method}`)
    }

      // Only show payment options if status is pending
      const showPaymentOptions = payment.status === "pending"

      return (
        <div className="flex gap-2">
          {/* View button - always visible */}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={handleView}
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
        
          {/* Payment Options Dropdown - only show for pending payments */}
          {showPaymentOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="h-8 gap-1">
                  Pay Now
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handlePaymentMethod("gcash")}>
                  <div className="flex items-center gap-2 w-full">
                    <Wallet className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Pay with GCash</div>
                      <div className="text-xs text-muted-foreground">Scan QR code to pay</div>
                    </div>
                    <QrCode className="h-3 w-3 text-muted-foreground" />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handlePaymentMethod("cash")}>
                  <div className="flex items-center gap-2 w-full">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Pay with Cash</div>
                      <div className="text-xs text-muted-foreground">Pay at school cashier</div>
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handlePaymentMethod("bank_transfer")}>
                  <div className="flex items-center gap-2 w-full">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-muted-foreground">Transfer to bank account</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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