/**
 * Compatibilidad: usar /api/organizador-document. Misma lógica.
 * `runtime` debe declararse en este archivo (Next no permite reexportarlo).
 */
export const runtime = "nodejs"

export { POST } from "../organizador-document/route"
