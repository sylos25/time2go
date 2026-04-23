import type { HeroImage, HomeControlResponse, MoveDirection } from "./types"

export const CATEGORIES_PER_PAGE = 10
export const CATEGORY_PAGE_WINDOW = 5
export const CATEGORY_SEARCH_MAX_LENGTH = 50

export const EMPTY_HOME_CONTROL_RESPONSE: HomeControlResponse = {
  ok: false,
  selectedCategoryIds: [],
  categories: [],
  heroImages: [],
  maxHeroImages: 7,
}

export const CATEGORY_SEARCH_INPUT_CLASS =
  "w-full max-w-3xl rounded-lg border border-lime-300/80 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-emerald-600/70 dark:bg-emerald-950/40 dark:text-emerald-100 dark:placeholder-emerald-400/60"

export const PAGINATION_BUTTON_CLASS =
  "rounded-md border border-lime-300/80 px-2 py-1 text-xs text-green-800 hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-600/70 dark:text-emerald-200 dark:hover:bg-emerald-900/30"

export function sanitizeCategorySearchQuery(value: string): string {
  return value
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, CATEGORY_SEARCH_MAX_LENGTH)
}

export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function getAuthHeaders(): HeadersInit {
  return {}
}

export async function parseHomeControlResponse(response: Response): Promise<HomeControlResponse> {
  return response.json().catch(() => EMPTY_HOME_CONTROL_RESPONSE)
}

export function swapItems<T>(items: T[], firstIndex: number, secondIndex: number): T[] {
  const nextItems = [...items]
  ;[nextItems[firstIndex], nextItems[secondIndex]] = [nextItems[secondIndex], nextItems[firstIndex]]
  return nextItems
}

export function reorderHeroImages(images: HeroImage[], id: number, direction: MoveDirection): HeroImage[] {
  const currentIndex = images.findIndex((image) => image.id === id)
  if (currentIndex === -1) return images

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= images.length) return images

  return swapItems(images, currentIndex, targetIndex).map((image, index) => ({
    ...image,
    order: index + 1,
  }))
}

export function buildVisiblePageWindow(currentPage: number, totalPages: number): number[] {
  let start = Math.max(1, currentPage - 2)
  let end = Math.min(totalPages, start + CATEGORY_PAGE_WINDOW - 1)
  start = Math.max(1, end - CATEGORY_PAGE_WINDOW + 1)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
