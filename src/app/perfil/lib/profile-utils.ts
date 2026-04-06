import type { UserData } from "@/app/perfil/lib/profile-types"

export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024

export function getAuthToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("token") ?? ""
}

export function clearSessionStorageValues() {
  if (typeof window === "undefined") return

  localStorage.removeItem("token")
  localStorage.removeItem("userName")
  localStorage.removeItem("userPublicId")
}

export function getOrganizerPriceCOP(): number {
  return Number(
    process.env.NEXT_PUBLIC_ORGANIZADOR_PRICE_COP ??
      process.env.NEXT_PUBLIC_PROMOTOR_PRICE_COP ??
      "50000"
  )
}

export function formatOrganizerPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function validatePdfFile(file: File | null): string | null {
  if (!file) return null

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!isPdf) return "Solo se permite formato PDF"

  if (file.size > MAX_PDF_SIZE_BYTES) return "El archivo supera el maximo de 5 MB"

  return null
}

export function getProfileSuccessMessageFromUrl(): string | null {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  if (params.get("pago") !== "resultado") return null

  window.history.replaceState({}, "", "/perfil")
  return "Pago recibido. Tu rol de Organizador se activara en breve. Si no cambia en unos minutos, recarga la pagina."
}

export function getDisplayUserName(user: UserData | null): string {
  if (!user) return "Usuario"
  return user.nombres || "Usuario"
}