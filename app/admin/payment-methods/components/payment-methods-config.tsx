"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Edit, Save, X, QrCode, Wallet, CreditCard, Banknote } from "lucide-react"

// Define the PaymentMethod type locally since we don't have the types file
interface PaymentMethod {
  id: number;
  method_code: string;
  method_name: string;
  description: string;
  is_active: boolean;
  has_qr: boolean;
  qr_code_image?: string;
  account_number?: string;
  account_name?: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

// Dummy data that will be used if API fails
const dummyPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    method_code: "gcash",
    method_name: "GCash",
    description: "Mobile wallet payment via GCash",
    is_active: true,
    has_qr: true,
    qr_code_image: "/images/qr-codes/gcash-qr.png",
    account_number: "0917 123 4567",
    account_name: "School Name",
    instructions: "1. Open GCash app\n2. Tap 'Scan QR'\n3. Scan the QR code above\n4. Enter the exact amount\n5. Add reference number in notes\n6. Take screenshot after payment",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    method_code: "cash",
    method_name: "Cash",
    description: "Physical cash payment",
    is_active: true,
    has_qr: false,
    account_number: "",
    account_name: "School Cashier",
    instructions: "Pay directly to the school cashier during office hours (8AM-5PM)",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    method_code: "bank_transfer",
    method_name: "Bank Transfer",
    description: "Bank transfer or deposit",
    is_active: true,
    has_qr: false,
    account_number: "1234-5678-9012",
    account_name: "School Name Foundation",
    instructions: "1. Go to any bank branch\n2. Fill out deposit slip\n3. Use account number above\n4. Write student name as reference\n5. Take photo of deposit slip",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    method_code: "paymaya",
    method_name: "PayMaya",
    description: "Mobile wallet payment via PayMaya",
    is_active: false,
    has_qr: true,
    qr_code_image: "/images/qr-codes/paymaya-qr.png",
    account_number: "0917 987 6543",
    account_name: "School Name",
    instructions: "1. Open PayMaya app\n2. Tap 'Scan to Pay'\n3. Scan the QR code\n4. Enter payment amount\n5. Add student name in description",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]

