// app/student-management/students-client.tsx
"use client"

import { useState } from "react"
import { StudentsTable } from "./components/students-table"
import { Student } from "./data/schema"
import { Button } from "@/components/ui/button"
import { Plus, X, Save } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentsClientProps {
  data: Student[]
}

export default function StudentsClient({ data }: StudentsClientProps) {
  const [students, setStudents] = useState<Student[]>(data)
  const [isUpdating, setIsUpdating] = useState(false)

  // Handle creating a new student
  const handleCreateStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'enrollment_date' | 'qr_code'>) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student')
      }

      if (result.success) {
        // Add the new student to the local state
        setStudents(prev => [...prev, result.data])
        toast.success('Student created successfully')
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create student')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create student')
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle updating an existing student
  const handleUpdateStudent = async (studentId: string, updatedData: Partial<Student>) => {
    setIsUpdating(true)
    try {
      console.log('🔄 Updating student:', studentId, 'with data:', updatedData);
      
      // Use the alternative endpoint
      const response = await fetch('/api/students/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: studentId,
          ...updatedData
        }),
      })

      const result = await response.json()
      console.log('📨 Update response:', result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to update student: ${response.status}`)
      }

      if (result.success) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, ...result.data }
              : student
          )
        )
        toast.success('Student updated successfully')
      } else {
        throw new Error(result.error || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update student')
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage your students and their information
          </p>
        </div>
        <CreateStudentButton 
          onCreateStudent={handleCreateStudent}
          isCreating={isUpdating}
        />
      </div>

      <StudentsTable 
        data={students}
        onStudentUpdate={handleUpdateStudent}
        isUpdating={isUpdating}
        showActions={true}
      />
    </div>
  )
}

// Create Student Button Component with similar layout to edit form
// Create Student Button Component with proper modal styling
function CreateStudentButton({ 
  onCreateStudent, 
  isCreating 
}: { 
  onCreateStudent: (data: any) => Promise<void>
  isCreating: boolean
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    grade: '7',
    section: '',
    adviser: '',
    contact_number: '',
    email: '',
    address: '',
    birth_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onCreateStudent(formData)
      setIsDialogOpen(false)
      // Reset form
      setFormData({
        student_id: '',
        student_name: '',
        grade: '7',
        section: '',
        adviser: '',
        contact_number: '',
        email: '',
        address: '',
        birth_date: '',
      })
    } catch (error) {
      // Error is handled in the parent component
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} disabled={isCreating}>
        <Plus className="h-4 w-4 mr-2" />
        Add Student
      </Button>

      {/* Create Student Dialog - Proper modal styling */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-muted/50">
              <div>
                <h3 className="text-lg font-semibold">Create New Student</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new student to the system
                </p>
              </div>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                disabled={isCreating}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Student ID */}
                <div className="col-span-2">
                  <Label htmlFor="create_student_id" className="text-sm font-medium">Student ID *</Label>
                  <Input 
                    id="create_student_id"
                    value={formData.student_id}
                    onChange={(e) => handleChange('student_id', e.target.value)}
                    placeholder="e.g., 2024-001"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Unique identifier for the student</p>
                </div>

                {/* Basic Information */}
                <div>
                  <Label htmlFor="create_student_name" className="text-sm font-medium">Full Name *</Label>
                  <Input 
                    id="create_student_name"
                    value={formData.student_name}
                    onChange={(e) => handleChange('student_name', e.target.value)}
                    placeholder="John Doe"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="create_grade" className="text-sm font-medium">Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                    <SelectTrigger className="mt-1">
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
                  <Label htmlFor="create_section" className="text-sm font-medium">Section *</Label>
                  <Input 
                    id="create_section"
                    value={formData.section}
                    onChange={(e) => handleChange('section', e.target.value)}
                    placeholder="A"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="create_adviser" className="text-sm font-medium">Adviser</Label>
                  <Input 
                    id="create_adviser"
                    value={formData.adviser}
                    onChange={(e) => handleChange('adviser', e.target.value)}
                    placeholder="Ms. Smith"
                    className="mt-1"
                  />
                </div>

                {/* Contact Information Section */}
                <div className="col-span-2 border-t pt-4 mt-2">
                  <h4 className="font-medium text-sm">Contact Information</h4>
                </div>

                <div>
                  <Label htmlFor="create_contact_number" className="text-sm font-medium">Contact Number</Label>
                  <Input 
                    id="create_contact_number"
                    value={formData.contact_number}
                    onChange={(e) => handleChange('contact_number', e.target.value)}
                    placeholder="+1234567890"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="create_email" className="text-sm font-medium">Email Address</Label>
                  <Input 
                    id="create_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="student@school.edu"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="create_address" className="text-sm font-medium">Address</Label>
                  <Input 
                    id="create_address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Full address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="create_birth_date" className="text-sm font-medium">Birth Date</Label>
                  <Input 
                    id="create_birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleChange('birth_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isCreating}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isCreating ? 'Creating...' : 'Create Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}