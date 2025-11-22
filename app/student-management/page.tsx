import { studentSchema } from "./data/schema"
import StudentsClient from "./students-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

async function loadData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    console.log('Loading students from API...')
    
    const response = await fetch(`${baseUrl}/api/students`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('API Error:', errorText)
      throw new Error(`Failed to fetch students: ${response.status}`)
    }

    const result = await response.json()
    console.log('API data count:', result.data?.length || 0)

    if (!result.success) {
      throw new Error(result.error || 'Failed to load students')
    }

    if (!Array.isArray(result.data)) {
      console.log('Invalid data format: expected array')
      return []
    }

    // Transform data with proper student_type handling
    const validatedData = result.data.map((item: any) => {
      // Handle student_type - ensure it's always valid
      let studentType: 'student' | 'secretary' = 'student'
      
      if (item.student_type === 'secretary') {
        studentType = 'secretary'
      } else if (item.student_type && ['student', 'secretary'].includes(item.student_type.toLowerCase())) {
        studentType = item.student_type.toLowerCase() as 'student' | 'secretary'
      }

      return {
        id: item.id || 0,
        student_id: item.student_id || '',
        student_name: item.student_name || '',
        student_type: studentType,
        grade: item.grade || '',
        section: item.section || '',
        adviser: item.adviser || null,
        contact_number: item.contact_number || '',
        email: item.email || '',
        address: item.address || '',
        birth_date: item.birth_date || null,
        qr_code: item.qr_code || null,
        status: item.status || 'ACTIVE',
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        enrollment_date: item.enrollment_date || null,
      }
    })

    console.log('Data processed successfully, count:', validatedData.length)
    return validatedData
    
  } catch (error) {
    console.log('Error loading student data')
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