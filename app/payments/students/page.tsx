import PaymentsClient from "./PaymentsClient"
import { paymentSchema } from "./data/schema"
import fs from "fs/promises"
import path from "path"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard } from "lucide-react"

async function loadData() {
  try {
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
    }))
    
    return paymentSchema.array().parse(processedData)
  } catch (error) {
    console.error('Error loading payment data:', error)
    throw error
  }
}

export default async function PaymentsPage() {
  const data = await loadData()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between m-5">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="/student">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Payment System</span>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="m-5">
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage student payments, GCash transactions, and payment history
        </p>
      </div>

      <PaymentsClient data={data} />
    </div>
  )
}