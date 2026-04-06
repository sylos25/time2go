import { AlertCircle, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type StatusVariant = "error" | "success"

type StatusMessageProps = {
  message: string | null
  variant?: StatusVariant
  className?: string
}

export function StatusMessage({ message, variant = "error", className }: StatusMessageProps) {
  if (!message) return null

  const isError = variant === "error"

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-sm flex items-center gap-2",
        isError ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700",
        className
      )}
    >
      {isError ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> : <CheckCircle className="h-4 w-4 flex-shrink-0" />}
      <span>{message}</span>
    </div>
  )
}
