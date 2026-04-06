import { Loader2, ShieldBan } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BanCategory, BanFormState, BanReason, MeUser, UsersMessage } from "@/lib/dashboard-users"

type UserBanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  banSubmitting: boolean
  banUserName: string
  banForm: BanFormState
  banMessage: UsersMessage
  categoriasBan: BanCategory[]
  motivosBan: BanReason[]
  motivosFiltrados: BanReason[]
  meUser: MeUser | null
  onBanFormChange: (updater: (prev: BanFormState) => BanFormState) => void
  onSubmit: () => void
  addDaysToDateTimeLocal: (dateTimeLocal: string, days: number) => string
  formatDateTimeLocal: (date: Date) => string
}

export function UserBanDialog({
  open,
  onOpenChange,
  banSubmitting,
  banUserName,
  banForm,
  banMessage,
  categoriasBan,
  motivosBan,
  motivosFiltrados,
  meUser,
  onBanFormChange,
  onSubmit,
  addDaysToDateTimeLocal,
  formatDateTimeLocal,
}: UserBanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
              <ShieldBan className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg text-foreground">Suspender cuenta</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                El usuario no podra iniciar sesion hasta la fecha de fin. Se registra el motivo y queda constancia del responsable.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="gap-0 border-red-200/70 bg-linear-to-br from-red-50/90 to-rose-50/30 py-4 shadow-none dark:border-red-900/50 dark:from-red-950/35 dark:to-rose-950/20">
            <CardHeader className="px-4 pb-2 pt-0">
              <CardTitle className="text-sm font-medium text-red-900 dark:text-red-200">Cuenta afectada</CardTitle>
              <CardDescription className="text-red-800/90 dark:text-red-300/90">
                {banUserName}
                <span className="mt-1 block font-mono text-xs text-red-700/80 dark:text-red-400/90">
                  ID {banForm.id_usuario}
                </span>
              </CardDescription>
            </CardHeader>
          </Card>

          {banMessage?.type === "error" && (
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {banMessage.text}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ban-categoria">Categoria</Label>
              <Select
                value={banForm.id_categoria ? String(banForm.id_categoria) : undefined}
                onValueChange={(value) =>
                  onBanFormChange((prev) => ({
                    ...prev,
                    id_categoria: Number(value),
                    id_motivo_ban: 0,
                  }))
                }
              >
                <SelectTrigger id="ban-categoria" className="h-11 w-full">
                  <SelectValue placeholder="Elige una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasBan.map((categoria) => (
                    <SelectItem key={categoria.id} value={String(categoria.id)}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ban-motivo">Motivo</Label>
              <Select
                value={banForm.id_motivo_ban ? String(banForm.id_motivo_ban) : undefined}
                onValueChange={(value) => onBanFormChange((prev) => ({ ...prev, id_motivo_ban: Number(value) }))}
                disabled={!banForm.id_categoria}
              >
                <SelectTrigger id="ban-motivo" className="h-11 w-full min-w-0">
                  <SelectValue
                    placeholder={banForm.id_categoria ? "Selecciona el motivo concreto" : "Primero elige una categoria"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {motivosFiltrados.map((motivo) => (
                    <SelectItem key={motivo.id} value={String(motivo.id)} className="whitespace-normal py-2">
                      {motivo.motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {banForm.id_motivo_ban > 0 && (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
              <span className="font-medium text-amber-900 dark:text-amber-200">Resumen: </span>
              {motivosBan.find((item) => item.id === banForm.id_motivo_ban)?.motivo}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ban-inicio">Inicio</Label>
              <input
                id="ban-inicio"
                type="datetime-local"
                value={banForm.inicio_ban}
                onChange={(event) => onBanFormChange((prev) => ({ ...prev, inicio_ban: event.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-fin">Fin</Label>
              <input
                id="ban-fin"
                type="datetime-local"
                value={banForm.fin_ban}
                onChange={(event) => onBanFormChange((prev) => ({ ...prev, fin_ban: event.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Duracion desde el inicio</p>
            <div className="flex flex-wrap gap-2">
              {[
                { days: 7, label: "7 dias" },
                { days: 14, label: "14 dias" },
                { days: 30, label: "30 dias" },
                { days: 90, label: "90 dias" },
              ].map(({ days, label }) => (
                <Button
                  key={days}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-lime-200/80 text-green-900 hover:bg-lime-50 dark:border-emerald-800 dark:text-emerald-100 dark:hover:bg-emerald-950/50"
                  onClick={() =>
                    onBanFormChange((prev) => ({
                      ...prev,
                      fin_ban: addDaysToDateTimeLocal(prev.inicio_ban || formatDateTimeLocal(new Date()), days),
                    }))
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Card className="gap-0 border-border/80 bg-muted/30 py-3 shadow-none">
            <CardContent className="px-4 py-0 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Responsable: </span>
              {meUser?.nombres} {meUser?.apellidos}
              <span className="mt-0.5 block font-mono text-xs">ID {meUser?.id_usuario}</span>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={banSubmitting}>
            Cancelar
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onSubmit}
            disabled={banSubmitting || !banForm.id_categoria || !banForm.id_motivo_ban}
          >
            {banSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Confirmar suspension"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
