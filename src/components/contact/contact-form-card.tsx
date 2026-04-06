import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContactFormData } from "@/hooks/use-contact-form"

type SubmitFeedback = {
  type: "success" | "error"
  message: string
}

type ContactFormCardProps = {
  formData: ContactFormData
  sending: boolean
  submitFeedback: SubmitFeedback | null
  onChange: (field: keyof ContactFormData, value: string) => void
  onSubmit: (event: React.FormEvent) => Promise<void>
}

export function ContactFormCard({
  formData,
  sending,
  submitFeedback,
  onChange,
  onSubmit,
}: ContactFormCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center">
          <Send className="w-6 h-6 mr-2 text-green-600" />
          Contáctanos
        </h2>
        <p className="text-muted-foreground mb-6">Completa el formulario y te responderemos pronto</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(event) => onChange("name", event.target.value)}
                required
                className="rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(event) => onChange("email", event.target.value)}
                required
                className="rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto *</Label>
            <Input
              id="subject"
              placeholder="¿En qué podemos ayudarte?"
              value={formData.subject}
              onChange={(event) => onChange("subject", event.target.value)}
              required
              className="rounded-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              placeholder="Describe tu consulta..."
              rows={4}
              value={formData.message}
              onChange={(event) => onChange("message", event.target.value)}
              required
              className="rounded-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-linear-to-tr from-fuchsia-700 to-red-500 hover:scale-103 hover:from-fuchsia-600 hover:to-red-500 text-white font-medium rounded-sm cursor-pointer"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Enviando..." : "Enviar mensaje"}
          </Button>

          {submitFeedback && (
            <p className={`text-sm ${submitFeedback.type === "success" ? "text-green-700" : "text-red-600"}`}>
              {submitFeedback.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
