import { cookies } from "next/headers"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from  "@/app/student/components/side-header"
import SecretaryAttendanceClient from "./SecretaryAttendanceClient"
import { attendanceSchema } from "../../attendance/data/schema"
import fs from "fs/promises"
import path from "path"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCog } from "lucide-react"

async function loadData() {
  const file = await fs.readFile(
    path.join(process.cwd(), "app/attendance/data/tasks.json")
  )
  return attendanceSchema.array().parse(JSON.parse(file.toString()))
}
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
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
          <UserCog className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Adviser Mode</span>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="m-5">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage student attendance records - Update status and track attendance
        </p>
      </div>

      <SecretaryAttendanceClient data={data} />
    </div>






  )
}