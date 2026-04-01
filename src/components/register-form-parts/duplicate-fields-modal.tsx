import { Button } from "@/components/ui/button"

type DuplicateFieldsModalProps = {
  open: boolean
  duplicates: string[]
  message?: string
  onClose: () => void
}

export function DuplicateFieldsModal({ open, duplicates, message, onClose }: DuplicateFieldsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="dup-title">
      <div className="w-full max-w-sm rounded-md bg-card p-6 shadow-lg">
        <h3 id="dup-title" className="mb-2 text-lg font-semibold">Campos ya registrados</h3>
        <p className="mb-4 text-sm text-foreground">{message}</p>
        {duplicates.length > 0 && (
          <ul className="mb-4 list-inside list-disc text-sm text-muted-foreground">
            {duplicates.map((duplicate, index) => (
              <li key={index}>{duplicate}</li>
            ))}
          </ul>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">Cerrar</Button>
        </div>
      </div>
    </div>
  )
}
