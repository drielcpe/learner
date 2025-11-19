import { paymentSchema } from "../data/schema"
import fs from "fs/promises"
import path from "path"
import PaymentsClient from "./payments-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Users } from "lucide-react"

async function loadData() {
  const file = await fs.readFile(
    path.join(process.cwd(), "app/payments/data/payments.json")
  )
  const jsonData = JSON.parse(file.toString())
  
  const processedData = jsonData.map((item: any) => ({
    ...item,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    reference_number: item.reference_number || "",
    qr_code: item.qr_code || null,
    due_date: item.due_date || null,
    description: item.description || "",
    transaction_proof: item.transaction_proof || null,
    uploaded_at: item.uploaded_at || null,
  }))
  
  return paymentSchema.array().parse(processedData)
}

export default async function AdviserPaymentsPage() {
  const data = await loadData()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header - Match the student page structure */}
      <div className="flex items-center justify-between m-5">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="/adviser">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Adviser Payment System</span>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="m-5">
        <h1 className="text-3xl font-bold tracking-tight">Payment Management - Adviser View</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage student payments for your advisory class
        </p>
      </div>

      <PaymentsClient data={data} />
    </div>
  )
}