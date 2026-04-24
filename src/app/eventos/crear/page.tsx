"use client"

import { useRef, useState } from "react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { CreateEventPageContent } from "../../../components/events/create-event/create-event-page-content"
import { useCreateEventForm } from "@/hooks/use-create-event-form"

export default function CrearEventoPage() {
  const form = useCreateEventForm()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [createSiteModalOpen, setCreateSiteModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={true} />
      <CreateEventPageContent
        form={form}
        imageInputRef={imageInputRef}
        createSiteModalOpen={createSiteModalOpen}
        setCreateSiteModalOpen={setCreateSiteModalOpen}
        backHref="/eventos"
        homeHref="/"
        eventsHref="/eventos"
      />
      <Footer />
    </div>
  )
}
