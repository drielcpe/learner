// app/payments/students/qr/[id]/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Copy, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface PaymentData {
  id: number
  student_id: string
  student_name: string
  amount: number
  status: string
  description: string
}

export default function QRPaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const paymentId = params.id
  const methodCode = searchParams.get('method')
  const methodId = searchParams.get('methodId')

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodFromDB | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch payment method details
        if (methodId) {
          const methodResponse = await fetch(`/api/payment-methods?id=${methodId}`)
          const methodResult = await methodResponse.json()
          
          if (methodResult.success) {
            setPaymentMethod(methodResult.data)
          }
        }

        // Fetch payment details (you might need to create this endpoint)
        const paymentResponse = await fetch(`/api/student/payments?studentId=${localStorage.getItem('studentId')}`)
        const paymentResult = await paymentResponse.json()
        
        if (paymentResult.success) {
          const currentPayment = paymentResult.data.find((p: any) => p.id.toString() === paymentId)
          setPaymentData(currentPayment)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [paymentId, methodId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payment details...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href="/payments/student">
                <ArrowLeft className="h-4 w-4" />
                Back to Payments
              </a>
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GCash Payment</h1>
          <p className="text-muted-foreground mt-1">
            Scan the QR code to complete your payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Review your payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentData && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      ₱{paymentData.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Student ID:</span>
                    <span className="text-sm">{paymentData.student_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Student Name:</span>
                    <span className="text-sm">{paymentData.student_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Description:</span>
                    <span className="text-sm">{paymentData.description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Pending
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* QR Code and Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Scan to Pay</CardTitle>
              <CardDescription>
                Use GCash to scan the QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethod?.qr_code_image ? (
                <div className="text-center">
                  <img 
                    src={paymentMethod.qr_code_image} 
                    alt="GCash QR Code"
                    className="mx-auto max-w-[200px] h-auto border rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Open GCash and scan this QR code
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">QR code not available</p>
                </div>
              )}

              {paymentMethod && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Account Details:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{paymentMethod.account_number}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(paymentMethod.account_number)}
                            className="h-6 w-6 p-0"
                          >
                            {copied ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Account Name:</span>
                        <span className="text-sm font-medium">{paymentMethod.account_name}</span>
                      </div>
                    </div>
                  </div>

                  {paymentMethod.instructions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                      <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                        {paymentMethod.instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Save QR Code
                </Button>
                <Button className="flex-1">
                  I've Completed Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}