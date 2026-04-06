import {
  Calendar,
  Clock,
  Info,
  MapPin,
  Star,
  Users,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { formatEventPrice } from "@/app/eventos/lib/events-page-utils"
import type { EventCardItem } from "@/app/eventos/lib/events-page-types"

type EventExpandedModalProps = {
  event: EventCardItem
  onClose: () => void
}

export function EventExpandedModal({ event, onClose }: EventExpandedModalProps) {
  const images = Array.isArray(event.raw?.imagenes) ? event.raw.imagenes : []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-card/90 hover:bg-card text-foreground rounded-full h-10 w-10 p-0"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[0].url_imagen_evento || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <img
                        key={`${image.id_imagen_evento || "img"}-${index}`}
                        src={image.url_imagen_evento || "/placeholder.svg"}
                        alt={`${event.title} ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <img
                  src="/placeholder.svg"
                  alt={event.title}
                  className="w-full h-80 object-cover rounded-2xl"
                />
              )}

              <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${typeof event.price === "number" ? "bg-red-600 text-white" : "bg-green-400 text-white"}`}>
                {typeof event.price === "number" ? "PAGO" : "GRATIS"}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="rounded-full text-sm px-3 py-1">
                    {event.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{event.title}</h1>
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-foreground">4.8</span>
                    <span className="text-sm text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{event.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-foreground">{event.date}</div>
                    <div className="text-sm text-muted-foreground">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-foreground">Duración</div>
                    <div className="text-sm text-muted-foreground">Según programación</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-foreground">Ubicación</div>
                    <div className="text-sm text-muted-foreground">{event.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-foreground">Asistentes</div>
                    <div className="text-sm text-muted-foreground">{event.attendees.toLocaleString("es-CO")}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-foreground">Organizado por</div>
                    <div className="text-blue-600">Time2Go</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-blue-600">{formatEventPrice(event.price)}</span>
                    <span className="text-muted-foreground">por persona</span>
                  </div>
                  <Button className="bg-gradient-to-tr from-fuchsia-500 to-red-600 hover:from-fuchsia-600 hover:to-red-700 rounded-xl px-8 py-6 text-lg font-semibold text-white">
                    Compra tu entrada
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
