import { ChartNoAxesColumn } from "lucide-react"

type PlanesOrganizadorHeroProps = {
  summaryText: string
}

export function PlanesOrganizadorHero({ summaryText }: PlanesOrganizadorHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-green-700/30 bg-green-600 px-4 py-6 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-900 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/20" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-emerald-500/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white dark:text-lime-200 sm:text-4xl">
            <ChartNoAxesColumn className="h-7 w-7" />
            Planes y Suscripciones de Organizador
          </h3>
          <p className="mt-2 text-sm text-green-100 dark:text-emerald-100/90">{summaryText}</p>
        </div>
      </div>
    </section>
  )
}
