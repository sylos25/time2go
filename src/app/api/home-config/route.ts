import { NextResponse } from "next/server"
import pool from "@/lib/db"

type HeroImageRow = {
  id_inicio_hero_imagen: number
  url_imagen: string
  orden: number
}

type CategoryRow = {
  id_categoria_evento: number
  nombre: string
}

type SelectedCategoryRow = {
  id_categoria_evento: number
  nombre: string
  orden: number
}

const MAX_CATEGORIES = 12

export async function GET() {
  const client = await pool.connect()
  try {
    const heroImagesRes = await client.query<HeroImageRow>(
      `SELECT id_inicio_hero_imagen, url_imagen, orden
       FROM tabla_inicio_hero_imagenes
       WHERE activo = TRUE
       ORDER BY orden ASC, id_inicio_hero_imagen ASC`
    )

    const selectedCategoriesRes = await client.query<SelectedCategoryRow>(
      `SELECT ic.id_categoria_evento, ce.nombre, ic.orden
       FROM tabla_inicio_categorias ic
       INNER JOIN tabla_categoria_eventos ce ON ce.id_categoria_evento = ic.id_categoria_evento
       WHERE ic.activo = TRUE
       ORDER BY ic.orden ASC, ic.id_inicio_categoria ASC`
    )

    const selectedCategoryIds = selectedCategoriesRes.rows
      .map((row) => Number(row.id_categoria_evento))
      .slice(0, MAX_CATEGORIES)

    const categoriesRes = await client.query<CategoryRow>(
      "SELECT id_categoria_evento, nombre FROM tabla_categoria_eventos ORDER BY nombre ASC"
    )

    const categoriesById = new Map(categoriesRes.rows.map((row) => [Number(row.id_categoria_evento), String(row.nombre)]))

    const selectedCategories = selectedCategoryIds
      .map((id) => ({ id, nombre: categoriesById.get(id) || "" }))
      .filter((category) => category.nombre.length > 0)

    return NextResponse.json({
      ok: true,
      selectedCategoryIds,
      selectedCategories,
      heroImages: heroImagesRes.rows.map((row) => ({
        id: Number(row.id_inicio_hero_imagen),
        url: String(row.url_imagen),
        order: Number(row.orden),
      })),
    })
  } catch (error) {
    console.error("/api/home-config GET error:", error)
    return NextResponse.json({ ok: false, message: "Error del servidor" }, { status: 500 })
  } finally {
    client.release()
  }
}
