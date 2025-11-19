import { studentSchema } from "./data/schema"
import fs from "fs/promises"
import path from "path"
import StudentsClient from "./students-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, UserPlus } from "lucide-react"

async function loadData() {
  try {
    const file = await fs.readFile(
      path.join(process.cwd(), "app/student-management/data/students.json")
    )
    const jsonData = JSON.parse(file.toString())
    
    // Add missing fields with defaults and ensure proper typing
    const processedData = jsonData.map((item: any) => ({
      ...item,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      contact_number: item.contact_number || "",
      email: item.email || "",
      address: item.address || "",
      birth_date: item.birth_date || null,
      enrollment_date: item.enrollment_date || new Date().toISOString(),
      status: (item.status || "active") as "active" | "inactive" | "graduated" | "transferred",
    }))
    
    return studentSchema.array().parse(processedData)
  } catch (error) {
    console.error('Error loading student data:', error)
    // Return properly typed sample data if file doesn't exist
    return [
      {
        id: "1",
        student_id: "2024-001",
        student_name: "John Doe",
        grade: "7",
        section: "A",
        adviser: "Ms. Smith",
        contact_number: "+1234567890",
        email: "john.doe@school.edu",
        address: "123 Main St, City",
        birth_date: "2010-05-15",
        enrollment_date: "2024-01-15",
        status: "active" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  }
}

export default async function StudentManagementPage() {
  const data = await loadData()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
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
      
      {/* Title Section */}
      <div className="m-5">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage student information, enrollment, and class assignments
        </p>
      </div>

      <StudentsClient data={data} />
    </div>
  )
}