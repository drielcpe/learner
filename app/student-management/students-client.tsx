// app/student-management/students-client.tsx
"use client"

import { useState } from "react"
import { StudentsTable } from "./components/students-table"
import { Student } from "./data/schema"
import { Button } from "@/components/ui/button"
import { Plus, X, Save, User, Users } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
      console.log('📤 Creating student with data:', studentData)
      
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })

      const result = await response.json()
      console.log('📨 Create student response:', result)

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

  // Handle deactivating a student
  const handleDeactivateStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to deactivate this student? They will no longer be able to access the system.')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/students/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: studentId,
          status: 'INACTIVE'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deactivate student')
      }

      if (result.success) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'INACTIVE' }
              : student
          )
        )
        toast.success('Student deactivated successfully')
      } else {
        throw new Error(result.error || 'Failed to deactivate student')
      }
    } catch (error) {
      console.error('Error deactivating student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate student')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle activating a student
  const handleActivateStudent = async (studentId: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/students/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: studentId,
          status: 'ACTIVE'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to activate student')
      }

      if (result.success) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, status: 'ACTIVE' }
              : student
          )
        )
        toast.success('Student activated successfully')
      } else {
        throw new Error(result.error || 'Failed to activate student')
      }
    } catch (error) {
      console.error('Error activating student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to activate student')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle deleting a student
  const handleDeleteStudent = async (studentId: string) => {
    console.log('🗑️ handleDeleteStudent called in parent with ID:', studentId);
    
    if (!confirm('Are you sure you want to delete this student? This action will mark the student as deleted.')) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    setIsUpdating(true);
    try {
      console.log('📤 Sending DELETE request to:', `/api/students/delete?id=${studentId}`);
      
      const response = await fetch(`/api/students/delete?id=${studentId}`, {
        method: 'DELETE',
      });

      console.log('📨 DELETE response status:', response.status);
      
      const result = await response.json();
      console.log('📊 DELETE response data:', result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to delete student: ${response.status}`);
      }

      if (result.success) {
        console.log('✅ Student deleted successfully, updating local state');
        // Remove from local state
        setStudents(prev => prev.filter(student => student.id !== studentId));
        toast.success('Student deleted successfully');
      } else {
        throw new Error(result.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete student');
    } finally {
      setIsUpdating(false);
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
        onStudentDeactivate={handleDeactivateStudent}
        onStudentActivate={handleActivateStudent}
        onStudentDelete={handleDeleteStudent}
        isUpdating={isUpdating}
        showActions={true}
      />
    </div>
  )
}

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
    student_type: 'student' as 'student' | 'secretary',
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
    
    // Validate required fields
    if (!formData.student_id || !formData.student_name || !formData.section) {
      toast.error('Please fill in all required fields')
      return
    }

    // Add debug log to see what's being submitted
    console.log('🎯 Submitting student data:', formData)
    
    try {
      await onCreateStudent(formData)
      setIsDialogOpen(false)
      // Reset form
      setFormData({
        student_id: '',
        student_name: '',
        student_type: 'student',
        grade: '7',
        section: '',
        adviser: '',
        contact_number: '',
        email: '',
        address: '',
        birth_date: '',
      })
      toast.success('Student created successfully')
    } catch (error) {
      // Error is handled in the parent component
      console.error('Error in CreateStudentButton:', error)
    }
  }

  const handleChange = (field: string, value: string) => {
    console.log(`🔄 Field ${field} changed to:`, value)
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
          <div className="bg-white rounded-lg border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-muted/50 sticky top-0">
              <div>
                <h3 className="text-lg font-semibold">Create New Student</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new student to the system
                </p>
              </div>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1"
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

                {/* Student Type Field */}
                <div>
                  <Label htmlFor="create_student_type" className="text-sm font-medium">Student Type *</Label>
                  <Select 
                    value={formData.student_type} 
                    onValueChange={(value: 'student' | 'secretary') => handleChange('student_type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {formData.student_type === 'student' ? (
                            <>
                              <User className="h-4 w-4 text-green-600" />
                              <span>Student</span>
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 text-blue-600" />
                              <span>Secretary</span>
                            </>
                          )}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span>Student</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="secretary">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>Secretary</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.student_type === 'secretary' 
                      ? 'Secretaries have additional permissions' 
                      : 'Regular student account'
                    }
                  </p>
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    {/* Show current selection badge */}
                    <Badge 
                      variant="outline" 
                      className={
                        formData.student_type === 'secretary' 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {formData.student_type === 'secretary' ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Secretary</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Student</span>
                        </div>
                      )}
                    </Badge>
                  </div>
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