type StatusMessageProps = {
  message: string
  tone: "error" | "success"
}

export function StatusMessage({ message, tone }: StatusMessageProps) {
  const className =
    tone === "error"
      ? "rounded-xl border border-red-400/40 bg-red-50/90 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-200"
      : "rounded-xl border border-emerald-400/50 bg-emerald-100/80 px-4 py-3 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-200"

  return <div className={className}>{message}</div>
}
