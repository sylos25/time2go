import type { ReactNode } from "react"

import { Header } from "@/components/header"

type ProfileShellProps = {
  userName: string
  children: ReactNode
}

export function ProfileShell({ userName, children }: ProfileShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} userName={userName} />
      {children}
    </div>
  )
}
