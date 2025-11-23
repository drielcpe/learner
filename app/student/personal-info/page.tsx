"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, User, Mail, Phone, MapPin, Edit, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface StudentData {
  id: number
  student_id: string
  student_name: string
  email: string
  contact_number: string
  grade: string
  section: string
  adviser: string
  address: string
  birth_date: string
  status: string
  student_type: string
  created_at: string
  updated_at: string
}

interface UpdateData {
  contact_number: string
  address: string
  email: string
}

export default function PersonalInfoPage() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateData>({
    contact_number: "",
    address: "",
    email: ""
  })

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const studentId = localStorage.getItem('studentId')
      
      if (!studentId) {
        
        router.push('/login')
        return
      }

      const response = await fetch(`/api/student/profile?studentId=${studentId}`)
      const result = await response.json()

      if (result.success) {
        setStudentData(result.data)
        setFormData({
          contact_number: result.data.contact_number || "",
          address: result.data.address || "",
          email: result.data.email || ""
        })
      } else {
        console.error('Failed to fetch student data:', result.error)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const studentId = localStorage.getItem('studentId')
      
      if (!studentId) {
        alert('Student ID not found. Please log in again.')
        router.push('/login')
        return
      }

      // Validate required fields
      if (!formData.contact_number.trim()) {
        alert('Contact number is required')
        return
      }

      if (!formData.address.trim()) {
        alert('Address is required')
        return
      }

      if (!formData.email.trim()) {
        alert('Email is required')
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address')
        return
      }

      const updateData = {
        studentId,
        contact_number: formData.contact_number.trim(),
        address: formData.address.trim(),
        email: formData.email.trim()
      }

      console.log('Sending update data:', updateData)

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      console.log('Update response:', result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success) {
        alert('Profile updated successfully!')
        // Refresh the data
        fetchStudentData()
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof UpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading student information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p>Student data not found.</p>
          <Button className="mt-4" asChild>
            <Link href="/student/dashboard/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Information</h1>
          <p className="text-muted-foreground">
            Manage your personal details and contact information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/student/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button 
            className="gap-2" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your student profile details (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input 
                  id="studentId" 
                  value={studentData.student_id} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeSection">Grade & Section</Label>
                <Input 
                  id="gradeSection" 
                  value={`${studentData.grade} - ${studentData.section}`} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={studentData.student_name} 
                readOnly 
                className="bg-muted" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adviser">Class Adviser</Label>
              <Input 
                id="adviser" 
                value={studentData.adviser || "Not assigned"} 
                readOnly 
                className="bg-muted" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentType">Student Type</Label>
                <Input 
                  id="studentType" 
                  value={studentData.student_type || "Regular"} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input 
                  id="status" 
                  value={studentData.status || "Active"} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update your contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="your.email@example.com" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your primary email address for school communications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input 
                id="contactNumber" 
                placeholder="+63 912 345 6789" 
                value={formData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Primary contact number for school communications
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
            <CardDescription>
              Update your current residential address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <textarea
                id="address"
                placeholder="Enter your complete residential address including street, barangay, city, province, and ZIP code"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground">
                Include street, barangay, city/municipality, province, and ZIP code
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Account and system details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createdAt">Account Created</Label>
                <Input 
                  id="createdAt" 
                  value={studentData.created_at ? new Date(studentData.created_at).toLocaleString() : "Unknown"} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="updatedAt">Last Updated</Label>
                <Input 
                  id="updatedAt" 
                  value={studentData.updated_at ? new Date(studentData.updated_at).toLocaleString() : "Unknown"} 
                  readOnly 
                  className="bg-muted" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}