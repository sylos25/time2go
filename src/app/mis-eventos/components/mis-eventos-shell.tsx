import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

type MisEventosShellProps = {
  children: ReactNode
}

export function MisEventosShell({ children }: MisEventosShellProps) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header onAuthClick={() => {}} />
      <div className="flex-1 w-full">{children}</div>
      <Footer />
    </main>
  )
}