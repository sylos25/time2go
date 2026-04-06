import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useChangePasswordPage } from "./use-change-password-page"

function buildJsonResponse(data: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

describe("useChangePasswordPage", () => {
  const push = vi.fn()
  const router = { push }

  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockReset()
    localStorage.clear()
    localStorage.setItem("token", "jwt-token")
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("carga datos de usuario al montar", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input)
        if (url === "/api/me") {
          return buildJsonResponse({ ok: true, user: { nombres: "Ana", apellidos: "Perez" } })
        }
        throw new Error(`Unexpected fetch call: ${url}`)
      })

    const { result } = renderHook(() => useChangePasswordPage(router as never))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).toHaveBeenCalledWith("/api/me", {
      headers: { Authorization: "Bearer jwt-token" },
    })
    expect(result.current.user?.nombres).toBe("Ana")
    expect(result.current.error).toBeNull()
  })

  it("redirige a auth cuando /api/me responde 401", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input)
      if (url === "/api/me") {
        return buildJsonResponse({}, { ok: false, status: 401 })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const { result } = renderHook(() => useChangePasswordPage(router as never))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(push).toHaveBeenCalledWith("/auth")
  })

  it("muestra error cuando las contraseñas nuevas no coinciden", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input)
      if (url === "/api/me") {
        return buildJsonResponse({ ok: true, user: { nombres: "Ana", apellidos: "Perez" } })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const { result } = renderHook(() => useChangePasswordPage(router as never))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setCurrentPassword("Actual123!")
      result.current.setNewPassword("Nueva123!")
      result.current.setConfirmPassword("Diferente123!")
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(result.current.passwordError).toBe("Las contraseñas nuevas no coinciden")
  })

  it("envía el cambio de contraseña y limpia estado en éxito", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input)
      if (url === "/api/me") {
        return buildJsonResponse({ ok: true, user: { nombres: "Ana", apellidos: "Perez" } })
      }
      if (url === "/api/change-password") {
        return buildJsonResponse({ message: "ok" })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const { result } = renderHook(() => useChangePasswordPage(router as never))
    await waitFor(() => expect(result.current.loading).toBe(false))

  vi.useFakeTimers()

    act(() => {
      result.current.setCurrentPassword("Actual123!")
      result.current.setNewPassword("Nueva123!")
      result.current.setConfirmPassword("Nueva123!")
    })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    expect(fetchMock).toHaveBeenLastCalledWith("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer jwt-token",
      },
      body: JSON.stringify({
        currentPassword: "Actual123!",
        newPassword: "Nueva123!",
        confirmPassword: "Nueva123!",
      }),
    })

    expect(result.current.successMessage).toBe("Contraseña actualizada correctamente")
    expect(result.current.currentPassword).toBe("")
    expect(result.current.newPassword).toBe("")
    expect(result.current.confirmPassword).toBe("")

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.successMessage).toBeNull()
  })
})