export function PaymentMethodsConfig() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setMethods(data)
      } else {
        // If API fails, use dummy data
        throw new Error('API not available')
      }
    } catch (error) {
      console.log('API not available, using dummy data')
      // Use dummy data with a delay to simulate loading
      setTimeout(() => {
        setMethods(dummyPaymentMethods)
        setLoading(false)
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingMethod(null)
    setIsCreateModalOpen(true)
  }

  const saveMethod = async (method: Partial<PaymentMethod>) => {
    try {
      const isCreating = !editingMethod
      
      if (isCreating) {
        // Create new method
        const newMethod: PaymentMethod = {
          id: Math.max(...methods.map(m => m.id)) + 1,
          method_code: method.method_code || "",
          method_name: method.method_name || "",
          description: method.description || "",
          is_active: method.is_active ?? true,
          has_qr: method.has_qr || false,
          qr_code_image: method.qr_code_image || "",
          account_number: method.account_number || "",
          account_name: method.account_name || "",
          instructions: method.instructions || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setMethods(prev => [...prev, newMethod])
      } else if (editingMethod) {
        // Update existing method
        setMethods(prev => prev.map(m => 
          m.id === editingMethod.id 
            ? { ...m, ...method, updated_at: new Date().toISOString() }
            : m
        ))
      }
      
      // Close modals
      setIsCreateModalOpen(false)
      setIsEditModalOpen(false)
      setEditingMethod(null)
      
      // Show success message
      alert(`Payment method ${isCreating ? 'created' : 'updated'} successfully!`)
    } catch (error) {
      console.error('Error saving payment method:', error)
      alert('Failed to save payment method. Please try again.')
    }
  }

  const toggleMethodStatus = async (methodId: number, isActive: boolean) => {
    try {
      // Simulate API call
      setMethods(prev => prev.map(method =>
        method.id === methodId
          ? { ...method, is_active: !isActive, updated_at: new Date().toISOString() }
          : method
      ))
      
      // Show success message
      alert(`Payment method ${!isActive ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error updating method status:', error)
      alert('Failed to update payment method status.')
    }
  }

  const getMethodIcon = (methodCode: string) => {
    switch (methodCode) {
      case 'gcash': return <Wallet className="h-5 w-5" />
      case 'paymaya': return <QrCode className="h-5 w-5" />
      case 'cash': return <Banknote className="h-5 w-5" />
      case 'bank_transfer': return <CreditCard className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading payment methods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground">
            Configure and manage payment methods
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Method
        </Button>
      </div>

      {/* Demo Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-blue-800 font-medium">Demo Mode</p>
            <p className="text-blue-600 text-sm">
              Using dummy data. Changes will be reset on page refresh.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <Card key={method.id} className={!method.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getMethodIcon(method.method_code)}
                  {method.method_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={method.is_active ? "default" : "secondary"}>
                    {method.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {method.has_qr && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      QR
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {method.account_number && (
                <div>
                  <Label className="text-sm">Account Number</Label>
                  <p className="text-sm font-mono">{method.account_number}</p>
                </div>
              )}

              {method.account_name && (
                <div>
                  <Label className="text-sm">Account Name</Label>
                  <p className="text-sm">{method.account_name}</p>
                </div>
              )}

              {method.has_qr && method.qr_code_image && (
                <div>
                  <Label className="text-sm">QR Code</Label>
                  <div className="bg-white p-2 rounded border inline-block mt-1">
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      QR Image
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor={`active-${method.id}`} className="text-sm">
                  Active
                </Label>
                <Switch
                  id={`active-${method.id}`}
                  checked={method.is_active}
                  onCheckedChange={() => toggleMethodStatus(method.id, method.is_active)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleEdit(method)}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Payment Method Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Payment Method</DialogTitle>
            <DialogDescription>
              Create a new payment method for students to use
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm
            method={null}
            onSave={saveMethod}
            onCancel={() => setIsCreateModalOpen(false)}
            isCreating={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the payment method details
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm
            method={editingMethod}
            onSave={saveMethod}
            onCancel={() => setIsEditModalOpen(false)}
            isCreating={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Form component for creating/editing payment methods
function PaymentMethodForm({ 
  method, 
  onSave, 
  onCancel, 
  isCreating 
}: { 
  method?: PaymentMethod | null
  onSave: (method: Partial<PaymentMethod>) => void
  onCancel: () => void
  isCreating: boolean
}) {
  const [formData, setFormData] = useState({
    method_code: method?.method_code || "",
    method_name: method?.method_name || "",
    description: method?.description || "",
    has_qr: method?.has_qr || false,
    qr_code_image: method?.qr_code_image || "",
    account_number: method?.account_number || "",
    account_name: method?.account_name || "",
    instructions: method?.instructions || "",
    is_active: method?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.method_code.trim() || !formData.method_name.trim()) {
      alert('Method code and name are required')
      return
    }
    
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="method_code">Method Code *</Label>
          <Input
            id="method_code"
            value={formData.method_code}
            onChange={(e) => setFormData({ ...formData, method_code: e.target.value })}
            placeholder="e.g., gcash, cash"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Unique identifier</p>
        </div>

        <div>
          <Label htmlFor="method_name">Method Name *</Label>
          <Input
            id="method_name"
            value={formData.method_name}
            onChange={(e) => setFormData({ ...formData, method_name: e.target.value })}
            placeholder="e.g., GCash, Cash"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Display name</p>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the payment method"
          />
        </div>

        <div>
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            placeholder="e.g., 0917 123 4567"
          />
        </div>

        <div>
          <Label htmlFor="account_name">Account Name</Label>
          <Input
            id="account_name"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            placeholder="e.g., School Name"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="qr_code_image">QR Code Image Path</Label>
          <Input
            id="qr_code_image"
            value={formData.qr_code_image}
            onChange={(e) => setFormData({ ...formData, qr_code_image: e.target.value })}
            placeholder="/images/qr-codes/gcash-qr.png"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Path to QR code image in your public folder
          </p>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Step-by-step payment instructions..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use new lines for each step
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="has_qr"
            checked={formData.has_qr}
            onCheckedChange={(checked) => setFormData({ ...formData, has_qr: checked })}
          />
          <Label htmlFor="has_qr">Has QR Code</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {isCreating ? "Create Method" : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}