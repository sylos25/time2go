import { DashboardSectionHero } from "@/components/dashboard/shared/dashboard-section-hero"

type PlanesOrganizadorHeroProps = {
  summaryText: string
}

export function PlanesOrganizadorHero({ summaryText }: PlanesOrganizadorHeroProps) {
  return (
    <DashboardSectionHero
      title="Planes y Suscripciones"
      subtitle={summaryText}
    />
  )
}
