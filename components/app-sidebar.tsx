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
const data = {
  navMain: [
     {
      title: "Dashboard",
      url: "/student",
      icon: BarChart3Icon,
    },
    {
      title: "Payment",
      url: "/payments/students",
      icon: NotebookIcon,
    },
    {
      title: "Attendance",
      url: "/student-attendance",
      icon: FlagIcon,
    },
    {
      title: "Attendance Console",
      url: "/secretary-attendance",
      icon: FlagIcon,
    },
    {
      title: "Personal Information",
      url: "/personal-info",
      icon: UserIcon,
    }
  ],
  navSecondary: [
    {
      title: "Learner",
      url: "#",
      icon: LibraryBig,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}