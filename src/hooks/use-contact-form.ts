import { useCallback, useState } from "react"

export type ContactFormData = {
  name: string
  email: string
  subject: string
  message: string
}

type SubmitFeedback = {
  type: "success" | "error"
  message: string
}

const EMPTY_FORM: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [submitFeedback, setSubmitFeedback] = useState<SubmitFeedback | null>(null)

  const handleInputChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitFeedback(null)
    setSending(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitFeedback({
          type: "error",
          message: data?.error || "No se pudo enviar el mensaje. Intenta nuevamente.",
        })
        return
      }

      setSubmitFeedback({
        type: "success",
        message: "Tu mensaje fue enviado correctamente. Te responderemos pronto.",
      })
      setFormData(EMPTY_FORM)
    } catch (error) {
      console.error("Error enviando mensaje de contacto:", error)
      setSubmitFeedback({
        type: "error",
        message: "Error de red. Verifica tu conexión e intenta nuevamente.",
      })
    } finally {
      setSending(false)
    }
  }, [formData])

  return {
    formData,
    sending,
    submitFeedback,
    handleInputChange,
    handleSubmit,
  }
}
