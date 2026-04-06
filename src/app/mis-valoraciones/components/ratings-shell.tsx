import type { ReactNode } from "react"

import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

type RatingsShellProps = {
  children: ReactNode
  authModalOpen: boolean
  isLogin: boolean
  onAuthClick: (loginMode?: boolean) => void
  onCloseAuth: () => void
  onToggleAuthMode: () => void
}

export function RatingsShell({
  children,
  authModalOpen,
  isLogin,
  onAuthClick,
  onCloseAuth,
  onToggleAuthMode,
}: RatingsShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onAuthClick={onAuthClick} />
      {children}
      <Footer />
      <AuthModal
        isOpen={authModalOpen}
        onClose={onCloseAuth}
        isLogin={isLogin}
        onToggleMode={onToggleAuthMode}
      />
    </div>
  )
}
