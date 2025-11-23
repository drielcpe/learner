"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useSession() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = async () => {
    try {
      const userRole = localStorage.getItem("userRole")
      const studentId = localStorage.getItem("studentId")
      const userData = localStorage.getItem("userData")

      if (!userRole) {
        setValid(false)
        setLoading(false)
        return
      }

      // Validate session with server
      const params = new URLSearchParams({ role: userRole })
      if (userRole === 'student' && studentId) {
        params.append('studentId', studentId)
      }

      const res = await fetch(`/api/auth/validate?${params}`)
      const data = await res.json()

      if (data.success && data.valid) {
        setUser(data.data)
        setValid(true)
        
        // Update localStorage with fresh data
        if (data.data) {
          localStorage.setItem("userData", JSON.stringify(data.data))
        }
      } else {
        // Invalid session, clear storage
        clearSession()
        setValid(false)
      }
    } catch (error) {
      console.error('Session validation error:', error)
      clearSession()
      setValid(false)
    } finally {
      setLoading(false)
    }
  }

  const clearSession = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("studentId")
    localStorage.removeItem("studentName")
    localStorage.removeItem("userData")
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setValid(false)
    router.push('/')
  }

  return { user, loading, valid, logout, validateSession }
}