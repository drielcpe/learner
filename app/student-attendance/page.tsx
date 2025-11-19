import StudentAttendanceClient from "./StudentAttendanceClient"
import { attendanceSchema } from "../attendance/data/schema"
import { studentsData } from "./data/student"
import fs from "fs/promises"
import path from "path"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft } from "lucide-react"

async function loadData() {
  const file = await fs.readFile(
    path.join(process.cwd(), "app/attendance/data/tasks.json")
  )
  return attendanceSchema.array().parse(JSON.parse(file.toString()))
}

// In a real app, you'd get this from authentication
const CURRENT_STUDENT_ID = "STU001" // This would come from auth/session

export default async function StudentAttendancePage() {
  const data = await loadData()
  const currentStudent = studentsData.find(student => student.student_id === CURRENT_STUDENT_ID)

  if (!currentStudent) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
              <p className="text-muted-foreground">Unable to load your student information.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

 return (
  <div className="container mx-auto py-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between px-5">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild className="gap-2">
          <a href="/student">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </a>
        </Button>
      </div>

    
    </div>
    
    {/* Title Section */}
    <div className="px-5">
      <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
      <p className="text-muted-foreground mt-1">
        View your personal attendance records
      </p>
    </div>

    <StudentAttendanceClient 
      data={data} 
      studentId={currentStudent.student_id}
      studentName={currentStudent.name}
    />
  </div>
)
}