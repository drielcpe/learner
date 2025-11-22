"use client"

import { useMemo, useState, useEffect } from "react"
import { AdminDataTable } from "./components/admin-data-table"
import type { Attendance, DayKey, PeriodKey, AttendanceStatus } from "./data/schema"
import { buildAdminColumns } from "./components/admin-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Download, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Props {
  data: Attendance[]
}

export default function AdminAttendanceClient({ data }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [key, setKey] = useState(0)
  const [internalData, setInternalData] = useState(data)

  // Update internal data when props change
  useEffect(() => {
    setInternalData(data)
  }, [data])

  // Get day number from selected date
  const getDayNumber = (dateString: string): DayKey => {
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()) as DayKey
      // Ensure the day is valid (1-31)
      return day >= "1" && day <= "31" ? day : "1"
    } catch {
      return "1"
    }
  }

  const dayNumber: DayKey = getDayNumber(selectedDate)
  const isEditable = true

  // Force re-render when date changes
  useEffect(() => {
    setKey(prev => prev + 1)
  }, [selectedDate])

  // Get unique grades and sections for filters
  const grades = useMemo(() => 
    Array.from(new Set(data
      .map(item => item.grade)
      .filter((grade): grade is string => Boolean(grade))
    )).sort(), 
    [data]
  )
  
  const sections = useMemo(() => 
    Array.from(new Set(data
      .map(item => item.section)
      .filter((section): section is string => Boolean(section))
    )).sort(), 
    [data]
  )

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return internalData.filter(record => {
      const matchesSearch = record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.student_id.toString().includes(searchQuery)
      const matchesGrade = selectedGrade === "all" || record.grade === selectedGrade
      const matchesSection = selectedSection === "all" || record.section === selectedSection
      
      return matchesSearch && matchesGrade && matchesSection
    })
  }, [internalData, searchQuery, selectedGrade, selectedSection])

  // Function to update local state immediately
  const updateLocalAttendance = (
    studentId: number,
    day: DayKey,
    period: PeriodKey,
    status: AttendanceStatus
  ) => {
    console.log('🔄 Updating local attendance:', { studentId, day, period, status })
    
    setInternalData((prev) =>
      prev.map((row) => {
        if (row.id !== studentId) return row

        const currentAttendance = row.attendance || {}
        const currentDay = currentAttendance[day] || {}
        
        const updatedRow = {
          ...row,
          attendance: {
            ...currentAttendance,
            [day]: {
              ...currentDay,
              [period]: status,
            },
          },
        }

        console.log('✅ Local state updated for:', updatedRow.student_name)
        return updatedRow
      })
    )
  }

  // Function to update attendance in the database
  const updateAttendance = async (
    studentId: number,
    day: DayKey,
    period: PeriodKey,
    status: AttendanceStatus
  ) => {
    try {
      const month_year = selectedDate.slice(0, 7) // Get YYYY-MM from selected date
      
      console.log('📡 Sending API request:', {
        studentId,
        day,
        period,
        status,
        month_year
      })

      // Update local state immediately for better UX
      updateLocalAttendance(studentId, day, period, status)

      const response = await fetch(`/api/attendance/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day,
          period,
          status,
          month_year
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Revert local state if API call fails
        console.error('❌ API call failed, reverting local state')
        // You might want to show an error toast here
        throw new Error(result.error || 'Failed to update attendance')
      }

      console.log('✅ Attendance updated successfully:', result.data)
      return result.data
    } catch (error) {
      console.error('❌ Error updating attendance:', error)
      throw error
    }
  }

  const columns = useMemo(
    () => buildAdminColumns(dayNumber, isEditable),
    [dayNumber, isEditable]
  )

  // Calculate today's attendance stats
  const todaysStats = useMemo(() => {
    let present = 0
    let absent = 0
    let late = 0
    let excused = 0
    let total = filteredData.length

    filteredData.forEach(record => {
      Object.values(record.attendance?.[dayNumber] || {}).forEach(status => {
        if (status === "present") present++
        else if (status === "absent") absent++
        else if (status === "late") late++
        else if (status === "excused") excused++
      })
    })

    return { present, absent, late, excused, total }
  }, [filteredData, dayNumber])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Attendance Management</CardTitle>
          <CardDescription>
            Manage student attendance for {selectedDate} - Day {dayNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{todaysStats.total}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{todaysStats.present}</p>
                  <p className="text-sm text-green-800">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{todaysStats.late}</p>
                  <p className="text-sm text-yellow-800">Late</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{todaysStats.absent}</p>
                  <p className="text-sm text-red-800">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{todaysStats.excused}</p>
                  <p className="text-sm text-blue-800">Excused</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Section */}
          <div className="space-y-4">
            {/* Date Selection Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Label htmlFor="attendance-date" className="font-medium whitespace-nowrap text-blue-900">
                  Attendance Date:
                </Label>
                <Input
                  id="attendance-date"
                  type="date"
                  className="w-[160px] bg-white"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-800">
                  Day {dayNumber}
                </Badge>
              </div>

              {/* Quick Actions */}
           
            </div>

            {/* Search and Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
            

              {/* Grade Filter */}
              <div className="space-y-2">
                <Label htmlFor="grade-filter" className="text-sm">Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger id="grade-filter">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Filter */}
              <div className="space-y-2">
                <Label htmlFor="section-filter" className="text-sm">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger id="section-filter">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <Label className="text-sm opacity-0">Actions</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedGrade("all")
                    setSelectedSection("all")
                    setSearchQuery("")
                  }}
                  disabled={selectedGrade === "all" && selectedSection === "all" && !searchQuery}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Filter Summary */}
            {(selectedGrade !== "all" || selectedSection !== "all" || searchQuery) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredData.length} students</span>
                {selectedGrade !== "all" && (
                  <Badge variant="secondary">Grade: {selectedGrade}</Badge>
                )}
                {selectedSection !== "all" && (
                  <Badge variant="secondary">Section: {selectedSection}</Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary">Search: "{searchQuery}"</Badge>
                )}
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="rounded-lg">
            <AdminDataTable 
              key={key}
              columns={columns} 
              data={filteredData}
              grades={grades}
              sections={sections}
              selectedGrade={selectedGrade}
              selectedSection={selectedSection}
              onGradeChange={setSelectedGrade}
              onSectionChange={setSelectedSection}
              onUpdateAttendance={updateAttendance}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}