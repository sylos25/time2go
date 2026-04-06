"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RefreshCw, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Diferencia outer/inner típica con DevTools acoplado; un poco alta para reducir falsos positivos. */
const DEVTOOLS_THRESHOLD_PX = 180
/** Tiempo sostenido antes de mostrar la capa (evita parpadeos al redimensionar). */
const BLOCK_AFTER_SECONDS = 2.5
const CHECK_INTERVAL_MS = 400
const INIT_DELAY_MS = 800

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

function isDevToolsShortcut(e: KeyboardEvent): boolean {
  if (e.code === "F12") return true
  if (e.ctrlKey && e.shiftKey && (e.code === "KeyI" || e.code === "KeyJ" || e.code === "KeyC")) {
    return true
  }
  if (e.metaKey && e.altKey && (e.code === "KeyI" || e.code === "KeyJ")) {
    return true
  }
  return false
}

function checkDevToolsOpenBySize(): boolean {
  const widthDiff = window.outerWidth - window.innerWidth
  const heightDiff = window.outerHeight - window.innerHeight
  return widthDiff > DEVTOOLS_THRESHOLD_PX || heightDiff > DEVTOOLS_THRESHOLD_PX
}

function DevToolsBlocker({ onRecheck }: { onRecheck: () => void }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="security-overlay-title"
      aria-describedby="security-overlay-desc"
      className="fixed inset-0 z-999999 flex flex-col items-center justify-center bg-linear-to-br from-green-950 via-slate-950 to-emerald-950 px-6 py-10 text-center"
    >
      <div className="mb-6 rounded-2xl bg-white/5 p-5 ring-1 ring-lime-400/25 shadow-lg shadow-black/20">
        <ShieldAlert className="mx-auto size-14 text-lime-400" aria-hidden />
      </div>
      <h1
        id="security-overlay-title"
        className="mb-3 max-w-md text-balance text-2xl font-bold tracking-tight text-white"
      >
        Panel de desarrollo detectado
      </h1>
      <p
        id="security-overlay-desc"
        className="mb-2 max-w-md text-pretty text-sm leading-relaxed text-slate-300"
      >
        Cierra las herramientas de desarrollador del navegador (inspector) para seguir usando Time2Go con normalidad.
      </p>
      <p className="mb-8 max-w-md text-pretty text-xs leading-relaxed text-slate-500">
        Si no las abriste tú, suele ser un falso positivo: maximiza la ventana, reduce barras laterales o extensiones que
        estrechan la página, y pulsa &quot;Verificar de nuevo&quot;.
      </p>
      <Button
        type="button"
        variant="outline"
        className="border-lime-500/40 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        onClick={onRecheck}
      >
        <RefreshCw className="size-4" aria-hidden />
        Verificar de nuevo
      </Button>
    </div>
  )
}

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false)
  const secondsRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  const evaluate = useCallback(() => {
    if (checkDevToolsOpenBySize()) {
      secondsRef.current += CHECK_INTERVAL_MS / 1000
      if (secondsRef.current >= BLOCK_AFTER_SECONDS) {
        setBlocked(true)
      }
    } else {
      secondsRef.current = 0
      setBlocked(false)
    }
  }, [])

  const handleRecheck = useCallback(() => {
    secondsRef.current = 0
    if (checkDevToolsOpenBySize()) {
      secondsRef.current = BLOCK_AFTER_SECONDS
      setBlocked(true)
    } else {
      setBlocked(false)
    }
  }, [])

  useEffect(() => {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.")

    if (isLocal) return

    let disposed = false
    let cleanupListeners: (() => void) | undefined

    const initTimeout = window.setTimeout(() => {
      if (disposed) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (isTypingTarget(e.target)) return
        if (!isDevToolsShortcut(e)) return
        e.preventDefault()
        e.stopPropagation()
      }

      const bumpOnResize = () => {
        if (checkDevToolsOpenBySize()) {
          secondsRef.current += 0.5
          if (secondsRef.current >= BLOCK_AFTER_SECONDS) {
            setBlocked(true)
          }
        } else {
          secondsRef.current = 0
          setBlocked(false)
        }
      }

      document.addEventListener("keydown", handleKeyDown, true)
      window.addEventListener("resize", bumpOnResize)
      intervalRef.current = window.setInterval(evaluate, CHECK_INTERVAL_MS)

      cleanupListeners = () => {
        document.removeEventListener("keydown", handleKeyDown, true)
        window.removeEventListener("resize", bumpOnResize)
        if (intervalRef.current != null) {
          window.clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, INIT_DELAY_MS)

    return () => {
      disposed = true
      window.clearTimeout(initTimeout)
      cleanupListeners?.()
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [evaluate])

  return (
    <>
      {blocked ? <DevToolsBlocker onRecheck={handleRecheck} /> : null}
      {children}
    </>
  )
}
