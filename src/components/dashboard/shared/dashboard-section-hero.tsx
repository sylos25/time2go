import type { JSX, ReactNode } from "react"

interface DashboardSectionHeroProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export function DashboardSectionHero({
  title,
  subtitle,
  children,
}: DashboardSectionHeroProps): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-4 py-6 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />
      <div className="relative space-y-4">
        <h3 className="text-center text-3xl font-semibold tracking-tight text-white dark:text-lime-200 sm:text-5xl">
          <span style={{ fontFamily: "Futura, Trebuchet MS, Helvetica, Arial, sans-serif" }}>
            {title}
          </span>
        </h3>
        {subtitle && (
          <p className="text-center text-lime-100 dark:text-emerald-300">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
