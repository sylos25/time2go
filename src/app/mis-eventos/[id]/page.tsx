"use client"

import { MyEventOpeningState } from "@/app/mis-eventos/components/my-event-opening-state"
import { MisEventosShell } from "@/app/mis-eventos/components/mis-eventos-shell"
import { useMyEventRedirect } from "@/app/mis-eventos/[id]/hooks/use-my-event-redirect"

export default function MisEventosRedirectPage() {
  useMyEventRedirect()

  return (
    <MisEventosShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="h-[40vh] flex items-center justify-center">
          <MyEventOpeningState />
        </div>
      </div>
    </MisEventosShell>
  )
}
