"use client"

import {
  EditRecordDialog,
  ViewDataHeroNav,
  ViewDataSearch,
  ViewDataTable,
} from "@/components/shared/features/view-data"
import { useDashboardViewData } from "@/hooks/use-dashboard-view-data"
import { TABLE_ID_COLUMN } from "@/lib/dashboard-view-data"

export default function DashboardViewDataPage() {
  const {
    table,
    loading,
    error,
    searchTerm,
    currentPage,
    pageSize,
    totalRows,
    totalPages,
    startIndex,
    paginatedRows,
    activeTableIndex,
    activeTableLabel,
    visibleColumns,
    editModalOpen,
    editingRow,
    editFormData,
    saving,
    saveError,
    tableNavItems,
    setSearchTerm,
    setCurrentPage,
    setEditModalOpen,
    setTableAndUrl,
    goToPreviousTable,
    goToNextTable,
    openEditModal,
    handleEditFieldChange,
    saveEditedRow,
  } = useDashboardViewData()

  return (
    <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
      <ViewDataHeroNav
        activeTableLabel={activeTableLabel}
        activeTableIndex={activeTableIndex}
        table={table}
        tableNavItems={tableNavItems}
        onPrev={goToPreviousTable}
        onNext={goToNextTable}
        onSelect={setTableAndUrl}
      />

      <ViewDataSearch
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
      />

      <ViewDataTable
        table={table}
        rowIdColumn={TABLE_ID_COLUMN[table]}
        loading={loading}
        error={error}
        visibleColumns={visibleColumns}
        paginatedRows={paginatedRows}
        startIndex={startIndex}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        onEdit={openEditModal}
      />

      <EditRecordDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        editFormData={editFormData}
        editingRow={editingRow}
        saveError={saveError}
        saving={saving}
        onChangeField={handleEditFieldChange}
        onSave={saveEditedRow}
      />
    </div>
  )
}
