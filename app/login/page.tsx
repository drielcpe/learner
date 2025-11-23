"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, User, QrCode, Scan } from "lucide-react";

type LoginType = "admin" | "student";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>("admin");
  
  // Admin login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Student QR state
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('🔄 Sending admin login request...');
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password,
          role: "admin" 
        }),
      });

      console.log('📨 Response status:', res.status);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      console.log('📦 Response data:', data);

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store admin session
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userData", JSON.stringify(data.data));
      
      console.log('✅ Login successful, redirecting to admin...');
      router.push("/admin");

    } catch (err: any) {
      console.error('💥 Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
      setError(''); // Clear previous errors
    }
  };

  const handleQrLogin = async () => {
    if (!qrFile) {
      setError("Please upload a QR code image");
      return;
    }

    setQrLoading(true);
    setError("");

    try {
      console.log('🔄 Sending QR login request...');

      const formData = new FormData();
      formData.append("qrCode", qrFile);

      const res = await fetch("/api/auth/qr-login", {
        method: "POST",
        body: formData,
      });

      console.log('📨 QR Response status:', res.status);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('❌ Non-JSON response from QR login:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await res.json();
      console.log('📦 QR Response data:', data);

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'QR login failed');
      }

      // Store student session
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentId", data.data.studentId);
      localStorage.setItem("studentName", data.data.studentName);
      localStorage.setItem("userData", JSON.stringify(data.data));
      
      console.log('✅ QR login successful, redirecting...');
      router.push("/student/dashboard");

    } catch (err: any) {
      console.error('💥 QR login error:', err);
      setError(err.message || 'Failed to process QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // Test function to check if API is working
  const testApiConnection = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test', role: 'admin' })
      });
      console.log('🧪 API test response:', await res.text());
    } catch (error) {
      console.error('🧪 API test failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Choose your login method to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Uncomment for testing */}
          {/* <Button onClick={testApiConnection} variant="outline" size="sm">
            Test API Connection
          </Button> */}

          <Tabs value={loginType} onValueChange={(value) => {
            setLoginType(value as LoginType);
            setError(''); // Clear errors when switching tabs
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Student
              </TabsTrigger>
            </TabsList>

            {/* Admin Login Tab */}
            <TabsContent value="admin" className="space-y-4">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button 
                  className="w-full" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign in as Admin"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Student Login Tab */}
            <TabsContent value="student" className="space-y-4">
              {error && (
                <div className="text-sm text-red-500 text-center bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="text-center space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">QR Code Login</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Upload your student QR code to login
                  </p>
                </div>

                <div className="space-y-3">
                  {qrPreview && (
                    <div className="text-center">
                      <img 
                        src={qrPreview} 
                        alt="QR Code Preview" 
                        className="mx-auto max-w-[200px] border rounded-lg"
                      />
                      <p className="text-sm text-green-600 mt-1">QR Code loaded successfully</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="qr-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <Scan className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {qrFile ? "Change QR Code" : "Click to upload QR Code"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG supported
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="qr-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                      disabled={qrLoading}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleQrLogin} 
                    disabled={!qrFile || qrLoading}
                  >
                    {qrLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying QR Code...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Login with QR Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}