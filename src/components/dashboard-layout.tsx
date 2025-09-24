"use client"

import type React from "react"

import { useState } from "react"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { BarChart3, Calendar, Home, Settings, Users } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
}

const menuItems = [
  { id: "overview", name: "Dashboard", icon: Home },
  { id: "events", name: "Eventos", icon: Calendar },
  { id: "users", name: "Usuarios", icon: Users },
  { id: "analytics", name: "Analíticas", icon: BarChart3 },
  { id: "settings", name: "Configuración", icon: Settings },
]

export function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const [notifications] = useState(3)

  const getPageTitle = () => {
    const item = menuItems.find((item) => item.id === activeTab)
    return item?.name || "Dashboard"
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <h1 className="text-white text-xl font-bold">Time2Go Admin</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h2 className="text-2xl font-bold text-foreground">{getPageTitle()}</h2>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notifications}
                    </Badge>
                  )}
                </Button>

                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Admin</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
