import { Card, CardContent } from "@/components/ui/card"
import type { SoftwareFeatureItem } from "@/lib/contact-content"

type SoftwareFeaturesSectionProps = {
  items: SoftwareFeatureItem[]
}

export function SoftwareFeaturesSection({ items }: SoftwareFeaturesSectionProps) {
  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-8">
          ¿Por qué elegir Time2Go?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.title} className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <item.icon className="w-9 h-9 text-green-700" />
                </div>

                <h3 className="text-center text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
