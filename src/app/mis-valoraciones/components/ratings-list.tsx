import { CalendarDays, Check, Loader2, Pencil, Star, Trash2, X } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import type { Valoracion } from "@/app/mis-valoraciones/lib/mis-valoraciones-types"
import {
  formatCreatedDate,
  formatEventDateTime,
} from "@/app/mis-valoraciones/lib/mis-valoraciones-utils"
import { InteractiveStars, ReadOnlyStars } from "@/app/mis-valoraciones/components/rating-stars"

type RatingsListProps = {
  valoraciones: Valoracion[]
  editingId: number | null
  editRating: number
  editComment: string
  savingEdit: boolean
  editError: string | null
  editSuccess: string | null
  getEventHref: (item: Valoracion) => string | null
  onStartEdit: (item: Valoracion) => void
  onCancelEdit: () => void
  onEditRatingChange: (value: number) => void
  onEditCommentChange: (value: string) => void
  onSaveEdit: (id: number) => void
  onRequestDelete: (id: number) => void
}

export function RatingsList({
  valoraciones,
  editingId,
  editRating,
  editComment,
  savingEdit,
  editError,
  editSuccess,
  getEventHref,
  onStartEdit,
  onCancelEdit,
  onEditRatingChange,
  onEditCommentChange,
  onSaveEdit,
  onRequestDelete,
}: RatingsListProps) {
  return (
    <div className="grid gap-4">
      {valoraciones.map((item) => {
        const isEditing = editingId === item.id_valoracion

        const eventHref = getEventHref(item)
        return (
          <Card
            key={item.id_valoracion}
            className="bg-card/90 backdrop-blur-sm border border-border rounded-sm overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-44 h-40 sm:h-auto flex-shrink-0">
                  {item.imagen_evento ? (
                    <img
                      src={item.imagen_evento}
                      alt={item.nombre_evento}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Star className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={eventHref || "#"}
                        aria-disabled={!eventHref}
                        className="font-semibold text-foreground text-left hover:text-green-600 transition-colors leading-tight line-clamp-1 w-full"
                      >
                        {item.nombre_evento}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatEventDateTime(item.fecha_inicio, item.hora_inicio)}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-sm">
                      {isEditing ? editRating : item.valoracion}/5
                    </Badge>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 border-t pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Calificacion</p>
                        <InteractiveStars value={editRating} onChange={onEditRatingChange} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Comentario <span className="font-normal">(opcional)</span>
                        </p>
                        <textarea
                          value={editComment}
                          onChange={(event) => onEditCommentChange(event.target.value)}
                          className="w-full p-2 border rounded-sm text-sm resize-none bg-background focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="Que te parecio el evento?"
                          maxLength={1000}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground text-right -mt-1">
                          {editComment.length}/1000
                        </p>
                      </div>

                      {editError && <p className="text-xs text-red-600">{editError}</p>}
                      {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveEdit(item.id_valoracion)}
                          disabled={savingEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium bg-rose-500 hover:from-green-500 hover:to-lime-400 text-white disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {savingEdit ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Guardar
                        </button>
                        <button
                          onClick={onCancelEdit}
                          disabled={savingEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-green-500 hover:text-green-700 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ReadOnlyStars value={item.valoracion} />
                      {item.comentario && (
                        <div className="bg-muted/50 rounded-sm px-4 py-3 border-l-2 border-green-500">
                          <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{item.comentario}"
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {!isEditing && (
                    <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">
                        Valorado el {formatCreatedDate(item.fecha_creacion)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onStartEdit(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => onRequestDelete(item.id_valoracion)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium border border-border text-foreground hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
