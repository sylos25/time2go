import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import type { EventImage } from "../lib/event-landing-types"

type EventHeaderSectionProps = {
  eventName: string
  images: EventImage[]
  selectedImage: number
  backHref: string
  onSelectImage: (index: number) => void
  onNextImage: () => void
  onPrevImage: () => void
}

export function EventHeaderSection({
  eventName,
  images,
  selectedImage,
  backHref,
  onSelectImage,
  onNextImage,
  onPrevImage,
}: EventHeaderSectionProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
      <div className="mb-4">
        <Button asChild variant="secondary" size="sm" className="bg-card/80 backdrop-blur-sm hover:bg-card shadow-md">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">{eventName}</h1>
      </div>

      {images.length > 0 && (
        <div className="mb-6">
          <div className="relative w-full aspect-[4/3] max-h-[400px] rounded-2xl overflow-hidden mb-3 flex items-center justify-center">
            <img
              src={images?.[selectedImage]?.url_imagen_evento || "/placeholder.svg"}
              alt={eventName}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card p-2 rounded-full shadow-lg transition-all"
                >
                  <ArrowLeft className="h-5 w-5 cursor-pointer" />
                </button>
                <button
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card p-2 rounded-full shadow-lg transition-all"
                >
                  <ArrowLeft className="h-5 w-5 rotate-180 cursor-pointer" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={`${image.url_imagen_evento || "img"}-${index}`}
                  onClick={() => onSelectImage(index)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === index
                      ? "border-4 border-lime-600 ring-2 ring-lime-500"
                      : "border-4 border-gray-200 ring-2 ring-gray-300"
                  }`}
                >
                  <img
                    src={image.url_imagen_evento || "/placeholder.svg"}
                    alt={`${eventName} ${index + 1}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
