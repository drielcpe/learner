// components/qr-scanner.tsx
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Camera, Scan, Loader2 } from 'lucide-react'
import { CameraResultType } from '@capacitor/camera'
interface QRScannerProps {
  onScanComplete: (qrData: string) => void
  isScanning: boolean
}

export function QRScanner({ onScanComplete, isScanning }: QRScannerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const startQRScan = async () => {
    if (typeof window === 'undefined') return
    
    setIsLoading(true)
    
    try {
      // Check if we're in a Capacitor environment
      const isCapacitor = 'Capacitor' in window
      
      if (isCapacitor) {
        await scanWithCapacitor()
      } else {
        await scanWithWebAPI()
      }
    } catch (error) {
      console.error('QR Scan error:', error)
      alert('Failed to scan QR code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const scanWithCapacitor = async () => {
    try {
      // Dynamic import for Capacitor
      const { Camera } = await import('@capacitor/camera')
      
      // Request camera permissions
      const permission = await Camera.requestPermissions()
      
      if (permission.camera !== 'granted') {
        alert('Camera permission is required to scan QR codes')
        return
      }

      // Open camera for QR scanning - use 'base64' with correct format
    const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    promptLabelHeader: 'Scan QR Code',
    promptLabelCancel: 'Cancel',
    promptLabelPhoto: 'From Gallery',
    promptLabelPicture: 'Take Picture'
    })

      if (image.base64String) {
        // Create data URL from base64 string
        const dataUrl = `data:image/jpeg;base64,${image.base64String}`
        const qrData = await processImageForQR(dataUrl)
        onScanComplete(qrData)
      }

    } catch (error) {
      console.error('Capacitor camera error:', error)
      // Fallback to web API if Capacitor fails
      await scanWithWebAPI()
    }
  }

  const scanWithWebAPI = async () => {
    // For web implementation - show file input for image upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string
          const qrData = await processImageForQR(dataUrl)
          onScanComplete(qrData)
        }
        reader.readAsDataURL(file)
      }
    }
    
    input.click()
  }

  const processImageForQR = async (imageData: string): Promise<string> => {
    // In a real app, you'd use a QR decoding library here
    // For demo purposes, we'll return a mock student ID
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock QR data - in real app, this would be decoded from the image
        const mockStudentIds = ['2024-001', '2024-002', '2024-003', '2024-004', '2024-005', '2024-006']
        const randomId = mockStudentIds[Math.floor(Math.random() * mockStudentIds.length)]
        resolve(randomId)
      }, 1000)
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        {isLoading ? (
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
        ) : (
          <Camera className="h-16 w-16 text-gray-400" />
        )}
      </div>
      
      <Button 
        onClick={startQRScan} 
        disabled={isLoading || isScanning}
        className="gap-2"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Scan className="h-5 w-5" />
        )}
        {isLoading ? 'Scanning...' : 'Scan QR Code'}
      </Button>
      
      <p className="text-sm text-gray-500 text-center">
        Point your camera at your student ID QR code to login
      </p>
    </div>
  )
}