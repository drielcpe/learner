// app/student-login/page.tsx
"use client"

import { useState } from 'react'
import { QRScanner } from '@/components/qr-scanner'
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StudentLoginPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()

  const handleQRScan = async (qrData: string) => {
    setIsLoggingIn(true)
    
    try {
      const response = await fetch('/api/auth/qr-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qr_data: qrData }),
      })

      const result = await response.json()

      if (result.success) {
        // Save student session
        localStorage.setItem('student_token', result.data.token)
        localStorage.setItem('student_data', JSON.stringify(result.data.student))
        
        // Redirect to student dashboard
        router.push('/student/dashboard')
      } else {
        alert(`Login failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleManualLogin = () => {
    // Fallback for manual login
    const studentId = prompt('Enter your Student ID:')
    if (studentId) {
      handleQRScan(studentId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-blue-700 mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <User className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Student Login</h1>
              <p className="text-blue-100">Scan your QR code to access your account</p>
            </div>
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="p-6">
          {isLoggingIn ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-gray-600">Logging you in...</p>
            </div>
          ) : (
            <QRScanner 
              onScanComplete={handleQRScan}
              isScanning={isScanning}
            />
          )}
        </div>

        {/* Alternative Login Options */}
        <div className="border-t p-6">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleManualLogin}
            disabled={isLoggingIn}
          >
            Manual Login with Student ID
          </Button>
        </div>
      </div>
    </div>
  )
}