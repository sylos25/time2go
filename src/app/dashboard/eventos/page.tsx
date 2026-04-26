"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"

import { EventsActionNotice } from "@/components/dashboard/eventos/events-action-notice"
import { DeactivateEventDialog } from "@/components/dashboard/eventos/deactivate-event-dialog"
import { EventsHero } from "@/components/dashboard/eventos/events-hero"
import { EventsSearch } from "@/components/dashboard/eventos/events-search"
import { EventsTable } from "@/components/dashboard/eventos/events-table"
import { RejectEventDialog } from "@/components/dashboard/eventos/reject-event-dialog"
import { useDashboardEvents } from "@/hooks/use-dashboard-events"
import type { Evento } from "@/types/event-edit"

import { EditEventModal } from "./edit-event-modal"

export default function DashboardEventsPage() {
  const {
    loading,
    authorized,
    searchTerm,
    filterCategory,
    editingEvent,
    editModalOpen,
    rejectModalOpen,
    rejectSubmitting,
    deleteSubmitting,
    actionNotice,
    rejectForm,
    togglingDestacado,
    eventCategoryTabs,
    activeEventCategoryIndex,
    filteredEvents,
    setSearchTerm,
    setFilterCategory,
    setRejectModalOpen,
    setRejectForm,
    clearActionNotice,
    refreshEvents,
    goToPreviousEventCategory,
    goToNextEventCategory,
    openRejectModal,
    submitReject,
    deleteEvent,
    approveEvent,
    toggleDestacado,
    openDocumentInNewTab,
    openEditModal,
    closeEditModal,
  } = useDashboardEvents()

  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  const openDeactivateDialog = (eventId: number) => {
    setSelectedEventId(eventId)
    setDeactivateDialogOpen(true)
  }

  const closeDeactivateDialog = () => {
    if (deleteSubmitting) return
    setDeactivateDialogOpen(false)
    setSelectedEventId(null)
  }

  const confirmDeactivateEvent = async () => {
    if (selectedEventId === null) return
    const deleted = await deleteEvent(selectedEventId)
    if (deleted) {
      setDeactivateDialogOpen(false)
      setSelectedEventId(null)
    }
  }

  const handleDownloadDocument = (eventItem: { documentos: Array<{ id_documento_evento: number }> }) => {
    const documents = eventItem.documentos || []
    if (documents.length === 0) return

    if (documents.length === 1) {
      openDocumentInNewTab(Number(documents[0].id_documento_evento))
      return
    }

    const listText = documents.map((_, index) => `${index + 1}. Documento ${index + 1}`).join("\n")
    const docNum = window.prompt(`Hay ${documents.length} documentos. Ingresa el numero (1-${documents.length}):\n\n${listText}`, "1")

    if (!docNum) return
    const parsed = Number.parseInt(docNum, 10)
    if (Number.isNaN(parsed)) return

    const selectedIndex = parsed - 1
    if (selectedIndex >= 0 && selectedIndex < documents.length) {
      openDocumentInNewTab(Number(documents[selectedIndex].id_documento_evento))
    }
  }

  if (loading || authorized === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-800" />
          <p className="text-lg text-muted-foreground">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
          <h2 className="text-2xl font-semibold text-red-600">Acceso denegado</h2>
          <p className="mt-4 text-muted-foreground">No tienes permisos para gestionar eventos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EventsActionNotice notice={actionNotice} onClose={clearActionNotice} />

      <EventsHero
        eventCategoryTabs={eventCategoryTabs}
        activeEventCategoryIndex={activeEventCategoryIndex}
        filterCategory={filterCategory}
        onPreviousCategory={goToPreviousEventCategory}
        onNextCategory={goToNextEventCategory}
        onSelectCategory={setFilterCategory}
      />

      <EventsSearch value={searchTerm} onChange={setSearchTerm} />

      <EventsTable
        events={filteredEvents}
        togglingDestacado={togglingDestacado}
        onToggleDestacado={toggleDestacado}
        onApproveEvent={approveEvent}
        onRejectEvent={openRejectModal}
        onDownloadDocument={handleDownloadDocument}
        onEditEvent={openEditModal}
        onDeleteEvent={openDeactivateDialog}
      />

      <DeactivateEventDialog
        open={deactivateDialogOpen}
        deleting={deleteSubmitting}
        onCancel={closeDeactivateDialog}
        onConfirm={confirmDeactivateEvent}
      />

      <RejectEventDialog
        open={rejectModalOpen}
        rejectSubmitting={rejectSubmitting}
        rejectForm={rejectForm}
        onOpenChange={setRejectModalOpen}
        onRejectFormChange={setRejectForm}
        onSubmit={submitReject}
      />

      {editingEvent && (
        <EditEventModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          event={editingEvent as unknown as Evento}
          onSave={async () => {
            await refreshEvents()
          }}
        />
      )}
    </div>
  )
}
