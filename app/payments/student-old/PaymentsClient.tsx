// app/payments/student/PaymentsClient.tsx
"use client"

import { useMemo, useState } from "react"
import { PaymentsTable } from "./components/payments-table"
import type { Payment, PaymentStatus, PaymentMethod } from "./data/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Props {
  data: Payment[]
}

export default function PaymentsClient({ data }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")

  // Get unique values for filters
  const statuses = useMemo(() => 
    Array.from(new Set(data.map(item => item.status))), 
    [data]
  )

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(payment => {
      const matchesSearch = payment.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.student_id.toLowerCase().includes(searchQuery) ||
                           payment.reference_number?.toLowerCase().includes(searchQuery)
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [data, searchQuery, statusFilter])

  // Calculate stats - STUDENT SPECIFIC
  const stats = useMemo(() => {
    const total = data.length
    const pending = data.filter(p => p.status === "pending").length
    const completed = data.filter(p => p.status === "completed" || p.status === "paid").length
    const totalPaid = data
      .filter(p => p.status === "completed" || p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0)
    const totalPending = data
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0)

    return { total, pending, completed, totalPaid, totalPending }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Stats Overview - STUDENT FOCUSED */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Payments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-yellow-800">Pending</p>
              <p className="text-xs text-yellow-600 mt-1">
                ₱{stats.totalPending.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-green-800">Completed</p>
              <p className="text-xs text-green-600 mt-1">
                ₱{stats.totalPaid.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ₱{(stats.totalPending + stats.totalPaid).toLocaleString()}
              </p>
              <p className="text-sm text-blue-800">Total Amount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your payment records and outstanding balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: PaymentStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <PaymentsTable data={filteredData} />
        </CardContent>
      </Card>
    </div>
  )
}