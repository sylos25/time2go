export type HeroImage = {
  id: number
  url: string
  order: number
}

export type CategoryOption = {
  id: number
  nombre: string
}

export type HomeControlResponse = {
  ok: boolean
  selectedCategoryIds: number[]
  categories: CategoryOption[]
  heroImages: HeroImage[]
  maxHeroImages: number
  message?: string
}

export type MoveDirection = "up" | "down"
