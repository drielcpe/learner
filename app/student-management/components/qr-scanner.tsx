// app/student-management/components/qr-scanner.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Scan, X } from "lucide-react"

interface QRScannerProps {
  onScan: (data: any) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRScanner({ onScan, open, onOpenChange }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)

  const handleManualInput = () => {
    const studentId = prompt('Enter Student ID manually:')
    if (studentId) {
      onScan({ student_id: studentId })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Student QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <Scan className="h-16 w-16 text-gray-400" />
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Point your camera at the student's QR code
          </p>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManualInput}>
              Manual Input
            </Button>
            <Button onClick={() => setScanning(!scanning)}>
              {scanning ? 'Stop Scanning' : 'Start Scanning'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}