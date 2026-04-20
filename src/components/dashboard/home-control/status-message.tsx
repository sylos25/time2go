type StatusMessageProps = {
  message: string
  tone: "error" | "success"
}

export function StatusMessage({ message, tone }: StatusMessageProps) {
  const className =
    tone === "error"
      ? "sticky top-4 z-50 rounded-xl border border-red-400/70 bg-red-50 px-4 py-3 text-red-800 shadow-lg ring-1 ring-red-300/60 dark:border-red-500/60 dark:bg-red-900/45 dark:text-red-100 dark:ring-red-500/35"
      : "sticky top-4 z-50 rounded-xl border border-emerald-400/70 bg-emerald-100 px-4 py-3 text-emerald-900 shadow-lg ring-1 ring-emerald-300/70 dark:border-emerald-500/60 dark:bg-emerald-900/45 dark:text-emerald-100 dark:ring-emerald-500/35"

  return (
    <div className={className} role="status" aria-live="polite">
      {message}
    </div>
  )
}
