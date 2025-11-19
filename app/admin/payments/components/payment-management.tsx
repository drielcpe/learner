"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, RefreshCw, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Payment } from "./types"

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments?include=student,payment_method')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchPayments() // Refresh data
      }
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student?.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student?.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.payment_method_id.toString() === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading payments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            View and manage all student payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students, reference numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="1">GCash</SelectItem>
                  <SelectItem value="2">Cash</SelectItem>
                  <SelectItem value="3">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            {filteredPayments.length} payments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {payment.student?.student_name} ({payment.student?.student_id})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.payment_method?.method_name} • ₱{payment.amount.toLocaleString()}
                      {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Due: {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    
                    {payment.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="gap-1"
                          onClick={() => updatePaymentStatus(payment.id, 'processing')}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Process
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-red-600"
                          onClick={() => updatePaymentStatus(payment.id, 'failed')}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}

                    {payment.status === 'processing' && (
                      <>
                        <Button 
                          size="sm" 
                          className="gap-1"
                          onClick={() => updatePaymentStatus(payment.id, 'completed')}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-red-600"
                          onClick={() => updatePaymentStatus(payment.id, 'failed')}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payments found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}