import type { PropsWithChildren } from "react"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

export function TransactionsShell({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      {children}
      <Footer />
    </main>
  )
}
