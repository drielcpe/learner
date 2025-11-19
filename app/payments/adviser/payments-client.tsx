"use client"

import { useMemo, useState } from "react"
import { PaymentsTable } from "./components/payments-table"
import type { Payment, PaymentStatus, PaymentMethod } from "../data/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, Download, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Props {
  data: Payment[]
}

export default function PaymentsClient({ data }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all")
  const [adviserFilter, setAdviserFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState(false)

  // Get unique values for filters
  const advisers = useMemo(() => 
    Array.from(new Set(data.map(item => item.adviser))), 
    [data]
  )

  const statuses = useMemo(() => 
    Array.from(new Set(data.map(item => item.status))), 
    [data]
  )

  const methods = useMemo(() => 
    Array.from(new Set(data.map(item => item.payment_method))), 
    [data]
  )

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(payment => {
      const matchesSearch = payment.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.student_id.toLowerCase().includes(searchQuery) ||
                           payment.reference_number?.toLowerCase().includes(searchQuery)
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter
      const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter
      const matchesAdviser = adviserFilter === "all" || payment.adviser === adviserFilter
      
      return matchesSearch && matchesStatus && matchesMethod && matchesAdviser
    })
  }, [data, searchQuery, statusFilter, methodFilter, adviserFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const total = data.length
    const pending = data.filter(p => p.status === "pending").length
    const processing = data.filter(p => p.status === "processing").length
    const completed = data.filter(p => p.status === "completed").length
    const failed = data.filter(p => p.status === "failed" || p.status === "cancelled").length
    const totalAmount = data.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = data.filter(p => p.status === "pending" || p.status === "processing").reduce((sum, p) => sum + p.amount, 0)

    return { total, pending, processing, completed, failed, totalAmount, pendingAmount }
  }, [data])

  // Function to update payment status
  const updatePaymentStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    setIsUpdating(true)
    try {
      // TODO: Replace with your actual API call
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }

      // Refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Quick status update actions
  const bulkUpdateStatus = async (paymentIds: string[], newStatus: PaymentStatus) => {
    setIsUpdating(true)
    try {
      // TODO: Replace with your actual API call for bulk update
      const response = await fetch('/api/payments/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIds, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payments')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating payments:', error)
      alert('Failed to update payments. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
     

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                View and manage student payments for your class
              </CardDescription>
            </div>
            <div className="flex items-center ml-auto"> {/* Added ml-auto here */}
              <Button variant="outline" size="sm"  disabled={isUpdating}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students, ID, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={adviserFilter} onValueChange={setAdviserFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Adviser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Advisers</SelectItem>
                  {advisers.map(adviser => (
                    <SelectItem key={adviser} value={adviser}>
                      {adviser}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | "all")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
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

              <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as PaymentMethod | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {methods.map(method => (
                    <SelectItem key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <PaymentsTable 
            data={filteredData} 
            onStatusUpdate={updatePaymentStatus} 
            isUpdating={isUpdating}
            showActions={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}