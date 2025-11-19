"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/app/attendance/components/data-table-pagination"
import { DataTableToolbar } from "@/app/attendance/components/data-table-toolbar"
import type { Student, StudentStatus } from "../data/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Mail, Phone, Bell, MoreHorizontal, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define custom table meta type for STUDENTS with unique property names
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends unknown> {
    onStudentStatusUpdate?: (studentId: string, newStatus: StudentStatus) => void
    onStudentUpdate?: (studentId: string, updatedData: Partial<Student>) => void
    isStudentUpdating?: boolean
    showStudentActions?: boolean
  }
}

// Status badge configuration
const statusConfig = {
  active: { color: "bg-green-100 text-green-800 border-green-200", label: "Active" },
  inactive: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Inactive" },
  graduated: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Graduated" },
  transferred: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Transferred" },
} as const

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "student_id",
    header: "Student ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.student_id}</span>
    ),
  },
  {
    accessorKey: "student_name",
    header: "Student Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.student_name}</div>
        <div className="text-xs text-muted-foreground">
          Grade {row.original.grade} - {row.original.section}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "adviser",
    header: "Adviser",
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Phone className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{row.original.contact_number || "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Mail className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{row.original.email || "-"}</span>
      </div>
    ),
  },
  {
    accessorKey: "birth_date",
    header: "Birth Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.birth_date ? new Date(row.original.birth_date).toLocaleDateString() : "-"}
      </div>
    ),
  },
  {
    accessorKey: "enrollment_date",
    header: "Enrollment Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.enrollment_date).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const config = statusConfig[status]
      return (
        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const router = useRouter()
      const student = row.original
      const [viewModalOpen, setViewModalOpen] = useState(false)
      const [editModalOpen, setEditModalOpen] = useState(false)
      const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
      const [activateDialogOpen, setActivateDialogOpen] = useState(false)
      const [notifyDialogOpen, setNotifyDialogOpen] = useState(false)
      
      // Edit form state
      const [editForm, setEditForm] = useState({
        student_name: student.student_name,
        grade: student.grade,
        section: student.section,
        adviser: student.adviser,
        contact_number: student.contact_number || "",
        email: student.email || "",
        address: student.address || "",
        birth_date: student.birth_date || "",
      })

      // Get meta values from table using unique property names
      const showActions = table.options.meta?.showStudentActions
      const onStatusUpdate = table.options.meta?.onStudentStatusUpdate
      const onStudentUpdate = table.options.meta?.onStudentUpdate
      const isUpdating = table.options.meta?.isStudentUpdating

      const handleStatusUpdate = (newStatus: StudentStatus) => {
        if (onStatusUpdate) {
          onStatusUpdate(student.id, newStatus)
        }
      }

      const handleSaveEdit = async () => {
        if (onStudentUpdate) {
          await onStudentUpdate(student.id, editForm)
          setEditModalOpen(false)
        }
      }

const handleNotify = async (method: 'call' | 'email' | 'sms') => {
  try {
    switch (method) {
      case 'call':
        if (!student.contact_number) {
          alert('No contact number available for this student')
          return
        }
        
        const cleanNumber = student.contact_number.replace(/[^\d+]/g, '')
        
        // Check if we're in a mobile environment
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // Mobile device - use tel: protocol
          window.open(`tel:${cleanNumber}`, '_blank')
        } else {
          // Desktop - show number and instructions
          alert(`Call ${student.student_name}'s parents at: ${cleanNumber}\n\nOn mobile devices, this would open your phone dialer automatically.`)
        }
        break

      case 'email':
        if (!student.email) {
          alert('No email address available for this student')
          return
        }
        
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // Mobile device
          window.open(`mailto:${student.email}?subject=Regarding ${student.student_name}&body=Dear Parent/Guardian,`, '_blank')
        } else {
          // Desktop
          window.open(`mailto:${student.email}`, '_blank')
        }
        break

      case 'sms':
        if (!student.contact_number) {
          alert('No contact number available for this student')
          return
        }
        
        const smsNumber = student.contact_number.replace(/[^\d+]/g, '')
        const message = `Regarding ${student.student_name}`
        
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // Mobile device
          window.open(`sms:${smsNumber}?body=${encodeURIComponent(message)}`, '_blank')
        } else {
          // Desktop - show instructions
          alert(`SMS ${student.student_name}'s parents at: ${smsNumber}\n\nMessage: ${message}\n\nOn mobile devices, this would open your messaging app automatically.`)
        }
        break
    }
  } catch (error) {
    console.error('Error opening communication app:', error)
    alert('Unable to open communication app. Please check your device settings.')
  } finally {
    setNotifyDialogOpen(false)
  }
}

      const handleFormChange = (field: string, value: string) => {
        setEditForm(prev => ({
          ...prev,
          [field]: value
        }))
      }

      return (
        <>
          <div className="flex gap-2">
            {/* View Button - Opens Modal */}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setViewModalOpen(true)}
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            
            {/* Adviser actions */}
            {showActions && (
              <>
                {/* Edit Button - Opens Edit Modal */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>

                {/* Notify Dropdown */}
        <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="h-8 gap-1">
      <Bell className="h-3 w-3" />
      Notify
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Contact Options</DropdownMenuLabel>
    <DropdownMenuItem 
      onClick={() => handleNotify('call')}
      disabled={!student.contact_number}
    >
      <Phone className="h-4 w-4 mr-2" />
      Call Parents
      {!student.contact_number && (
        <span className="ml-2 text-xs text-muted-foreground">No number</span>
      )}
    </DropdownMenuItem>
    <DropdownMenuItem 
      onClick={() => handleNotify('email')}
      disabled={!student.email}
    >
      <Mail className="h-4 w-4 mr-2" />
      Send Email
      {!student.email && (
        <span className="ml-2 text-xs text-muted-foreground">No email</span>
      )}
    </DropdownMenuItem>
    <DropdownMenuItem 
      onClick={() => handleNotify('sms')}
      disabled={!student.contact_number}
    >
      <Bell className="h-4 w-4 mr-2" />
      Send SMS
      {!student.contact_number && (
        <span className="ml-2 text-xs text-muted-foreground">No number</span>
      )}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => setActivateDialogOpen(true)}
                      disabled={student.status === 'active'}
                    >
                      Activate Student
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeactivateDialogOpen(true)}
                      disabled={student.status === 'inactive'}
                    >
                      Deactivate Student
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => router.push(`/student-management/attendance/${student.id}`)}
                    >
                      View Attendance
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push(`/student-management/grades/${student.id}`)}
                    >
                      View Grades
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* View Student Modal */}
          <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Student Information</DialogTitle>
                <DialogDescription>
                  Detailed information about {student.student_name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                    <p className="font-mono">{student.student_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p>{student.student_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Grade & Section</label>
                    <p>Grade {student.grade} - {student.section}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adviser</label>
                    <p>{student.adviser}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                    <p>{student.contact_number || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{student.email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Birth Date</label>
                    <p>{student.birth_date ? new Date(student.birth_date).toLocaleDateString() : "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Enrollment Date</label>
                    <p>{new Date(student.enrollment_date).toLocaleDateString()}</p>
                  </div>
                </div>
                {student.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p>{student.address}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
             
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Student Modal */}
          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Student Information</DialogTitle>
                <DialogDescription>
                  Update the information for {student.student_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                {/* Student ID (Read-only) */}
                <div className="col-span-2">
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input 
                    id="student_id"
                    value={student.student_id}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Student ID cannot be changed</p>
                </div>

                {/* Basic Information */}
                <div>
                  <Label htmlFor="student_name">Full Name</Label>
                  <Input 
                    id="student_name"
                    value={editForm.student_name}
                    onChange={(e) => handleFormChange('student_name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={editForm.grade} onValueChange={(value) => handleFormChange('grade', value)}>
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
                  <Label htmlFor="section">Section</Label>
                  <Input 
                    id="section"
                    value={editForm.section}
                    onChange={(e) => handleFormChange('section', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="adviser">Adviser</Label>
                  <Input 
                    id="adviser"
                    value={editForm.adviser}
                    onChange={(e) => handleFormChange('adviser', e.target.value)}
                  />
                </div>

                {/* Contact Information */}
                <div className="col-span-2 border-t pt-4">
                  <h4 className="font-medium mb-3">Contact Information</h4>
                </div>

                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input 
                    id="contact_number"
                    value={editForm.contact_number}
                    onChange={(e) => handleFormChange('contact_number', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="student@school.edu"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address"
                    value={editForm.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input 
                    id="birth_date"
                    type="date"
                    value={editForm.birth_date}
                    onChange={(e) => handleFormChange('birth_date', e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Deactivate Confirmation Dialog */}
          <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate Student</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to deactivate {student.student_name}? 
                  This will change their status to inactive and they will no longer appear in active class lists.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleStatusUpdate('inactive')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Deactivate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Activate Confirmation Dialog */}
          <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Activate Student</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to activate {student.student_name}? 
                  This will change their status to active and they will appear in class lists.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleStatusUpdate('active')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Yes, Activate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    },
  },
]

interface StudentsTableProps {
  data: Student[]
  onStatusUpdate?: (studentId: string, newStatus: StudentStatus) => void
  onStudentUpdate?: (studentId: string, updatedData: Partial<Student>) => void
  isUpdating?: boolean
  showActions?: boolean
}

export function StudentsTable({ 
  data, 
  onStatusUpdate, 
  onStudentUpdate,
  isUpdating = false, 
  showActions = false 
}: StudentsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      onStudentStatusUpdate: onStatusUpdate,
      onStudentUpdate: onStudentUpdate,
      isStudentUpdating: isUpdating,
      showStudentActions: showActions
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar table={table} />
      
      <div className="overflow-x-auto rounded-md border">
        <ShadTable>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadTable>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}