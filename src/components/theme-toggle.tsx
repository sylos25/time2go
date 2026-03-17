"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

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
  document.documentElement.classList.toggle("dark", theme === "dark")
}

type ThemeToggleProps = {
  inline?: boolean
}

export function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("light")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

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
    window.dispatchEvent(new Event("themechange"))
  }

  if (!mounted) return null

  if (!inline && pathname?.startsWith("/dashboard")) {
    return null
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "h-11 w-11 rounded-full border transition hover:scale-105",
        inline 
          ? "border-white/40 bg-white/20 text-white hover:bg-white/30 dark:border-green-800 dark:bg-green-800/40 dark:text-green-100 dark:hover:bg-green-700/50"
          : "fixed bottom-4 right-4 z-[120] border-border bg-card text-card-foreground shadow-md"
      )}
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? <Sun className="mx-auto h-5 w-5" /> : <Moon className="mx-auto h-5 w-5" />}
    </button>
  )
}
