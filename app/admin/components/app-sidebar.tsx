"use client"

import * as React from "react"
import {
  ChartLineIcon,
  FileIcon,
  HomeIcon,
  LifeBuoy,
  Send,
  Settings2Icon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,NotebookIcon,FlagIcon
} from "lucide-react"

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavSecondary } from  "./nav-secondary"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: HomeIcon,
    },
    {
      title: "Payment",
      url: "/payments/admin",
      icon: NotebookIcon,
    },
    {
      title: "Attendance Console",
      url: "/admin/attendance",
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
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
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