// app/student/attendance/page.tsx
"use client"

import { useEffect, useState } from "react"
import ProtectedRoute from '@/components/ProtectedRoute' // Add this import
import StudentAttendanceClient from "./StudentAttendanceClient"
import { attendanceSchema } from "../../attendance/data/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Loader2 } from "lucide-react"

interface StudentData {
  studentId: string
  studentName: string
  grade: string
  section: string
  role: string
}

async function loadStudentAttendance(studentId: string) {
  try {
    const response = await fetch(`/api/student/attendance?studentId=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load attendance data')
    }

    // Validate data with your schema
    return attendanceSchema.array().parse(result.data)
  } catch (error) {
    console.error('Error loading student attendance:', error)
    return []
  }
}

export default function StudentAttendancePage() {
  const [data, setData] = useState<any[]>([])
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get student data from localStorage
    const getUserData = () => {
      try {
        // Try to get from userData in localStorage
        const userData = localStorage.getItem('userData')
        if (userData) {
          return JSON.parse(userData)
        }

        // Fallback to individual items
        const studentId = localStorage.getItem('studentId')
        const studentName = localStorage.getItem('studentName')
        const userRole = localStorage.getItem('userRole')

        if (studentId && studentName) {
          return {
            studentId,
            studentName,
            grade: localStorage.getItem('grade') || '',
            section: localStorage.getItem('section') || '',
            role: userRole || 'student'
          }
        }
        
        return null
      } catch (err) {
        console.error('Error reading from localStorage:', err)
        return null
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const userData = getUserData()
        
        if (!userData) {
          setError('Student data not found. Please log in again.')
          setLoading(false)
          return
        }

        setStudentData(userData)
        const attendanceData = await loadStudentAttendance(userData.studentId)
        setData(attendanceData)
        
      } catch (err) {
        setError('Failed to load attendance data')
        console.error('Error fetching attendance:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student"> {/* Add this wrapper */}
        <div className="container mx-auto py-6 space-y-6">
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
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your attendance data...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="student"> {/* Add this wrapper */}
        <div className="container mx-auto py-6 space-y-6">
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
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button className="mt-4" asChild>
                  <a href="/student">Return to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (!studentData) {
    return (
      <ProtectedRoute requiredRole="student"> {/* Add this wrapper */}
        <div className="container mx-auto py-6 space-y-6">
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
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
                <p className="text-muted-foreground">Please log in to view your attendance.</p>
                <Button className="mt-4" asChild>
                  <a href="/login">Go to Login</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="student"> {/* Add this wrapper */}
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href="/student/dashboard">
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
          studentId={studentData.studentId}
          studentName={studentData.studentName}
        />
      </div>
    </ProtectedRoute>
  )
}