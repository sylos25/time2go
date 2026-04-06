import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useResetPasswordPage } from "./use-reset-password-page"

function buildJsonResponse(data: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

describe("useResetPasswordPage", () => {
  const push = vi.fn()
  const router = { push }

  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("marca error cuando no existe token", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")

    const { result } = renderHook(() => useResetPasswordPage("", router as never))

    await waitFor(() => expect(result.current.loadingToken).toBe(false))

    expect(result.current.tokenError).toBe("El enlace de recuperación no es válido")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("valida token correctamente", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input)
        if (url === "/api/reset-password?token=token-123") {
          return buildJsonResponse({ message: "token válido" })
        }
        throw new Error(`Unexpected fetch call: ${url}`)
      })

    const { result } = renderHook(() => useResetPasswordPage("token-123", router as never))

    await waitFor(() => expect(result.current.loadingToken).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith("/api/reset-password?token=token-123")
    expect(result.current.tokenError).toBeNull()
  })

  it("muestra error cuando las contraseñas no coinciden", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input)
      if (url === "/api/reset-password?token=token-123") {
        return buildJsonResponse({ message: "token válido" })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const { result } = renderHook(() => useResetPasswordPage("token-123", router as never))
    await waitFor(() => expect(result.current.loadingToken).toBe(false))

    act(() => {
      result.current.setNewPassword("Nueva123!")
      result.current.setConfirmPassword("Otra123!")
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(result.current.error).toBe("Las contraseñas no coinciden")
  })

  it("envía reset, limpia campos y redirige a auth en éxito", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input)
      if (url === "/api/reset-password?token=token-123") {
        return buildJsonResponse({ message: "token válido" })
      }
      if (url === "/api/reset-password") {
        return buildJsonResponse({ message: "ok" })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const { result } = renderHook(() => useResetPasswordPage("token-123", router as never))
    await waitFor(() => expect(result.current.loadingToken).toBe(false))

  vi.useFakeTimers()

    act(() => {
      result.current.setNewPassword("Nueva123!")
      result.current.setConfirmPassword("Nueva123!")
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(fetchMock).toHaveBeenLastCalledWith("/api/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "token-123",
        newPassword: "Nueva123!",
        confirmPassword: "Nueva123!",
      }),
    })

    expect(result.current.success).toBe("ok")
    expect(result.current.newPassword).toBe("")
    expect(result.current.confirmPassword).toBe("")

    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(push).toHaveBeenCalledWith("/auth")
  })
})
