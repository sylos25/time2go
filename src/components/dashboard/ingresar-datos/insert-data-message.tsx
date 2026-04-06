import { AlertCircle, CheckCircle } from "lucide-react"

type InsertDataMessageProps = {
  message: {
    type: "success" | "error"
    text: string
  } | null
}

export function InsertDataMessage({ message }: InsertDataMessageProps) {
  if (!message) return null

  return (
    <div
      className={`rounded-lg border p-4 ${
        message.type === "success"
          ? "border-lime-200 bg-lime-50/80 text-green-800 dark:border-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-200"
          : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {message.type === "success" ? (
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
    </div>
  )
}
