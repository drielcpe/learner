"use client"

import { useMemo, useState, useEffect } from "react"
import { SecretaryDataTable } from "./components/secretary-data-table"
import type { Attendance, DayKey, AttendanceStatus } from "../../attendance/data/schema"
import { buildSecretaryColumns } from "./components/secretary-columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Plus, Download, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Props {
  data: Attendance[]
}

export default function SecretaryAttendanceClient({ data }: Props) {
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

  // Get day number from selected date
  const getDayNumber = (dateString: string): DayKey => {
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? "1" : String(date.getDate())
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
    )), 
    [data]
  )
  
  const sections = useMemo(() => 
    Array.from(new Set(data
      .map(item => item.section)
      .filter((section): section is string => Boolean(section))
    )), 
    [data]
  )

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesSearch = record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.student_id.toString().includes(searchQuery)
      const matchesGrade = selectedGrade === "all" || record.grade === selectedGrade
      const matchesSection = selectedSection === "all" || record.section === selectedSection
      
      return matchesSearch && matchesGrade && matchesSection
    })
  }, [data, searchQuery, selectedGrade, selectedSection])

  const columns = useMemo(
    () => buildSecretaryColumns(dayNumber, isEditable),
    [dayNumber, isEditable]
  )

  // Calculate today's attendance stats
  const todaysStats = useMemo(() => {
    let present = 0
    let absent = 0
    let late = 0
    let total = filteredData.length

    filteredData.forEach(record => {
      Object.values(record.attendance?.[dayNumber] || {}).forEach(status => {
        if (status === "present") present++
        else if (status === "absent") absent++
        else if (status === "late") late++
      })
    })

    return { present, absent, late, total }
  }, [filteredData, dayNumber])

  return (
    <div className="space-y-6">
      {/* Single Merged Card Layout */}
      
     
        <CardContent className="space-y-6">
          {/* Stats Overview - Compact Layout */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* Quick Status Actions */}
             
            </div>

            {/* Search and Filters Row */}
         
          </div>

          {/* Data Table */}
          <div className="rounded-lg">
            <SecretaryDataTable 
              key={key}
              columns={columns} 
              data={filteredData} 
            />
          </div>

      
        </CardContent>
 
    </div>
  )
}