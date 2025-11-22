import { cookies } from "next/headers"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/app/student/components/side-header"
import AdminAttendanceClient from "./AdminAttendanceClient"
import type { Attendance } from "../../attendance/data/schema"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCog } from "lucide-react"

async function getAttendanceData(): Promise<Attendance[]> {
  try {
    // Use relative URL instead of environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/attendance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Loaded ${result.data.length} students with attendance data`)
      return result.data
    } else {
      console.error('❌ API returned error:', result.error)
      return []
    }
  } catch (error) {
    console.error('❌ Error fetching attendance data:', error)
    return []
  }
}

export default async function AdminAttendancePage({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  const attendanceData = await getAttendanceData()

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
          <UserCog className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Admin Mode</span>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="m-5">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage student attendance records - Update status and track attendance
        </p>
      </div>

      <AdminAttendanceClient data={attendanceData} />
      {children}
    </div>
  )
}