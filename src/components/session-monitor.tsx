"use client"

import { useSessionExpiry } from "@/hooks/use-session-expiry"
import { SessionExpiredAlert } from "@/components/session-expired-alert"

export function SessionMonitor() {
  const { isSessionExpired, reason, resetExpiry } = useSessionExpiry()

  return (
    <SessionExpiredAlert
      isOpen={isSessionExpired}
      reason={reason}
      onClose={resetExpiry}
    />
  )
}
