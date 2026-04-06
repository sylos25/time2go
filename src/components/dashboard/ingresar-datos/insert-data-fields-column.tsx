import type { DataTable, FieldConfig, FormState } from "@/lib/insert-data-config"

import { InsertDataField } from "./insert-data-field"

type InsertDataFieldsColumnProps = {
  title: string
  fields: FieldConfig[]
  selectedTable: DataTable
  formData: FormState
  emptyText?: string
  tone?: "primary" | "secondary"
  onInputChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean; type: string } }
  ) => void
  onSetFormData: (updater: (prev: FormState) => FormState) => void
}

export function InsertDataFieldsColumn({
  title,
  fields,
  selectedTable,
  formData,
  emptyText,
  tone = "primary",
  onInputChange,
  onSetFormData,
}: InsertDataFieldsColumnProps) {
  const panelClass =
    tone === "primary"
      ? "rounded-lg border border-lime-200/60 bg-lime-50/45 p-4 dark:border-emerald-700/60 dark:bg-emerald-900/25"
      : "rounded-lg border border-teal-200/60 bg-teal-50/45 p-4 dark:border-teal-700/60 dark:bg-teal-900/20"

  return (
    <div className={panelClass}>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-lime-300">{title}</h4>
      <div className="space-y-3">
        {fields.length === 0 && emptyText ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          fields.map((field) => (
            <InsertDataField
              key={field.name}
              field={field}
              selectedTable={selectedTable}
              formData={formData}
              onInputChange={onInputChange}
              onSetFormData={onSetFormData}
            />
          ))
        )}
      </div>
    </div>
  )
}
