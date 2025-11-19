import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, User, Mail, Phone, MapPin, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock user data - in real app, this would come from your database
const userData = {
  id: "user_123",
  student_id: "2023-00123",
  name: "Juan Dela Cruz",
  email: "juan.delacruz@student.edu.ph",
  phone: "+63 912 345 6789",
  grade: "Grade 7",
  section: "Section A",
  adviser: "Ms. Maria Santos",
  
  // Editable fields
  address: {
    street: "123 Main Street",
    barangay: "Barangay 1",
    city: "Quezon City",
    province: "Metro Manila",
    zipCode: "1100"
  },
  contact: {
    primaryPhone: "+63 912 345 6789",
    secondaryPhone: "+63 917 654 3210",
    emergencyContact: "Maria Dela Cruz",
    emergencyPhone: "+63 918 888 9999"
  }
}

export default function PersonalInfoPage() {
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
            <Link href="/student">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
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
                <Input id="studentId" value={userData.student_id} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeSection">Grade & Section</Label>
                <Input id="gradeSection" value={`${userData.grade} - ${userData.section}`} readOnly className="bg-muted" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={userData.name} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input id="email" value={userData.email} readOnly className="bg-muted" />
                <Badge variant="secondary" className="whitespace-nowrap">
                  Verified
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adviser">Class Adviser</Label>
              <Input id="adviser" value={userData.adviser} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
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
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" placeholder="Enter street address" defaultValue={userData.address.street} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Input id="barangay" placeholder="Enter barangay" defaultValue={userData.address.barangay} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City/Municipality</Label>
                <Input id="city" placeholder="Enter city" defaultValue={userData.address.city} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input id="province" placeholder="Enter province" defaultValue={userData.address.province} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input id="zipCode" placeholder="Enter ZIP code" defaultValue={userData.address.zipCode} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Details
            </CardTitle>
            <CardDescription>
              Update your phone numbers and emergency contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input id="primaryPhone" placeholder="+63 912 345 6789" defaultValue={userData.contact.primaryPhone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                <Input id="secondaryPhone" placeholder="+63 917 654 3210" defaultValue={userData.contact.secondaryPhone} />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-sm">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input id="emergencyName" placeholder="Full name" defaultValue={userData.contact.emergencyContact} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input id="emergencyPhone" placeholder="+63 918 888 9999" defaultValue={userData.contact.emergencyPhone} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}