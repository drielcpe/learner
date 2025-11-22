// app/student-management/page.tsx
import { studentSchema } from "./data/schema"
import StudentsClient from "./students-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

async function loadData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    console.log('🔄 Loading students from:', `${baseUrl}/api/students`)
    
    const response = await fetch(`${baseUrl}/api/students`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('📨 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('📊 API Result success:', result.success)
    console.log('📊 API Data length:', result.data?.length || 0)

    if (!result.success) {
      throw new Error(result.error || 'Failed to load students')
    }

    // Validate data with schema - handle validation errors gracefully
    try {
      // Use array() method on the schema to validate an array of students
      const validatedData = studentSchema.array().parse(result.data)
      console.log('✅ Data validated successfully, count:', validatedData.length)
      return validatedData
    } catch (validationError) {
      console.warn('⚠️ Data validation warning, using raw data:', validationError)
      console.warn('📋 Raw data sample:', result.data?.slice(0, 2))
      // Return raw data but ensure it has the basic structure
      return result.data || []
    }
  } catch (error) {
    console.error('💥 Error loading student data:', error)
    return []
  }
}

export default async function StudentManagementPage() {
  const data = await loadData()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between m-5">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Student Management System</span>
        </div>
      </div>
      
      <div className="m-5">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage student information, enrollment, and class assignments
        </p>
      </div>

      {data.length === 0 ? (
        <Alert className="m-5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No student data found. Please check if the database is connected and contains student records.
          </AlertDescription>
        </Alert>
      ) : (
        <StudentsClient data={data} />
      )}
    </div>
  )
}