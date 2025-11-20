"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface Payment {
  id: string
  student_id: string
  student_name: string
  amount: number
  description: string
  due_date: string
}

interface PaymentPageProps {
  paymentId: string
  paymentMethod?: string
}

// Bank details configuration
const bankDetails = {
  bankName: "Bank of the Philippines",
  accountNumber: "1234-5678-9012",
  accountName: "School Name Foundation",
  branch: "Main Branch",
  swiftCode: "BOPHPHMM"
}

export function PaymentPage({ paymentId, paymentMethod }: PaymentPageProps) {
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setPayment({
          id: paymentId,
          student_id: "2024-001",
          student_name: "John Doe",
          amount: 1500,
          description: "Tuition Fee for January 2024",
          due_date: "2024-01-31"
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching payment:', error)
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handlePaymentComplete = () => {
    // Handle payment completion
    alert("Thank you! Your payment has been recorded. Please allow 1-2 business days for processing.")
    router.push("/payments/students")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading payment details...</div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Payment not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Make Payment</h1>
          <p className="text-muted-foreground">
            Complete your payment using {paymentMethod === 'gcash' ? 'GCash' : 'Bank Transfer'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Information about your payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Student</label>
              <p className="font-medium">{payment.student_name}</p>
              <p className="text-sm text-muted-foreground">{payment.student_id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold text-green-600">
                ₱{payment.amount.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p>{payment.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              <p>{new Date(payment.due_date).toLocaleDateString()}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <Badge variant="outline" className={
                paymentMethod === 'gcash' 
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : "bg-blue-100 text-blue-800 border-blue-200"
              }>
                {paymentMethod === 'gcash' ? 'GCash' : 'Bank Transfer'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {paymentMethod === 'gcash' ? 'GCash Payment' : 'Bank Transfer Details'}
            </CardTitle>
            <CardDescription>
              {paymentMethod === 'gcash' 
                ? 'Scan the QR code to complete your payment' 
                : 'Use the following bank details to complete your transfer'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentMethod === 'gcash' ? (
              <GCashPayment payment={payment} />
            ) : (
              <BankTransferPayment payment={payment} />
            )}
            
            {/* Complete Payment Button */}
            <div className="border-t pt-6">
              <Button 
                onClick={handlePaymentComplete} 
                className="w-full gap-2"
                size="lg"
              >
                <Check className="h-5 w-5" />
                I've Completed the Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// GCash Payment Component
function GCashPayment({ payment }: { payment: Payment }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
          <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">₱{payment.amount.toLocaleString()}</div>
              <div className="text-sm mt-2">Scan with GCash App</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Open your GCash app and scan the QR code to pay
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Open the GCash app on your phone</li>
          <li>Tap on "Scan QR"</li>
          <li>Point your camera at the QR code above</li>
          <li>Enter the amount: ₱{payment.amount.toLocaleString()}</li>
          <li>Add your student ID ({payment.student_id}) in the reference field</li>
          <li>Confirm the payment</li>
          <li>Take a screenshot of the payment confirmation for your records</li>
        </ol>
      </div>
    </div>
  )
}

// Bank Transfer Payment Component
function BankTransferPayment({ payment }: { payment: Payment }) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
          <div className="flex items-center gap-2">
            <p className="font-medium flex-1">{bankDetails.bankName}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.bankName, 'bankName')}
            >
              {copiedField === 'bankName' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Account Number</label>
          <div className="flex items-center gap-2">
            <p className="font-mono font-medium flex-1">{bankDetails.accountNumber}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
            >
              {copiedField === 'accountNumber' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Account Name</label>
          <div className="flex items-center gap-2">
            <p className="font-medium flex-1">{bankDetails.accountName}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.accountName, 'accountName')}
            >
              {copiedField === 'accountName' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Branch</label>
          <p className="font-medium">{bankDetails.branch}</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">SWIFT Code</label>
          <div className="flex items-center gap-2">
            <p className="font-mono font-medium flex-1">{bankDetails.swiftCode}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.swiftCode, 'swiftCode')}
            >
              {copiedField === 'swiftCode' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Important Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Include your student ID ({payment.student_id}) as the reference when making the transfer</li>
          <li>Transfer the exact amount: ₱{payment.amount.toLocaleString()}</li>
          <li>Keep the transaction receipt for verification</li>
          <li>Payments may take 1-2 business days to reflect in our system</li>
          <li>Contact the accounting office if payment is not reflected after 2 days</li>
        </ul>
      </div>
    </div>
  )
}