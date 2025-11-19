"use client"

import { useMemo, useState } from "react"
import { StudentsTable } from "./components/students-table"
import type { Student, StudentStatus } from "./data/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, Download, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Save, X } from "lucide-react"

interface Props {
  data: Student[]
}

export default function StudentsClient({ data }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [adviserFilter, setAdviserFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState(false)
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false)

  // Add Student Form State
  const [newStudentForm, setNewStudentForm] = useState({
    student_id: "",
    student_name: "",
    grade: "7",
    section: "",
    adviser: "",
    contact_number: "",
    email: "",
    address: "",
    birth_date: "",
  })

  // Get unique values for filters
  const advisers = useMemo(() => 
    Array.from(new Set(data.map(item => item.adviser))), 
    [data]
  )

  const grades = useMemo(() => 
    Array.from(new Set(data.map(item => item.grade))), 
    [data]
  )

  const sections = useMemo(() => 
    Array.from(new Set(data.map(item => item.section))), 
    [data]
  )

  const statuses = useMemo(() => 
    Array.from(new Set(data.map(item => item.status))), 
    [data]
  )

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(student => {
      const matchesSearch = student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           student.student_id.toLowerCase().includes(searchQuery) ||
                           student.email?.toLowerCase().includes(searchQuery) ||
                           student.contact_number?.includes(searchQuery)
      const matchesStatus = statusFilter === "all" || student.status === statusFilter
      const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
      const matchesSection = sectionFilter === "all" || student.section === sectionFilter
      const matchesAdviser = adviserFilter === "all" || student.adviser === adviserFilter
      
      return matchesSearch && matchesStatus && matchesGrade && matchesSection && matchesAdviser
    })
  }, [data, searchQuery, statusFilter, gradeFilter, sectionFilter, adviserFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(s => s.status === "active").length
    const inactive = data.filter(s => s.status === "inactive").length
    const graduated = data.filter(s => s.status === "graduated").length
    const transferred = data.filter(s => s.status === "transferred").length

    return { total, active, inactive, graduated, transferred }
  }, [data])

  // Function to update student status
  const updateStudentStatus = async (studentId: string, newStatus: StudentStatus) => {
    setIsUpdating(true)
    try {
      // TODO: Replace with your actual API call
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update student status')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating student status:', error)
      alert('Failed to update student status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to update student information
  const updateStudent = async (studentId: string, updatedData: Partial<Student>) => {
    setIsUpdating(true)
    try {
      // TODO: Replace with your actual API call
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error('Failed to update student')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to add new student
  const addStudent = async () => {
    setIsUpdating(true)
    try {
      // TODO: Replace with your actual API call
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newStudentForm,
          status: "active" as StudentStatus,
          enrollment_date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add student')
      }

      // Reset form and close modal
      setNewStudentForm({
        student_id: "",
        student_name: "",
        grade: "7",
        section: "",
        adviser: "",
        contact_number: "",
        email: "",
        address: "",
        birth_date: "",
      })
      setAddStudentModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleFormChange = (field: string, value: string) => {
    setNewStudentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-green-800">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
              <p className="text-sm text-yellow-800">Inactive</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.graduated}</p>
              <p className="text-sm text-blue-800">Graduated</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.transferred}</p>
              <p className="text-sm text-purple-800">Transferred</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Manage student information and enrollment status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 ml-auto">
         
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={isUpdating}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setAddStudentModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
        
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={adviserFilter} onValueChange={setAdviserFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Adviser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Advisers</SelectItem>
                  {advisers.map(adviser => (
                    <SelectItem key={adviser} value={adviser}>
                      {adviser}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Grade" />
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

              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map(section => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

         
            </div>
          </div>

          {/* Data Table */}
          <StudentsTable 
            data={filteredData} 
            onStatusUpdate={updateStudentStatus} 
            onStudentUpdate={updateStudent}
            isUpdating={isUpdating}
            showActions={true}
          />
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={addStudentModalOpen} onOpenChange={setAddStudentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the information for the new student. All fields are required unless marked optional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Student ID */}
            <div className="col-span-2">
              <Label htmlFor="new_student_id">Student ID *</Label>
              <Input 
                id="new_student_id"
                value={newStudentForm.student_id}
                onChange={(e) => handleFormChange('student_id', e.target.value)}
                placeholder="e.g., 2024-001"
                required
              />
            </div>

            {/* Basic Information */}
            <div className="col-span-2">
              <Label htmlFor="new_student_name">Full Name *</Label>
              <Input 
                id="new_student_name"
                value={newStudentForm.student_name}
                onChange={(e) => handleFormChange('student_name', e.target.value)}
                placeholder="e.g., Juan Dela Cruz"
                required
              />
            </div>

            <div>
              <Label htmlFor="new_grade">Grade *</Label>
              <Select value={newStudentForm.grade} onValueChange={(value) => handleFormChange('grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new_section">Section *</Label>
              <Input 
                id="new_section"
                value={newStudentForm.section}
                onChange={(e) => handleFormChange('section', e.target.value)}
                placeholder="e.g., A"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="new_adviser">Adviser *</Label>
              <Input 
                id="new_adviser"
                value={newStudentForm.adviser}
                onChange={(e) => handleFormChange('adviser', e.target.value)}
                placeholder="e.g., Ms. Garcia"
                required
              />
            </div>

            {/* Contact Information */}
            <div className="col-span-2 border-t pt-4">
              <h4 className="font-medium mb-3">Contact Information</h4>
            </div>

            <div>
              <Label htmlFor="new_contact_number">Contact Number</Label>
              <Input 
                id="new_contact_number"
                value={newStudentForm.contact_number}
                onChange={(e) => handleFormChange('contact_number', e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <Label htmlFor="new_email">Email Address</Label>
              <Input 
                id="new_email"
                type="email"
                value={newStudentForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="student@school.edu"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="new_address">Address</Label>
              <Input 
                id="new_address"
                value={newStudentForm.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                placeholder="Full address"
              />
            </div>

            <div>
              <Label htmlFor="new_birth_date">Birth Date</Label>
              <Input 
                id="new_birth_date"
                type="date"
                value={newStudentForm.birth_date}
                onChange={(e) => handleFormChange('birth_date', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={addStudent} 
              disabled={isUpdating || !newStudentForm.student_id || !newStudentForm.student_name || !newStudentForm.section || !newStudentForm.adviser}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Adding Student..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}