import { redirect } from "next/navigation"

type SearchParams = Record<string, string | string[] | undefined>

type EpaycoResponsePageProps = {
  searchParams?: Promise<SearchParams>
}

function firstValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return null
}

export default async function EpaycoResponsePage({ searchParams }: EpaycoResponsePageProps) {
  const resolvedSearchParams = (await searchParams) || {}
  const perfilParams = new URLSearchParams()

  perfilParams.set("pago", "resultado")

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    const normalizedValue = firstValue(value)
    if (normalizedValue) {
      perfilParams.set(key, normalizedValue)
    }
  }

  redirect(`/perfil?${perfilParams.toString()}`)
}