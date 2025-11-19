import AttendanceClient from "./AttendanceClient"
import { attendanceSchema } from "./data/schema"
import fs from "fs/promises"
import path from "path"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

async function loadData() {
  try {
    const file = await fs.readFile(
      path.join(process.cwd(), "app/attendance/data/tasks.json")
    )
    const jsonData = JSON.parse(file.toString())
    
    // Debug log to see actual data structure
    if (jsonData.length > 0) {
      console.log('First record:', {
        id: jsonData[0].id,
        idType: typeof jsonData[0].id,
        student_id: jsonData[0].student_id,
        student_idType: typeof jsonData[0].student_id
      })
    }
    
    return attendanceSchema.array().parse(jsonData)
  } catch (error) {
    console.error('Error loading data:', error)
    throw error
  }
}

interface PageProps {
  searchParams?: Promise<{ grade?: string; section?: string }>
}

export default async function AttendancePage(props: PageProps) {
  // ✅ FIX: await the searchParams Promise
  const searchParams = await props.searchParams
  const data = await loadData()
  const { grade, section } = searchParams || {}

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with section info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(grade || section) && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="gap-2"
            >
              <a href="/sections">
                <ArrowLeft className="h-4 w-4" />
                Back to Sections
              </a>
            </Button>
          )}
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Attendance {grade && section && `- ${grade} ${section}`}
            </h1>
            {grade && section && (
              <p className="text-muted-foreground mt-1">
                Managing attendance for {grade} - {section}
              </p>
            )}
          </div>
        </div>
      </div>

      <AttendanceClient data={data} />
    </div>
  )
}