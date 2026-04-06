import type { ElementType, ReactNode } from "react"

import { Label } from "@/components/ui/label"

type FieldGroupProps = {
  label: string
  htmlFor: string
  children: ReactNode
}

export function FieldGroup({ label, htmlFor, children }: FieldGroupProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

type SectionCardProps = {
  title: string
  icon: ElementType
  children: ReactNode
}

export function SectionCard({ title, icon: Icon, children }: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm dark:border-emerald-800/40 dark:bg-emerald-950/30">
      <div className="flex items-center gap-2.5 border-b border-emerald-100 px-5 py-3.5 dark:border-emerald-800/40">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
