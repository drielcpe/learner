export interface Student {
  id: string
  student_id: string
  name: string
  grade: string
  section: string
  email?: string
}

export const studentsData: Student[] = [
  {
    id: "1",
    student_id: "STU001",
    name: "John Doe",
    grade: "Grade 1",
    section: "Section A",
    email: "john.doe@school.edu"
  },
  {
    id: "2",
    student_id: "STU002", 
    name: "Jane Smith",
    grade: "Grade 1",
    section: "Section A",
    email: "jane.smith@school.edu"
  },
  {
    id: "3",
    student_id: "STU003",
    name: "Mike Johnson",
    grade: "Grade 2", 
    section: "Section A",
    email: "mike.johnson@school.edu"
  },
  // Add more students as needed
]