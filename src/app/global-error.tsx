"use client"

import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body>
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-green-950/95 p-8 text-center shadow-lg dark:bg-green-950">
            <div className="mx-auto mb-6 relative h-28 w-80 sm:h-32 sm:w-96">
              <Image
                src="/images/logo_header.png"
                alt="Time2Go"
                fill
                priority
                className="object-contain"
              />
            </div>

            <p className="text-sm font-semibold tracking-wide text-red-700 dark:text-red-400">SERVICIO NO DISPONIBLE</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Tenemos un problema en el sistema</h1>
            <p className="mt-3 text-emerald-100/90">Estamos trabajando para restablecer el servicio. Puedes intentar nuevamente.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={reset} className="bg-green-700 text-white hover:bg-green-800">
                Reintentar
              </Button>
              <Button asChild variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
                <Link href="/">Ir al inicio</Link>
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
