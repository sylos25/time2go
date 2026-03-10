import type React from "react"
import { SessionMonitor } from "@/components/session-monitor"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <SessionMonitor />
      {children}
    </div>
  )
}
