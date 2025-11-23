"use client"

import * as React from "react"
import {
  BarChart3Icon,
  ChartLineIcon,
  FileIcon,
  FlagIcon,
  HomeIcon,
  LibraryBig,
  LifeBuoy,
  NotebookIcon,
  Send,
  Settings2Icon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react"

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { NavMain } from "@/app/student/components/nav-main"
import { NavSecondary } from  "@/app/student/components/nav-secondary"

// Define the nav item type
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<any>
}

const getNavItems = (studentType?: string): NavItem[] => {
  const baseNavItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/student/dashboard",
      icon: BarChart3Icon,
    },
    {
      title: "Payment",
      url: "/payments/students",
      icon: NotebookIcon,
    },
    {
      title: "Attendance",
      url: "/student/attendance",
      icon: FlagIcon,
    },
    {
      title: "Personal Information",
      url: "/student/personal-info/",
      icon: UserIcon,
    }
  ]

  // If student type is secretary, add the Attendance Console
  if (studentType === 'secretary') {
    return [
      ...baseNavItems.slice(0, 3), // Take first 3 items (Dashboard, Payment, Attendance)
      {
        title: "Attendance Console",
        url: "/secretary-attendance",
        icon: FlagIcon,
      },
      ...baseNavItems.slice(3) // Add the rest (Personal Information)
    ]
  }

  return baseNavItems
}

const data = {
  navSecondary: [
    {
      title: "Learner",
      url: "#",
      icon: LibraryBig,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navMain, setNavMain] = React.useState<NavItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Get student type from localStorage
    const getStudentType = () => {
      try {
        // Try to get from userData
        const userData = localStorage.getItem('userData')
        if (userData) {
          const parsedData = JSON.parse(userData)
          return parsedData.studentType || parsedData.role || 'student'
        }

        // Fallback to individual items
        const studentType = localStorage.getItem('studentType')
        const userRole = localStorage.getItem('userRole')
        
        return studentType || userRole || 'student'
      } catch (err) {
        console.error('Error reading student type from localStorage:', err)
        return 'student'
      }
    }

    const studentType = getStudentType()
    const navItems = getNavItems(studentType)
    setNavMain(navItems)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Sidebar
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        {...props}
      >
        <SidebarContent>
          <div className="flex items-center justify-center h-20">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}