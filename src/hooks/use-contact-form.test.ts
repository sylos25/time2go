import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useContactForm } from "./use-contact-form"

function buildJsonResponse(data: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

describe("useContactForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("envía mensaje correctamente y limpia el formulario", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      buildJsonResponse({ message: "ok" })
    )

    const { result } = renderHook(() => useContactForm())

    act(() => {
      result.current.handleInputChange("name", "Ana")
      result.current.handleInputChange("email", "ana@email.com")
      result.current.handleInputChange("subject", "Consulta")
      result.current.handleInputChange("message", "Hola")
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(fetchMock).toHaveBeenCalledWith("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Ana",
        email: "ana@email.com",
        subject: "Consulta",
        message: "Hola",
      }),
    })

    expect(result.current.submitFeedback).toEqual({
      type: "success",
      message: "Tu mensaje fue enviado correctamente. Te responderemos pronto.",
    })
    expect(result.current.formData).toEqual({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
    expect(result.current.sending).toBe(false)
  })

  it("retorna feedback de error cuando la API responde no-ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      buildJsonResponse({ error: "Fallo de validación" }, { ok: false, status: 400 })
    )

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(result.current.submitFeedback).toEqual({
      type: "error",
      message: "Fallo de validación",
    })
    expect(result.current.sending).toBe(false)
  })

  it("retorna error de red cuando fetch lanza excepción", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network down"))

    const { result } = renderHook(() => useContactForm())

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(result.current.submitFeedback).toEqual({
      type: "error",
      message: "Error de red. Verifica tu conexión e intenta nuevamente.",
    })
    expect(result.current.sending).toBe(false)
  })
})
