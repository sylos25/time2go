import { Card, CardContent } from "@/components/ui/card"
import type { ContactInfoItem } from "@/lib/contact-content"

type ContactInfoGridProps = {
  items: ContactInfoItem[]
}

export function ContactInfoGrid({ items }: ContactInfoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card key={item.title} className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <item.icon className="mt-3 w-9 h-9 text-green-600 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                {item.details.map((detail) => (
                  <p key={detail} className="text-muted-foreground text-sm">{detail}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
