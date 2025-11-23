"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, Download, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

interface Payment {
  id: string
  student_id: string
  student_name: string
  amount: number
  description: string
  due_date: string
}

interface PaymentMethodFromDB {
  id: number
  method_code: string
  method_name: string
  description: string
  account_number: string
  account_name: string
  instructions: string
  qr_code_image: string
  has_qr: boolean
  is_active: boolean
}

interface PaymentPageProps {
  paymentId: string
  paymentMethod?: string
  methodId?: string
}

export function PaymentPage({ paymentId, paymentMethod, methodId }: PaymentPageProps) {
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodFromDB | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState("")

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId, methodId])

  const fetchPaymentDetails = async () => {
    try {
      // Fetch payment method details from database
      if (methodId) {
        const methodsResponse = await fetch('/api/payment-methods')
        const methodsResult = await methodsResponse.json()
        
        if (methodsResult.success) {
          const method = methodsResult.data.find((m: PaymentMethodFromDB) => m.id.toString() === methodId)
          setPaymentMethodData(method)
        }
      }

      // Fetch payment details
      const studentId = localStorage.getItem('studentId')
      if (studentId) {
        const paymentResponse = await fetch(`/api/student/payments?studentId=${studentId}`)
        const paymentResult = await paymentResponse.json()
        
        if (paymentResult.success) {
          const currentPayment = paymentResult.data.find((p: any) => p.id.toString() === paymentId)
          setPayment(currentPayment)
        }
      }

      setLoading(false)
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
  router.push("/payments/students")
}
  const handlePaymentComplete = async () => {
    if (!referenceNumber.trim()) {
      alert("Please enter your payment reference number")
      return
    }

    try {
      setSubmitting(true)
      
      const response = await fetch('/api/student/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment?.id,
          studentId: payment?.student_id,
          referenceNumber: referenceNumber.trim(),
          status: 'review'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert("Thank you! Your payment has been submitted for review. Please allow 1-2 business days for processing.")
        router.push("/payments/student")
      } else {
        throw new Error(result.error || 'Failed to submit payment')
      }
    } catch (error) {
      console.error('Error completing payment:', error)
      alert('Failed to submit payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadQRCode = () => {
    if (paymentMethodData?.qr_code_image) {
      const link = document.createElement('a')
      link.href = paymentMethodData.qr_code_image
      link.download = `qr-code-${payment?.student_id}-${paymentId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
            Complete your payment using {paymentMethodData?.method_name || paymentMethod}
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
                {paymentMethodData?.method_name || paymentMethod}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {paymentMethodData?.has_qr && paymentMethodData?.qr_code_image && (
                <QrCode className="h-5 w-5 text-purple-600" />
              )}
              {paymentMethodData?.method_name || paymentMethod} Payment
            </CardTitle>
            <CardDescription>
              {paymentMethodData?.description || 
                (paymentMethod === 'gcash' 
                  ? 'Scan the QR code to complete your payment' 
                  : 'Use the following details to complete your payment'
                )
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentMethodData?.has_qr && paymentMethodData?.qr_code_image ? (
              <QRPayment payment={payment} paymentMethod={paymentMethodData} />
            ) : paymentMethod === 'gcash' ? (
              <GCashPayment payment={payment} paymentMethod={paymentMethodData} />
            ) : (
              <BankTransferPayment payment={payment} paymentMethod={paymentMethodData} />
            )}
            
            {/* Reference Number Input */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="referenceNumber" className="text-base font-medium">
                    Payment Reference Number
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the reference number from your payment confirmation
                  </p>
                </div>
                
                <Input
                  id="referenceNumber"
                  placeholder="Enter your payment reference number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="text-lg"
                />
                
                <p className="text-sm text-muted-foreground">
                  This is usually found in your payment confirmation receipt or SMS
                </p>
              </div>
            </div>

            {/* Complete Payment Button */}
            <div className="border-t pt-6">
              <Button 
                onClick={handlePaymentComplete} 
                className="w-full gap-2"
                size="lg"
                disabled={submitting || !referenceNumber.trim()}
              >
                <Check className="h-5 w-5" />
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// QR Payment Component (for methods with QR codes)
function QRPayment({ payment, paymentMethod }: { payment: Payment; paymentMethod: PaymentMethodFromDB }) {
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

  const downloadQRCode = () => {
    if (paymentMethod?.qr_code_image) {
      const link = document.createElement('a')
      link.href = paymentMethod.qr_code_image
      link.download = `qr-code-${payment.student_id}-${payment.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="text-center">
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
          {paymentMethod.qr_code_image ? (
            <img 
              src={paymentMethod.qr_code_image} 
              alt={`${paymentMethod.method_name} QR Code`}
              className="w-64 h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">₱{payment.amount.toLocaleString()}</div>
                <div className="text-sm mt-2">Scan with {paymentMethod.method_name}</div>
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Open your {paymentMethod.method_name} app and scan the QR code to pay
        </p>
        
        {/* Download QR Code Button */}
        {paymentMethod.qr_code_image && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadQRCode}
            className="mt-2 gap-2"
          >
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        )}
      </div>

      {/* Account Details (if available) */}
      {(paymentMethod.account_number || paymentMethod.account_name) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Account Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethod.account_number && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm flex-1">{paymentMethod.account_number}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentMethod.account_number, 'accountNumber')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'accountNumber' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            )}

            {paymentMethod.account_name && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm flex-1">{paymentMethod.account_name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentMethod.account_name, 'accountName')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'accountName' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {paymentMethod.instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
          <p className="text-sm text-blue-700 whitespace-pre-line">
            {paymentMethod.instructions}
          </p>
        </div>
      )}

      {/* Default Instructions if no custom instructions */}
      {!paymentMethod.instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Open the {paymentMethod.method_name} app on your phone</li>
            <li>Tap on "Scan QR" or the QR scanner feature</li>
            <li>Point your camera at the QR code above</li>
            <li>Verify the amount: ₱{payment.amount.toLocaleString()}</li>
            <li>Add your student ID ({payment.student_id}) in the reference field if prompted</li>
            <li>Confirm and complete the payment</li>
            <li>Save the payment confirmation with your reference number</li>
          </ol>
        </div>
      )}
    </div>
  )
}

// GCash Payment Component (fallback for GCash without QR)
function GCashPayment({ payment, paymentMethod }: { payment: Payment; paymentMethod?: PaymentMethodFromDB }) {
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
      {/* Account Details */}
      {paymentMethod && (paymentMethod.account_number || paymentMethod.account_name) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">GCash Account Details:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethod.account_number && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">GCash Number</label>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm flex-1">{paymentMethod.account_number}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentMethod.account_number, 'accountNumber')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'accountNumber' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            )}

            {paymentMethod.account_name && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                <p className="font-medium text-sm">{paymentMethod.account_name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">GCash Payment Instructions:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Open the GCash app on your phone</li>
          <li>Go to "Send Money"</li>
          <li>Enter the GCash number: {paymentMethod?.account_number || 'Provided above'}</li>
          <li>Enter the amount: ₱{payment.amount.toLocaleString()}</li>
          <li>Add your student ID ({payment.student_id}) in the reference field</li>
          <li>Confirm the payment details</li>
          <li>Complete the transaction</li>
          <li>Take note of the reference number from the confirmation</li>
        </ol>
      </div>

      {paymentMethod?.instructions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Additional Instructions:</h4>
          <p className="text-sm text-green-700 whitespace-pre-line">
            {paymentMethod.instructions}
          </p>
        </div>
      )}
    </div>
  )
}

// Bank Transfer Payment Component
function BankTransferPayment({ payment, paymentMethod }: { payment: Payment; paymentMethod?: PaymentMethodFromDB }) {
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

  const bankDetails = {
    bankName: paymentMethod?.method_name || "Bank of the Philippines",
    accountNumber: paymentMethod?.account_number || "1234-5678-9012",
    accountName: paymentMethod?.account_name || "School Name Foundation",
    branch: "Main Branch",
    swiftCode: "BOPHPHMM"
  }

  return (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Bank Transfer Details:</h4>
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
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Important Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Include your student ID ({payment.student_id}) as the reference when making the transfer</li>
          <li>Transfer the exact amount: ₱{payment.amount.toLocaleString()}</li>
          <li>Keep the transaction receipt with your reference number</li>
          <li>Payments may take 1-2 business days to reflect in our system</li>
          <li>Contact the accounting office if payment is not reflected after 2 days</li>
        </ul>
      </div>

      {paymentMethod?.instructions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Additional Instructions:</h4>
          <p className="text-sm text-green-700 whitespace-pre-line">
            {paymentMethod.instructions}
          </p>
        </div>
      )}
    </div>
  )
}