// app/payments/student/components/payments-table.tsx
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
import type { Payment, PaymentStatus } from "../data/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, QrCode, CreditCard, Wallet, Banknote, ChevronDown, Loader2, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

interface PaymentMethodFromDB {
  id: number
  method_code: string
  method_name: string
  description: string
  account_number: string
  account_name: string
  instructions: string
  qr_code_image: string
  is_active: boolean
}

// Status badge configuration
const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  processing: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Processing" },
  completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
  paid: { color: "bg-green-100 text-green-800 border-green-200", label: "Paid" },
  failed: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
  cancelled: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Cancelled" },
} as const

// Dynamic method configuration based on method_code
const getMethodConfig = (methodCode: string) => {
  const configs: Record<string, { color: string; label: string }> = {
    gcash: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "GCash" },
    cash: { color: "bg-green-100 text-green-800 border-green-200", label: "Cash" },
    bank_transfer: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Bank Transfer" },
    bank: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Bank Transfer" },
    paymaya: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "PayMaya" },
    credit_card: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Credit Card" },
    debit_card: { color: "bg-teal-100 text-teal-800 border-teal-200", label: "Debit Card" },
    online: { color: "bg-pink-100 text-pink-800 border-pink-200", label: "Online" },
  }
  
  return configs[methodCode] || { 
    color: "bg-gray-100 text-gray-800 border-gray-200", 
    label: methodCode.charAt(0).toUpperCase() + methodCode.slice(1) 
  }
}

// Get icon for payment method
const getMethodIcon = (methodCode: string) => {
  switch (methodCode) {
    case 'gcash': return <Wallet className="h-4 w-4 text-purple-600" />
    case 'paymaya': return <Smartphone className="h-4 w-4 text-indigo-600" />
    case 'cash': return <Banknote className="h-4 w-4 text-green-600" />
    case 'bank_transfer':
    case 'bank': return <CreditCard className="h-4 w-4 text-blue-600" />
    case 'credit_card': return <CreditCard className="h-4 w-4 text-orange-600" />
    case 'debit_card': return <CreditCard className="h-4 w-4 text-teal-600" />
    default: return <CreditCard className="h-4 w-4 text-gray-600" />
  }
}

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
      const method = row.original.payment_method as string
      const config = getMethodConfig(method)
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
      const [paymentMethods, setPaymentMethods] = useState<PaymentMethodFromDB[]>([])
      const [loadingMethods, setLoadingMethods] = useState(false)
      const [dropdownOpen, setDropdownOpen] = useState(false)

      const fetchPaymentMethods = async () => {
        try {
          setLoadingMethods(true)
          console.log('🔄 Fetching payment methods from database...')
          
          const response = await fetch('/api/payment-methods')
          const result = await response.json()
          
          if (result.success) {
            console.log('✅ Payment methods fetched:', result.data)
            setPaymentMethods(result.data)
          } else {
            console.error('❌ Failed to fetch payment methods:', result.error)
          }
        } catch (error) {
          console.error('❌ Error fetching payment methods:', error)
        } finally {
          setLoadingMethods(false)
        }
      }

      const handleDropdownOpen = (open: boolean) => {
        setDropdownOpen(open)
        if (open && paymentMethods.length === 0) {
          fetchPaymentMethods()
        }
      }

      const handleView = () => {
        router.push(`/payments/view/${payment.id}`)
      }

      const handlePaymentMethod = async (method: PaymentMethodFromDB) => {
        try {
          console.log('🔄 Processing payment with method:', method)
          
          // For all payment methods, navigate to the payment page
          router.push(`/payments/students/pay/${payment.id}?method=${method.method_code}&methodId=${method.id}`)
          
        } catch (error) {
          console.error('❌ Error processing payment method:', error)
          alert('❌ Error processing payment. Please try again.')
        }
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
            <DropdownMenu onOpenChange={handleDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="h-8 gap-1">
                  {loadingMethods ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      Pay Now
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
                {loadingMethods ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading payment methods...</p>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <>
                    <div className="p-2 border-b">
                      <p className="text-xs font-medium text-muted-foreground">
                        Choose payment method ({paymentMethods.length} available)
                      </p>
                    </div>
                    {paymentMethods
                      .filter(method => method.is_active) // Only show active methods
                      .map((method) => (
                      <DropdownMenuItem 
                        key={method.id} 
                        onClick={() => handlePaymentMethod(method)}
                        className="p-3 cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 w-full">
                          {getMethodIcon(method.method_code)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {method.method_name}
                              {method.method_code === 'gcash' && method.qr_code_image && (
                                <QrCode className="h-3 w-3 text-purple-500" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {method.description}
                            </div>
                            {method.account_number && (
                              <div className="text-xs font-mono text-gray-600 mt-1 truncate">
                                {method.account_number}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600 font-medium">
                              Available
                            </div>
                            {method.instructions && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Click to view instructions
                              </div>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No payment methods available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact administrator to set up payment methods
                    </p>
                  </div>
                )}
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