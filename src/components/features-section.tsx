import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Sparkles, Lock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Satisfacción Garantizada",
      description:
        "Te garantizamos una experiencia excepcional en cada evento. Si no quedas completamente satisfecho, te devolvemos tu dinero.",
      badge: "100%",
    },
    {
      icon: Sparkles,
      title: "Eventos Únicos",
      description:
        "Descubre experiencias exclusivas y memorables que no encontrarás en ningún otro lugar. Cada evento es cuidadosamente seleccionado.",
      badge: "Exclusivo",
    },
    {
      icon: Lock,
      title: "Reserva Segura",
      description:
        "Tus datos y pagos están completamente protegidos con la más alta tecnología de seguridad. Reserva con total confianza.",
      badge: "Seguro",
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Todo Lo Que Necesitas Para Eventos Increíbles</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra plataforma integral te ofrece todas las herramientas y características que necesitas para
            planificar, gestionar y ejecutar eventos exitosos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <Badge variant="secondary" className="absolute top-4 right-4">
                  {feature.badge}
                </Badge>
                <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
