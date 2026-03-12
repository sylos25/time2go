"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const THEME_KEY = "theme"
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

type ThemeMode = "light" | "dark"

const getSystemTheme = (): ThemeMode =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const getInitialTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "dark" || stored === "light") return stored
  return getSystemTheme()
}

const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

const persistTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_KEY, theme)
  document.cookie = `${THEME_KEY}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)
    persistTheme(initialTheme)
    setMounted(true)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemThemeChange = () => {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === "dark" || stored === "light") return
      const nextTheme = getSystemTheme()
      setTheme(nextTheme)
      applyTheme(nextTheme)
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
  }, [])

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    persistTheme(nextTheme)
    applyTheme(nextTheme)
  }

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-[120] h-11 w-11 rounded-full border border-border bg-card text-card-foreground shadow-md transition hover:scale-105"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? <Sun className="mx-auto h-5 w-5" /> : <Moon className="mx-auto h-5 w-5" />}
    </button>
  )
}
