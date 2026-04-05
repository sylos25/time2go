"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { CreateEventPageContent } from "../../../components/events/create-event/create-event-page-content"
import { useCreateEventForm } from "@/hooks/use-create-event-form"

export default function CrearEventoPage() {
  const router = useRouter()
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
        onBack={() => router.back()}
        onGoHome={() => router.push("/")}
        onGoEvents={() => router.push("/eventos")}
      />
      <Footer />
    </div>
  )
}
