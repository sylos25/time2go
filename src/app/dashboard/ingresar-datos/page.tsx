"use client"

import { Loader } from "lucide-react"

import { InsertDataFieldsColumn } from "@/components/dashboard/ingresar-datos/insert-data-fields-column"
import { InsertDataHero } from "@/components/dashboard/ingresar-datos/insert-data-hero"
import { InsertDataMessage } from "@/components/dashboard/ingresar-datos/insert-data-message"
import { Button } from "@/components/ui/button"
import { useInsertDataPage } from "@/hooks/use-insert-data-page"

export default function DashboardInsertDataPage() {
  const {
    selectedTable,
    formData,
    loading,
    message,
    activeTableIndex,
    activeTableLabel,
    primaryFields,
    secondaryFields,
    setSelectedTable,
    setFormData,
    handleInputChange,
    handleSubmit,
    goToPreviousTable,
    goToNextTable,
  } = useInsertDataPage()

  return (
    <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
      <InsertDataHero
        selectedTable={selectedTable}
        activeTableIndex={activeTableIndex}
        activeTableLabel={activeTableLabel}
        onSelectTable={setSelectedTable}
        onPrevious={goToPreviousTable}
        onNext={goToNextTable}
      />

      <div className="space-y-4">
        <InsertDataMessage message={message} />

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-lime-200/70 bg-white/90 p-4 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InsertDataFieldsColumn
              title="Informacion principal"
              fields={primaryFields}
              selectedTable={selectedTable}
              formData={formData}
              onInputChange={handleInputChange}
              onSetFormData={setFormData}
            />

            <InsertDataFieldsColumn
              title="Informacion complementaria"
              fields={secondaryFields}
              selectedTable={selectedTable}
              formData={formData}
              emptyText="No hay campos complementarios para esta tabla."
              tone="secondary"
              onInputChange={handleInputChange}
              onSetFormData={setFormData}
            />
          </div>

          <div className="mt-5 flex items-center justify-end">
            <Button type="submit" disabled={loading} className="w-auto bg-green-700 px-4 py-2 text-white hover:bg-lime-500">
              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Insertando..." : "Insertar datos"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
