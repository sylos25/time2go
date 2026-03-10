"use client"

import { useSessionExpiry } from "@/hooks/use-session-expiry"
import { SessionExpiredAlert } from "@/components/session-expired-alert"

export function SessionMonitor() {
  const { isSessionExpired, resetExpiry } = useSessionExpiry()

  return (
    <SessionExpiredAlert
      isOpen={isSessionExpired}
      onClose={resetExpiry}
    />
  )
}
