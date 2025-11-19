"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Camera, X, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TransactionUploadProps {
  paymentId: string
}

export function TransactionUpload({ paymentId }: TransactionUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)')
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload process
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Here you would typically upload to your backend
    // For now, we'll just simulate success
    setTimeout(() => {
      setIsUploading(false)
      setUploadProgress(100)
      alert('Transaction proof uploaded successfully! Your payment is being verified.')
      
      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 2000)
    }, 1000)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTakePhoto = () => {
    // This would open camera in a real app
    alert('Camera functionality would open here. For now, please upload a file.')
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!selectedFile ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-2">
                Upload Transaction Proof
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Upload a screenshot of your GCash transaction
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTakePhoto}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-xs text-gray-400 mt-3">
                Supported formats: JPEG, PNG, GIF • Max 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Preview & Upload */
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* File Preview */}
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Selected File</p>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <img 
                    src={previewUrl || ''} 
                    alt="Transaction proof preview" 
                    className="w-full h-40 object-contain rounded"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-center text-gray-500">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-center">
                {!isUploading && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRemoveFile}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleUpload}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Proof
                    </Button>
                  </>
                )}
                
                {uploadProgress === 100 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Uploaded Successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-blue-800 mb-2">📸 Upload Tips:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Make sure the screenshot shows the transaction amount clearly</li>
            <li>• Include the reference number in the screenshot</li>
            <li>• Ensure the date and time are visible</li>
            <li>• Check that the image is clear and readable</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}