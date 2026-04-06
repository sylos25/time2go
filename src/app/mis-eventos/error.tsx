"use client"

import { MisEventosErrorState } from "@/app/mis-eventos/components/mis-eventos-error-state"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <MisEventosErrorState onRetry={reset} />
}