import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"

export function BrandVisionCard() {
  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card/90 backdrop-blur-sm border-border rounded-sm">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/images/logo_color.png"
                width={250}
                height={250}
                alt="Logo de Time2Go"
                className="mx-auto mb-3 max-w-[250px] max-h-[250px] object-contain"
              />
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              Nuestra visión es revolucionar la industria de eventos, conectando a organizadores y asistentes
              a través de tecnología innovadora que simplifica cada paso del proceso.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
