import type { ReactNode } from "react"

import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

type FavoritesShellProps = {
  children: ReactNode
  authModalOpen: boolean
  isLogin: boolean
  onCloseAuth: () => void
  onToggleAuthMode: () => void
}

export function FavoritesShell({
  children,
  authModalOpen,
  isLogin,
  onCloseAuth,
  onToggleAuthMode,
}: FavoritesShellProps) {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header />
      {children}
      <Footer />
      <AuthModal
        isOpen={authModalOpen}
        onClose={onCloseAuth}
        isLogin={isLogin}
        onToggleMode={onToggleAuthMode}
      />
    </main>
  )
}