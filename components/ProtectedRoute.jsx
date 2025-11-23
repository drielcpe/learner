"use client"

import { useSession } from '@/hooks/useSession'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, valid } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !valid) {
      router.push('/')
    }
    
    if (!loading && valid && requiredRole && user?.role !== requiredRole) {
      router.push('/')
    }
  }, [loading, valid, user, requiredRole, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!valid) {
    return (
        router.push('/login')
    )
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
        router.push('/login')
    )
  }

  return children
}