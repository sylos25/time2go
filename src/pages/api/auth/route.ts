import { getAuth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import type { NextApiRequest, NextApiResponse } from "next"

function createHandler() {
  return toNextJsHandler(getAuth())
}

export async function GET(req: Request) {
  const handler = createHandler()
  if (typeof handler.GET !== "function") {
    return new Response("Method Not Allowed", { status: 405 })
  }
  return handler.GET(req)
}

export async function POST(req: Request) {
  const handler = createHandler()
  if (typeof handler.POST !== "function") {
    return new Response("Method Not Allowed", { status: 405 })
  }
  return handler.POST(req)
}

// Add a default export for pages/api compatibility: delegate to appropriate method
export default async function handlerDefault(req: NextApiRequest, res: NextApiResponse) {
  const handler = createHandler()
  const method = (req.method || "").toUpperCase()

  // Build a web Request object to pass to the handler returned by toNextJsHandler
  const host = (req.headers && (req.headers.host as string)) || "localhost"
  const url = `http://${host}${req.url || "/"}`
  const body = req.method && req.method !== "GET" ? JSON.stringify(req.body) : undefined
  const webReq = new Request(url, { method: req.method as string, headers: req.headers as any, body })

  if (method === "GET" && typeof handler.GET === "function") {
    const r = await handler.GET(webReq)
    const text = await r.text()
    r.headers.forEach((v, k) => res.setHeader(k, v))
    res.status((r as Response).status || 200).send(text)
    return
  }

  if (method === "POST" && typeof handler.POST === "function") {
    const r = await handler.POST(webReq)
    const text = await r.text()
    r.headers.forEach((v, k) => res.setHeader(k, v))
    res.status((r as Response).status || 200).send(text)
    return
  }

  res.status(405).end("Method Not Allowed")
}