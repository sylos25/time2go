import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./button"

describe("Button", () => {
  it("renderiza hijos accesibles y dispara onClick", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continuar</Button>)
    const btn = screen.getByRole("button", { name: "Continuar" })
    expect(btn).toBeEnabled()
    await user.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
