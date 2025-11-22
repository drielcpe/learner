// app/student-management/components/students-table.tsx
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
import type { Student } from "../data/schema"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Mail, Phone, MoreHorizontal, Save, X, UserX, UserCheck, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

// Define custom table meta type for STUDENTS
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends unknown> {
    onStudentUpdate?: (studentId: string, updatedData: Partial<Student>) => void
    onStudentDeactivate?: (studentId: string) => void
    onStudentActivate?: (studentId: string) => void
    onStudentDelete?: (studentId: string) => void
    isStudentUpdating?: boolean
    showStudentActions?: boolean
  }
}

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "student_id",
    header: "Student ID",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{row.original.student_id}</span>
        {row.original.status !== 'ACTIVE' && (
          <Badge variant="outline" className="text-xs">
            {row.original.status}
          </Badge>
        )}
      </div>
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
        {row.original.enrollment_date ? new Date(row.original.enrollment_date).toLocaleDateString() : "-"}
      </div>
    ),
  },
  {
    accessorKey: "qr_code",
    header: "QR Code",
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.qr_code ? (
          <div className="flex flex-col items-center gap-1">
            <img 
              src={row.original.qr_code} 
              alt="QR Code" 
              className="w-12 h-12 object-contain border rounded hover:scale-110 transition-transform cursor-pointer"
              onClick={() => {
                // Open QR code in modal for better view
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                  <div class="bg-white p-4 rounded-lg">
                    <img src="${row.original.qr_code}" alt="QR Code" class="w-64 h-64" />
                    <p class="text-center mt-2 text-sm">${row.original.student_name}</p>
                    <button onclick="this.parentElement.parentElement.remove()" class="mt-2 w-full bg-gray-200 hover:bg-gray-300 py-1 rounded">Close</button>
                  </div>
                `;
                document.body.appendChild(modal);
              }}
            />
            <span className="text-xs text-muted-foreground">Click to view</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No QR</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const router = useRouter()
      const student = row.original
      const [viewModalOpen, setViewModalOpen] = useState(false)
      const [editModalOpen, setEditModalOpen] = useState(false)
      
      // Edit form state
      const [editForm, setEditForm] = useState({
        student_name: student.student_name,
        grade: student.grade,
        section: student.section,
        adviser: student.adviser || "",
        contact_number: student.contact_number || "",
        email: student.email || "",
        address: student.address || "",
        birth_date: student.birth_date || "",
      })

      // Get meta values from table
      const showActions = table.options.meta?.showStudentActions
      const onStudentUpdate = table.options.meta?.onStudentUpdate
      const onStudentDeactivate = table.options.meta?.onStudentDeactivate
      const onStudentActivate = table.options.meta?.onStudentActivate
      const onStudentDelete = table.options.meta?.onStudentDelete
      const isUpdating = table.options.meta?.isStudentUpdating

      const handleSaveEdit = async () => {
        console.log('🎯 handleSaveEdit called');
        console.log('📝 Edit form data:', editForm);
        
        if (onStudentUpdate) {
          // Convert null to undefined to match the Student type
          const updateData = {
            student_name: editForm.student_name,
            grade: editForm.grade,
            section: editForm.section,
            adviser: editForm.adviser || undefined,
            contact_number: editForm.contact_number || undefined,
            email: editForm.email || undefined,
            address: editForm.address || undefined,
            birth_date: editForm.birth_date || undefined,
          };
          
          console.log('📤 Sending update data to parent:', updateData);
          
          // Convert ID to string to ensure type safety
          await onStudentUpdate(student.id.toString(), updateData);
          setEditModalOpen(false);
        }
      }

      const handleFormChange = (field: string, value: string) => {
        setEditForm(prev => ({
          ...prev,
          [field]: value
        }))
      }

      const handleDeactivate = () => {
        console.log('🔴 Deactivate button clicked');
        if (onStudentDeactivate) {
          console.log('📤 Calling onStudentDeactivate...');
          onStudentDeactivate(student.id.toString());
        } else {
          console.log('❌ onStudentDeactivate is undefined!');
        }
      }

      const handleActivate = () => {
        console.log('🟢 Activate button clicked');
        if (onStudentActivate) {
          console.log('📤 Calling onStudentActivate...');
          onStudentActivate(student.id.toString());
        } else {
          console.log('❌ onStudentActivate is undefined!');
        }
      }

      const handleDelete = () => {
        console.log('🗑️ Delete button clicked in table');
        console.log('📋 onStudentDelete function exists:', !!onStudentDelete);
        console.log('🆔 Student ID to delete:', student.id.toString());
        
        if (onStudentDelete) {
          console.log('📤 Calling onStudentDelete...');
          onStudentDelete(student.id.toString());
        } else {
          console.log('❌ onStudentDelete is undefined!');
        }
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

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Student Actions</DropdownMenuLabel>
                    
                    {/* Status Actions */}
                    {student.status === 'ACTIVE' ? (
                      <DropdownMenuItem onClick={handleDeactivate}>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate Student
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={handleActivate}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate Student
                      </DropdownMenuItem>
                    )}
                    
              
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
                    <p>{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "Not provided"}</p>
                  </div>
                </div>
                {student.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p>{student.address}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {student.status}
                  </Badge>
                </div>
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
        </>
      )
    },
  },
]

interface StudentsTableProps {
  data: Student[]
  onStudentUpdate?: (studentId: string, updatedData: Partial<Student>) => void
  onStudentDeactivate?: (studentId: string) => void
  onStudentActivate?: (studentId: string) => void
  onStudentDelete?: (studentId: string) => void
  isUpdating?: boolean
  showActions?: boolean
}

export function StudentsTable({ 
  data, 
  onStudentUpdate,
  onStudentDeactivate,
  onStudentActivate,
  onStudentDelete,
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
      onStudentUpdate: onStudentUpdate,
      onStudentDeactivate: onStudentDeactivate,
      onStudentActivate: onStudentActivate,
      onStudentDelete: onStudentDelete,
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