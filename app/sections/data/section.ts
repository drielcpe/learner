export interface Section {
  id: string
  grade: string
  section: string
  studentCount: number
  teacher: string
}

export const sectionsData: Section[] = [
  {
    id: "1",
    grade: "Grade 1",
    section: "Section A",
    studentCount: 25,
    teacher: "Ms. Johnson"
  },
  {
    id: "2", 
    grade: "Grade 1",
    section: "Section B",
    studentCount: 28,
    teacher: "Mr. Smith"
  },
  {
    id: "3",
    grade: "Grade 2", 
    section: "Section A",
    studentCount: 30,
    teacher: "Ms. Davis"
  },
  // Add more sections as needed
]