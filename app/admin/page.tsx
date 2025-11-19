import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BarChart3, Download, Settings, UserCheck, FileText, School } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adviser Console</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Ms. Santos! Manage your class and monitor student progress.
          </p>
        </div>
    
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">
              Grade 7 - Section A
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Today's attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Need verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Management Tools</CardTitle>
            <CardDescription>
              Access class management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start gap-2">
              <Link href="/admin/attendance">
                <UserCheck className="h-4 w-4" />
                Attendance Manager
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/student-management">
                <Users className="h-4 w-4" />
                Student Directory
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/payments/admin">
                <FileText className="h-4 w-4" />
                Payment Verification
              </Link>
            </Button>
        
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Overview</CardTitle>
            <CardDescription>
              Current class status and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Present Today</span>
              </div>
              <span className="text-sm font-bold text-green-600">32 students</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Absent Today</span>
              </div>
              <span className="text-sm font-bold text-red-600">3 students</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Pending Payments</span>
              </div>
              <span className="text-sm font-bold text-blue-600">8 requests</span>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Weekly Attendance:</span>
                  <span className="font-medium">89%</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Payments:</span>
                  <span className="font-medium">75%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    
    </div>
  )
}