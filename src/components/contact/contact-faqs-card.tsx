import { Card, CardContent } from "@/components/ui/card"
import type { FaqItem } from "@/lib/contact-content"

type ContactFaqsCardProps = {
  items: FaqItem[]
}

export function ContactFaqsCard({ items }: ContactFaqsCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Preguntas Frecuentes</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.question}>
              <h4 className="font-medium text-foreground mb-1">{item.question}</h4>
              <p className="text-muted-foreground text-sm">{item.answer}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
