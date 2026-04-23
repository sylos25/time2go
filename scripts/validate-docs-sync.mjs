/**
 * Valida coherencia entre:
 * - Rutas /api/ declaradas en src/lib/api-route-policy.ts (subcadenas en docs)
 * - Nombres de variables en .env.example vs. comentario env-inventory en docs/DOCUMENTACION-TECNICA-COMPLETA.md
 * - Referencia a .env.example en documentación
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8")
}

function listMarkdownDocs() {
  const docDir = path.join(root, "docs")
  const out = []
  if (!fs.existsSync(docDir)) return out
  for (const name of fs.readdirSync(docDir)) {
    if (name.endsWith(".md")) out.push(path.join("docs", name))
  }
  return out
}

function parsePolicyApiPaths(policySrc) {
  const set = new Set()
  const re = /["'](\/api\/[a-zA-Z0-9_\-/.]+)["']/g
  let m
  while ((m = re.exec(policySrc))) {
    set.add(m[1])
  }
  return [...set]
}

function parseEnvVarNames(envExample) {
  const set = new Set()
  for (const line of envExample.split("\n")) {
    const re = /\b([A-Z][A-Z0-9_]*)\s*=/g
    let m
    while ((m = re.exec(line))) {
      set.add(m[1])
    }
  }
  return [...set].sort()
}

function parseDocEnvInventory(docsTecnica) {
  const m = docsTecnica.match(/<!--\s*env-inventory:\s*([^>]+?)\s*-->/)
  if (!m) return null
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
}

function main() {
  const policySrc = readText("src/lib/api-route-policy.ts")
  const envExample = readText(".env.example")
  const docPaths = listMarkdownDocs()
  if (docPaths.length === 0) {
    console.error("validate-docs-sync: no se encontró docs/*.md")
    process.exit(1)
  }

  const combinedDocs = docPaths
    .map((rel) => readText(rel))
    .join("\n\n")
  if (!combinedDocs.includes(".env.example")) {
    console.error("validate-docs-sync: la documentación debe referenciar `.env.example` al menos una vez")
    process.exit(1)
  }

  const apiPaths = parsePolicyApiPaths(policySrc)
  const missingPaths = []
  for (const p of apiPaths) {
    if (!combinedDocs.includes(p)) {
      missingPaths.push(p)
    }
  }
  if (missingPaths.length) {
    console.error("validate-docs-sync: rutas de api-route-policy no mencionadas en docs/*.md:")
    for (const p of missingPaths) console.error(`  - ${p}`)
    process.exit(1)
  }

  const dynamicOk =
    combinedDocs.includes("/api/organizador") &&
    combinedDocs.includes("valoraciones") &&
    combinedDocs.includes("/api/events") &&
    (combinedDocs.includes("image") || combinedDocs.includes("`image`")) &&
    (combinedDocs.includes("document") || combinedDocs.includes("`document`"))
  if (!dynamicOk) {
    console.error(
      "validate-docs-sync: falta descripción de rutas dinámicas públicas (organizador, /api/events, valoraciones, image/document) en docs"
    )
    process.exit(1)
  }

  const tecnica = readText("docs/DOCUMENTACION-TECNICA-COMPLETA.md")
  const fromEnv = parseEnvVarNames(envExample)
  const fromDoc = parseDocEnvInventory(tecnica)
  if (!fromDoc) {
    console.error("validate-docs-sync: falta comentario <!-- env-inventory: ... --> en DOCUMENTACION-TECNICA-COMPLETA.md")
    process.exit(1)
  }
  if (fromEnv.length !== fromDoc.length || fromEnv.some((k, i) => k !== fromDoc[i])) {
    console.error("validate-docs-sync: env-inventory desincronizado. Esperado (desde .env.example):")
    console.error(fromEnv.join(","))
    console.error("En documento:")
    console.error(fromDoc.join(","))
    process.exit(1)
  }

  console.log("validate-docs-sync: OK (policy API paths, .env names, doc inventory)")
}

main()
