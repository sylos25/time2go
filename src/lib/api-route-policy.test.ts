import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { extractBearerOrCookieToken, isPublicApiRoute } from "./api-route-policy"

describe("isPublicApiRoute", () => {
  it("OPTIONS siempre es público (preflight CORS)", () => {
    expect(isPublicApiRoute("OPTIONS", "/api/cualquiera")).toBe(true)
  })

  it("GET de catálogo público sin JWT", () => {
    expect(isPublicApiRoute("GET", "/api/tipo_evento")).toBe(true)
    expect(isPublicApiRoute("HEAD", "/api/municipios")).toBe(true)
    expect(isPublicApiRoute("GET", "/api/denuncias-eventos/catalogo")).toBe(true)
  })

  it("POST de login y webhooks sin JWT", () => {
    expect(isPublicApiRoute("POST", "/api/login")).toBe(true)
    expect(isPublicApiRoute("POST", "/api/wompi/webhook")).toBe(true)
  })

  it("GET /api/events y detalle público", () => {
    expect(isPublicApiRoute("GET", "/api/events")).toBe(true)
    expect(isPublicApiRoute("GET", "/api/events/abc123")).toBe(true)
  })

  it("no expone POST genérico en rutas solo-GET públicas", () => {
    expect(isPublicApiRoute("POST", "/api/tipo_evento")).toBe(false)
  })

  it("ruta privada por defecto", () => {
    expect(isPublicApiRoute("GET", "/api/me")).toBe(false)
    expect(isPublicApiRoute("POST", "/api/reservas")).toBe(false)
  })

  it("reset-password permite GET, POST y PUT", () => {
    expect(isPublicApiRoute("GET", "/api/reset-password")).toBe(true)
    expect(isPublicApiRoute("POST", "/api/reset-password")).toBe(true)
    expect(isPublicApiRoute("PUT", "/api/reset-password")).toBe(true)
  })
})

describe("extractBearerOrCookieToken", () => {
  it("usa Bearer cuando está presente", () => {
    const req = new NextRequest("http://localhost/api/me", {
      headers: { authorization: "Bearer token-desde-header" },
    })
    expect(extractBearerOrCookieToken(req)).toBe("token-desde-header")
  })

  it("sin Bearer usa cookie token", () => {
    const req = new NextRequest("http://localhost/api/me", {
      headers: { cookie: "token=abc; other=1" },
    })
    expect(extractBearerOrCookieToken(req)).toBe("abc")
  })

  it("sin token devuelve null", () => {
    const req = new NextRequest("http://localhost/api/me")
    expect(extractBearerOrCookieToken(req)).toBe(null)
  })
})
