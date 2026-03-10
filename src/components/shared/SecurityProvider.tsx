"use client"

import { useEffect } from "react"

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Si es localhost o 127.0.0.1, no aplica ninguna restricción
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.")

    if (isLocal) return

    // Bloquea clic derecho
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()

    // Bloquea F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.keyCode === 123 ||                             // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
        (e.ctrlKey && e.keyCode === 85)                  // Ctrl+U
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return <>{children}</>
}