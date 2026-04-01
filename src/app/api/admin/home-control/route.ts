import { NextResponse } from "next/server"
import { type PoolClient } from "pg"
import pool from "@/lib/db"
import { checkUserPermission, PERMISSION_IDS } from "@/lib/permissions"
import { uploadImageBuffer } from "@/lib/document-storage"

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

const MAX_HERO_IMAGES = 7
const MAX_CATEGORIES = 12

function normalizeIdList(value: unknown, maxItems: number) {
	if (!Array.isArray(value)) return []
	const ids = value
		.map((item) => Number(item))
		.filter((id) => Number.isInteger(id) && id > 0)
	const unique = Array.from(new Set(ids))
	return unique.slice(0, maxItems)
}

async function buildResponsePayload(client: PoolClient) {
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

	const selectedCategoryIds = selectedCategoriesRes.rows.map((row) => Number(row.id_categoria_evento))

	const categoriesRes = await client.query<CategoryRow>(
		"SELECT id_categoria_evento, nombre FROM tabla_categoria_eventos ORDER BY nombre ASC"
	)

	const selectedCategories = selectedCategoriesRes.rows.map((row) => ({
		id: Number(row.id_categoria_evento),
		nombre: String(row.nombre),
	}))

	return {
		ok: true,
		selectedCategoryIds,
		selectedCategories,
		categories: categoriesRes.rows.map((row) => ({
			id: Number(row.id_categoria_evento),
			nombre: String(row.nombre),
		})),
		heroImages: heroImagesRes.rows.map((row) => ({
			id: Number(row.id_inicio_hero_imagen),
			url: String(row.url_imagen),
			order: Number(row.orden),
		})),
		maxHeroImages: MAX_HERO_IMAGES,
	}
}

async function ensureAuthorized(req: Request) {
	const permission = await checkUserPermission(req, PERMISSION_IDS.GESTIONAR_EVENTOS)
	if (!permission.hasAccess) {
		return NextResponse.json(
			{ ok: false, message: permission.error || "No autorizado" },
			{ status: permission.error?.includes("autenticado") ? 401 : 403 }
		)
	}
	return null
}

export async function GET(req: Request) {
	const unauthorized = await ensureAuthorized(req)
	if (unauthorized) return unauthorized

	const client = await pool.connect()
	try {
		const payload = await buildResponsePayload(client)
		return NextResponse.json(payload)
	} catch (error) {
		console.error("/api/admin/home-control GET error:", error)
		return NextResponse.json({ ok: false, message: "Error del servidor" }, { status: 500 })
	} finally {
		client.release()
	}
}

