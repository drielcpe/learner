// hooks/useStudentData.ts
import { useState, useEffect } from 'react'

interface StudentData {
  studentId: string
  studentName: string
  grade: string
  section: string
  role: string
}

export function useStudentData() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getStudentData = () => {
      try {
        // Try to get from userData in localStorage
        const userData = localStorage.getItem('userData')
        if (userData) {
          return JSON.parse(userData)
        }

        // Fallback to individual items
        const studentId = localStorage.getItem('studentId')
        const studentName = localStorage.getItem('studentName')
        const grade = localStorage.getItem('grade')
        const section = localStorage.getItem('section')
        const role = localStorage.getItem('userRole')

        if (studentId && studentName) {
          return {
            studentId,
            studentName,
            grade: grade || '',
            section: section || '',
            role: role || 'student'
          }
        }
        
        return null
      } catch (err) {
        console.error('Error reading from localStorage:', err)
        return null
      }
    }

    const data = getStudentData()
    setStudentData(data)
    setLoading(false)
  }, [])

  return { studentData, loading }
}