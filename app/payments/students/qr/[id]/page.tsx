import { paymentSchema } from "../../../data/schema"
import fs from "fs/promises"
import path from "path"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, CheckCircle, XCircle, Upload, Camera, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { QRCodeImage } from "../../../components/qr-code-image"
import { TransactionUpload } from "../../../components/transaction-upload"

async function loadData() {
  const file = await fs.readFile(
    path.join(process.cwd(), "app/payments/data/payments.json")
  )
  const jsonData = JSON.parse(file.toString())
  
  // Add missing fields with defaults
  const processedData = jsonData.map((item: any) => ({
    ...item,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    reference_number: item.reference_number || "",
    qr_code: item.qr_code || null,
    due_date: item.due_date || null,
    description: item.description || "",
    transaction_proof: item.transaction_proof || null, // Add transaction proof field
    uploaded_at: item.uploaded_at || null,
  }))
  
  return paymentSchema.array().parse(processedData)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QRCodePage(props: PageProps) {
  const params = await props.params
  const data = await loadData()
  const payment = data.find(p => p.id === params.id)

  if (!payment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Payment Not Found</h2>
              <p className="text-muted-foreground">The requested payment does not exist.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canShowQR = (payment.status === "pending" || payment.status === "processing") && payment.qr_code
  const isCompleted = payment.status === "completed"
  const isFailed = payment.status === "failed" || payment.status === "cancelled"
  const hasTransactionProof = payment.transaction_proof !== null

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between m-5">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/payments/students">
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>
          </Button>
        </div>

     
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 m-5">
        {/* QR Code Section */}
        <div className="space-y-6">
          {canShowQR ? (
            <Card>
              <CardHeader>
                <CardTitle>GCash QR Code</CardTitle>
                <CardDescription>
                  Scan this QR code to complete your payment via GCash
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                {/* QR Code Image */}
                <QRCodeImage 
                  src={payment.qr_code || ""} 
                  alt={`GCash QR Code for payment ${payment.reference_number}`}
                  referenceNumber={payment.reference_number || ""}
                />
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Reference Number:</p>
                  <p className="font-mono text-lg font-bold">{payment.reference_number}</p>
                  <Badge variant="secondary" className="mt-2">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : payment.payment_method === "gcash" && !payment.qr_code ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-gray-800">QR Code Not Available</h3>
                  <p className="text-gray-600 mt-2">QR code image is not available for this payment.</p>
                  <Badge variant="outline" className="mt-3">No QR Image</Badge>
                </div>
              </CardContent>
            </Card>
          ) : isCompleted ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800">Payment Completed</h3>
                  <p className="text-green-600 mt-2">This payment has been successfully processed.</p>
                  <Badge className="bg-green-600 text-white mt-3">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-800">Payment {payment.status}</h3>
                  <p className="text-red-600 mt-2">This payment cannot be processed via QR code.</p>
                  <Badge className="bg-red-600 text-white mt-3">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

       
        </div>

        {/* Payment Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Student:</span>
                <span className="text-sm font-medium">{payment.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Student ID:</span>
                <span className="text-sm font-mono">{payment.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Grade & Section:</span>
                <span className="text-sm font-medium">{payment.grade} - {payment.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Adviser:</span>
                <span className="text-sm font-medium">{payment.adviser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-bold">₱{payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="text-sm font-medium capitalize">{payment.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date:</span>
                <span className="text-sm font-medium">
                  {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Description:</span>
                <span className="text-sm font-medium text-right">{payment.description}</span>
              </div>
            </CardContent>
          </Card>
   {/* Transaction Upload Section */}
         
          {/* Uploaded Proof Preview */}
          {hasTransactionProof && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Proof</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Transaction proof uploaded</span>
                  </div>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img 
                      src={payment.transaction_proof || ""} 
                      alt="Transaction proof" 
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on: {payment.uploaded_at ? new Date(payment.uploaded_at).toLocaleString() : 'Recently'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Instructions */}
        <div className="space-y-6">
          {canShowQR && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">Step 1: Scan & Pay</p>
                  <p>1. Open GCash app on your phone</p>
                  <p>2. Tap "Scan QR"</p>
                  <p>3. Point your camera at the QR code</p>
                  <p>4. Confirm the amount: <strong>₱{payment.amount.toLocaleString()}</strong></p>
                  <p>5. Complete the payment</p>
                </div>
                
 {canShowQR && (    <TransactionUpload paymentId={payment.id} />
          
          )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}