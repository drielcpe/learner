"use client"

import { useMemo, useState } from "react"
import { DataTable } from "../../attendance/components/data-table"
import type { Attendance, DayKey } from "../../attendance/data/schema"
import { buildDailyColumns } from "../../attendance/components/daily-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  data: Attendance[]
  studentId: string
  studentName: string
}

export default function StudentAttendanceClient({ data, studentId, studentName }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const getDayNumber = (dateString: string): DayKey => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return "1" as DayKey
      }
      return String(date.getDate()) as DayKey
    } catch (error) {
      console.error('Date parsing error:', error)
      return "1" as DayKey
    }
  }

  const dayNumber: DayKey = getDayNumber(selectedDate)
  const isEditable = false

  // Filter data to only show the current student
  const studentData = useMemo(() => {
    return data.filter(record => 
      record.id.toString() === studentId.toString() || 
      record.student_id?.toString() === studentId.toString() ||
      record.student_name?.toLowerCase().trim() === studentName.toLowerCase().trim()
    )
  }, [data, studentId, studentName])

  const columns = useMemo(
    () => buildDailyColumns(dayNumber, isEditable),
    [dayNumber, isEditable]
  )

  // Calculate PERIOD-based attendance stats
  const attendanceStats = useMemo(() => {
    let presentPeriods = 0
    let totalPeriods = 0
    let todaysStatus = "No Data"
    let todaysPresentPeriods = 0
    let todaysTotalPeriods = 0

    studentData.forEach(record => {
      // Get today's attendance for the selected day
      const todaysAttendance = record.attendance?.[dayNumber]
      
      if (todaysAttendance) {
        Object.entries(todaysAttendance).forEach(([period, status]) => {
          totalPeriods++
          todaysTotalPeriods++
          
          if (status === true || status === "present") {
            presentPeriods++
            todaysPresentPeriods++
          }
        })
      }

      // Calculate overall attendance across all days
      Object.entries(record.attendance || {}).forEach(([day, periods]) => {
        Object.entries(periods || {}).forEach(([period, status]) => {
          if (day !== dayNumber) { // Don't double count today
            totalPeriods++
            if (status === true || status === "present") {
              presentPeriods++
            }
          }
        })
      })
    })

    // Determine today's overall status
    if (todaysTotalPeriods > 0) {
      if (todaysPresentPeriods === todaysTotalPeriods) {
        todaysStatus = "Fully Present"
      } else if (todaysPresentPeriods === 0) {
        todaysStatus = "Fully Absent"
      } else if (todaysPresentPeriods > 0) {
        todaysStatus = "Partially Present"
      }
    }

    const attendanceRate = totalPeriods > 0 ? Math.round((presentPeriods / totalPeriods) * 100) : 0
    const absentPeriods = totalPeriods - presentPeriods

    return { 
      attendanceRate, 
      presentPeriods, 
      absentPeriods, 
      totalPeriods,
      todaysStatus,
      todaysPresentPeriods,
      todaysTotalPeriods
    }
  }, [studentData, dayNumber])

  return (
    <div className="flex flex-col gap-6">
      {/* Student Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{studentName}</h2>
              <p className="text-muted-foreground mt-1">Student ID: {studentId}</p>
              <p className="text-sm text-blue-600 mt-1">
                📅 Viewing Day: {dayNumber} | Selected Date: {selectedDate}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-muted-foreground">Viewing your attendance records</p>
              <p className="text-sm font-medium text-blue-600">Read-only access</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="attendance-date" className="font-medium whitespace-nowrap">
                Select Date to View:
              </Label>
              <Input
                id="attendance-date"
                type="date"
                className="w-[180px]"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>📅 View your attendance for any date</p>
              <p>Your data has days: 1, 2 - Try selecting dates that match these days</p>
            </div>
          </div>
        </CardContent>
      </Card>

     

      {/* Attendance Table - Only shows current student */}
      {studentData.length > 0 ? (
        <>
          {/* Stats Summary - PERIOD BASED */}
         
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Your attendance for Day {dayNumber} (Date: {selectedDate})
                {attendanceStats.todaysTotalPeriods > 0 && (
                  <span className="ml-2">
                    - {attendanceStats.todaysPresentPeriods} of {attendanceStats.todaysTotalPeriods} periods marked present
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={studentData} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No attendance records found for</p>
              <p className="font-semibold text-xl mt-1">{studentName}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check if the date selection is correct or contact your advisor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}