export async function POST(req: Request) {
	const unauthorized = await ensureAuthorized(req)
	if (unauthorized) return unauthorized

	const client = await pool.connect()
	try {
		const formData = await req.formData()

		const selectedCategoryIds = normalizeIdList(
			JSON.parse(String(formData.get("categoryIds") || "[]")),
			MAX_CATEGORIES
		)

		const removeImageIds = normalizeIdList(
			JSON.parse(String(formData.get("removeImageIds") || "[]")),
			MAX_HERO_IMAGES
		)

		const retainedOrderIds = normalizeIdList(
			JSON.parse(String(formData.get("retainedOrderIds") || "[]")),
			MAX_HERO_IMAGES
		)

		const newImages = formData
			.getAll("newHeroImages")
			.filter((value) => value instanceof File && value.size > 0) as File[]

		for (const file of newImages) {
			const mimeType = String(file.type || "")
			if (!mimeType.startsWith("image/")) {
				return NextResponse.json(
					{ ok: false, message: "Solo se permiten archivos de imagen para el hero" },
					{ status: 400 }
				)
			}
		}

		await client.query("BEGIN")

		const activeImagesRes = await client.query<HeroImageRow>(
			`SELECT id_inicio_hero_imagen, url_imagen, orden
			 FROM tabla_inicio_hero_imagenes
			 WHERE activo = TRUE
			 ORDER BY orden ASC, id_inicio_hero_imagen ASC`
		)

		const retainedImages = activeImagesRes.rows.filter(
			(image) => !removeImageIds.includes(Number(image.id_inicio_hero_imagen))
		)

		// Sort retained images by the order sent from the frontend, falling back to DB order
		const sortedRetainedImages =
			retainedOrderIds.length > 0
				? [...retainedImages].sort((a, b) => {
						const posA = retainedOrderIds.indexOf(Number(a.id_inicio_hero_imagen))
						const posB = retainedOrderIds.indexOf(Number(b.id_inicio_hero_imagen))
						return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB)
				  })
				: retainedImages

		if (retainedImages.length + newImages.length > MAX_HERO_IMAGES) {
			await client.query("ROLLBACK")
			return NextResponse.json(
				{
					ok: false,
					message: `Solo puedes tener hasta ${MAX_HERO_IMAGES} imágenes activas en el hero`,
				},
				{ status: 400 }
			)
		}

		if (removeImageIds.length > 0) {
			await client.query(
				`UPDATE tabla_inicio_hero_imagenes
				 SET activo = FALSE, fecha_actualizacion = CURRENT_TIMESTAMP
				 WHERE id_inicio_hero_imagen = ANY($1::int[])`,
				[removeImageIds]
			)
		}

		const validCategoriesRes = await client.query<{ id_categoria_evento: number }>(
			`SELECT id_categoria_evento
			 FROM tabla_categoria_eventos
			 WHERE id_categoria_evento = ANY($1::int[])`,
			[selectedCategoryIds]
		)

		const validCategoryIds = validCategoriesRes.rows.map((row) => Number(row.id_categoria_evento))

		if (validCategoryIds.length > 0) {
			await client.query(
				`UPDATE tabla_inicio_categorias
				 SET activo = FALSE,
						 fecha_actualizacion = CURRENT_TIMESTAMP
				 WHERE id_categoria_evento <> ALL($1::int[])`,
				[validCategoryIds]
			)
		} else {
			await client.query(
				`UPDATE tabla_inicio_categorias
				 SET activo = FALSE,
						 fecha_actualizacion = CURRENT_TIMESTAMP`
			)
		}

		let categoryOrder = 1
		for (const categoryId of validCategoryIds) {
			await client.query(
				`INSERT INTO tabla_inicio_categorias (id_categoria_evento, orden, activo)
				 VALUES ($1, $2, TRUE)
				 ON CONFLICT (id_categoria_evento)
				 DO UPDATE SET
					 orden = EXCLUDED.orden,
					 activo = TRUE,
					 fecha_actualizacion = CURRENT_TIMESTAMP`,
				[categoryId, categoryOrder]
			)
			categoryOrder += 1
		}

		let orderCounter = 1
		for (const image of sortedRetainedImages) {
			await client.query(
				`UPDATE tabla_inicio_hero_imagenes
				 SET orden = $1,
						 fecha_actualizacion = CURRENT_TIMESTAMP
				 WHERE id_inicio_hero_imagen = $2`,
				[orderCounter, Number(image.id_inicio_hero_imagen)]
			)
			orderCounter += 1
		}

		for (const file of newImages) {
			const buffer = Buffer.from(await file.arrayBuffer())
			const uploadResult = await uploadImageBuffer({
				buffer,
				contentType: String(file.type || "image/jpeg"),
				originalFileName: String(file.name || "hero-image.jpg"),
				eventId: "landing-home",
			})

			const imageUrl =
				uploadResult.publicUrl || `/api/events/image?key=${encodeURIComponent(uploadResult.storageKey)}`

			await client.query(
				`INSERT INTO tabla_inicio_hero_imagenes (
					url_imagen,
					storage_provider,
					storage_key,
					mime_type,
					bytes,
					original_filename,
					orden,
					activo
				) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
				[
					imageUrl,
					uploadResult.provider,
					uploadResult.storageKey,
					uploadResult.mimeType,
					uploadResult.sizeBytes,
					uploadResult.originalFileName,
					orderCounter,
				]
			)

			orderCounter += 1
		}

		await client.query("COMMIT")

		const payload = await buildResponsePayload(client)
		return NextResponse.json(payload)
	} catch (error) {
		await client.query("ROLLBACK")
		console.error("/api/admin/home-control POST error:", error)
		return NextResponse.json({ ok: false, message: "No fue posible guardar los cambios" }, { status: 500 })
	} finally {
		client.release()
	}
}
