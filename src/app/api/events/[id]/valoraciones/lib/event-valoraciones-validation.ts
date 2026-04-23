const TEXT_WITH_PUNCT_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ .,;:()"'¿?¡!\-_\/\n\r]+$/

export function parseEventId(value: string): number | null {
  const eventId = Number(value)
  return Number.isFinite(eventId) && eventId > 0 ? eventId : null
}

export function parseValoracion(value: unknown): number | null {
  const valoracion = Number(value)
  return Number.isInteger(valoracion) && valoracion >= 1 && valoracion <= 5 ? valoracion : null
}

export function normalizeComentario(value: unknown): string | null {
  const comentarioRaw = typeof value === "string" ? value.trim() : ""
  return comentarioRaw.length > 0 ? comentarioRaw : null
}

export function validateComentario(comentario: string | null): string | null {
  if (comentario && comentario.length > 1000) {
    return "El comentario no puede superar 1000 caracteres"
  }

  if (comentario && !TEXT_WITH_PUNCT_REGEX.test(comentario)) {
    return "El comentario solo permite letras, números y signos de puntuación permitidos"
  }

  return null
}

export function parseValoracionId(value: unknown): number | null {
  const idValoracion = Number(value)
  return Number.isFinite(idValoracion) && idValoracion > 0 ? idValoracion : null
}
