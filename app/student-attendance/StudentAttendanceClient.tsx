"use client"

import { useMemo, useState } from "react"
import { DataTable } from "../attendance/components/data-table"
import type { Attendance, DayKey } from "../attendance/data/schema"
import { buildDailyColumns } from "../attendance/components/daily-columns"
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
    // ✅ FIX: Ensure valid date format
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}` // yyyy-mm-dd
  })

  // ✅ FIX: Proper date parsing with validation
  const getDayNumber = (dateString: string): DayKey => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return "1" as DayKey // Fallback to day 1
      }
      return String(date.getDate()) as DayKey
    } catch (error) {
      console.error('Date parsing error:', error)
      return "1" as DayKey // Fallback to day 1
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

  // Calculate attendance stats
  const attendanceStats = useMemo(() => {
    let presentDays = 0
    let totalDays = 0

    studentData.forEach(record => {
      Object.values(record.attendance || {}).forEach(day => {
        Object.values(day || {}).forEach(present => {
          totalDays++
          if (present) presentDays++
        })
      })
    })

    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    const absentDays = totalDays - presentDays

    return { attendanceRate, presentDays, absentDays, totalDays }
  }, [studentData])

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

      {/* Day Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Label className="font-medium self-center">Quick Jump to Day:</Label>
            {["1", "2"].map(day => (
              <button
                key={day}
                onClick={() => {
                  // Set to a date that will give us this day number
                  const today = new Date()
                  const newDate = new Date(today.getFullYear(), today.getMonth(), parseInt(day))
                  const year = newDate.getFullYear()
                  const month = String(newDate.getMonth() + 1).padStart(2, '0')
                  const dayStr = String(newDate.getDate()).padStart(2, '0')
                  setSelectedDate(`${year}-${month}-${dayStr}`)
                }}
                className={`px-3 py-1 rounded text-sm ${
                  dayNumber === day 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table - Only shows current student */}
      {studentData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Your attendance for Day {dayNumber} (Date: {selectedDate})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={studentData} />
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</p>
                  <p className="text-sm text-blue-800 font-medium">Overall Attendance</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {attendanceStats.presentDays} of {attendanceStats.totalDays} days
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{attendanceStats.presentDays}</p>
                  <p className="text-sm text-green-800 font-medium">Days Present</p>
                  <p className="text-xs text-green-600 mt-1">Good attendance!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{attendanceStats.absentDays}</p>
                  <p className="text-sm text-red-800 font-medium">Days Absent</p>
                  <p className="text-xs text-red-600 mt-1">
                    {attendanceStats.totalDays > 0 ? Math.round((attendanceStats.absentDays / attendanceStats.totalDays) * 100) : 0}% of total
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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