// app/student-management/components/create-student-dialog.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface CreateStudentDialogProps {
  onCreateStudent: (data: any) => Promise<void>
  isCreating: boolean
}

export function CreateStudentDialog({ onCreateStudent, isCreating }: CreateStudentDialogProps) {
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
    
    // Validate required fields
    if (!formData.student_id || !formData.student_name || !formData.section) {
      toast.error('Please fill in all required fields')
      return
    }

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
      toast.success('Student created successfully')
    } catch (error) {
      // Error is handled in the parent component
      console.error('Error in CreateStudentDialog:', error)
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Student</DialogTitle>
            <DialogDescription>
              Add a new student to the system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Student ID */}
              <div className="col-span-2">
                <Label htmlFor="create_student_id" className="text-sm font-medium">Student ID *</Label>
                <Input 
                  id="create_student_id"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  placeholder="e.g., 2024-001"
                  required
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
                />
              </div>

              <div>
                <Label htmlFor="create_grade" className="text-sm font-medium">Grade *</Label>
                <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
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
                <Label htmlFor="create_section" className="text-sm font-medium">Section *</Label>
                <Input 
                  id="create_section"
                  value={formData.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  placeholder="A"
                  required
                />
              </div>

              <div>
                <Label htmlFor="create_adviser" className="text-sm font-medium">Adviser</Label>
                <Input 
                  id="create_adviser"
                  value={formData.adviser}
                  onChange={(e) => handleChange('adviser', e.target.value)}
                  placeholder="Ms. Smith"
                />
              </div>

              {/* Contact Information Section */}
              <div className="col-span-2 border-t pt-4">
                <h4 className="font-medium mb-3">Contact Information</h4>
              </div>

              <div>
                <Label htmlFor="create_contact_number" className="text-sm font-medium">Contact Number</Label>
                <Input 
                  id="create_contact_number"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  placeholder="+1234567890"
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
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="create_address" className="text-sm font-medium">Address</Label>
                <Input 
                  id="create_address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>

              <div>
                <Label htmlFor="create_birth_date" className="text-sm font-medium">Birth Date</Label>
                <Input 
                  id="create_birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                disabled={isCreating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}