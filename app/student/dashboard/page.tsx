"use client";

import ProtectedRoute from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, Phone, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from '@/hooks/useSession';
import { useEffect, useState } from 'react';

interface DashboardData {
  studentInfo: {
    studentId: string;
    studentName: string;
    grade: string;
    section: string;
    adviser: string;
  };
  todayStatus: {
    overall: string;
    periods: {
      total: number;
      present: number;
      absent: number;
      late: number;
    };
  };
  overallAttendance: {
    rate: number;
    periods: {
      total: number;
      present: number;
      absent: number;
      late: number;
    };
  };
  payment: {
    status: string;
    amount: number;
    dueDate: string | null;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  recentActivity: Array<{
    day: string;
    period: string;
    status: string;
    date: string;
  }>;
}

export default function StudentDashboard() {
  const { user } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.studentId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/student/dashboard?studentId=${user.studentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load dashboard data');
        }

        setDashboardData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.studentId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'late': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !dashboardData) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="container mx-auto py-6 space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
                <p className="text-muted-foreground">{error || 'Unable to load your dashboard data.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {dashboardData.studentInfo.studentName}! Here's your academic overview.
            </p>
            <p className="text-xs text-muted-foreground">
              Student ID: {dashboardData.studentInfo.studentId} | Grade {dashboardData.studentInfo.grade} - {dashboardData.studentInfo.section}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              {getStatusIcon(dashboardData.todayStatus.overall)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(dashboardData.todayStatus.overall)}`}>
                {dashboardData.todayStatus.overall}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.todayStatus.periods.present}P {dashboardData.todayStatus.periods.absent}A {dashboardData.todayStatus.periods.late}L
              </p>
            </CardContent>
          </Card>

          {/* Overall Attendance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overallAttendance.rate}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.overallAttendance.periods.present} of {dashboardData.overallAttendance.periods.total} periods
              </p>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPaymentStatusColor(dashboardData.payment.status)}`}>
                {dashboardData.payment.status.charAt(0).toUpperCase() + dashboardData.payment.status.slice(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.payment.amount > 0 ? `₱${dashboardData.payment.amount}` : 'No payment data'}
              </p>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{dashboardData.emergencyContact.name}</div>
              <p className="text-sm text-muted-foreground">
                {dashboardData.emergencyContact.relationship}
              </p>
              <p className="text-xs text-muted-foreground">
                {dashboardData.emergencyContact.phone}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your most important features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start gap-2">
                <Link href="/student/attendance">
                  <Calendar className="h-4 w-4" />
                  View My Attendance
                </Link>
              </Button>
              <Button asChild className="w-full justify-start gap-2">
                <Link href="/student/personal-info/">
                  <Calendar className="h-4 w-4" />
                 Personal Information
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link href="/payments/students/">
                  <CreditCard className="h-4 w-4" />
                  Payment History
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest attendance updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{activity.day}</span>
                      <span className="text-xs text-muted-foreground ml-2">{activity.period}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      activity.status === 'present' ? 'text-green-600' :
                      activity.status === 'absent' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}