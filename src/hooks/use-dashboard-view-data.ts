import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  TABLE_EDITABLE_FIELDS,
  TABLE_HIDDEN_COLUMNS,
  TABLE_ID_COLUMN,
  TABLE_NAV_ITEMS,
  buildEditPayload,
  fetchTableRows,
  isIdColumn,
  isTableKey,
  type DataRow,
  type TableKey,
  updateTableRow,
} from "@/lib/dashboard-view-data"

const PAGE_SIZE = 25

export function useDashboardViewData() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [table, setTable] = useState<TableKey>(() => {
    const fromUrl = searchParams.get("tabla")
    return isTableKey(fromUrl) ? fromUrl : "sitios"
  })
  const [rows, setRows] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<DataRow | null>(null)
  const [editFormData, setEditFormData] = useState<DataRow>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearchTerm) return rows

    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(normalizedSearchTerm))
    )
  }, [normalizedSearchTerm, rows])

  const totalRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE)

  const editableFieldsForTable = TABLE_EDITABLE_FIELDS[table] || []
  const hiddenColumnsForTable = useMemo(() => TABLE_HIDDEN_COLUMNS[table] || [], [table])
  const activeTableIndex = TABLE_NAV_ITEMS.findIndex((item) => item.key === table)
  const activeTableLabel = TABLE_NAV_ITEMS[activeTableIndex]?.label || ""

  const visibleColumns = useMemo(() => {
    if (paginatedRows.length <= 0) return []

    return Object.keys(paginatedRows[0]).filter(
      (column) => !isIdColumn(column) && !hiddenColumnsForTable.includes(column)
    )
  }, [hiddenColumnsForTable, paginatedRows])

  const setTableAndUrl = (nextTable: TableKey) => {
    setTable(nextTable)
    setCurrentPage(1)

    const params = new URLSearchParams(searchParams.toString())
    params.set("tabla", nextTable)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const goToPreviousTable = () => {
    if (activeTableIndex <= 0) return
    setTableAndUrl(TABLE_NAV_ITEMS[activeTableIndex - 1].key)
  }

  const goToNextTable = () => {
    if (activeTableIndex >= TABLE_NAV_ITEMS.length - 1) return
    setTableAndUrl(TABLE_NAV_ITEMS[activeTableIndex + 1].key)
  }

  const openEditModal = (row: DataRow) => {
    const initialData: DataRow = {}

    editableFieldsForTable.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(row, field)) {
        initialData[field] = row[field] ?? ""
      }
    })

    setEditingRow(row)
    setEditFormData(initialData)
    setSaveError(null)
    setEditModalOpen(true)
  }

  const handleEditFieldChange = (field: string, value: unknown) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveEditedRow = async () => {
    if (!editingRow) return

    const idColumn = TABLE_ID_COLUMN[table]
    const idValue = editingRow[idColumn]

    if (idValue === undefined || idValue === null) {
      setSaveError("No se pudo identificar el registro a editar")
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const payloadData = buildEditPayload(editingRow, editFormData)

      await updateTableRow({
        table,
        id: idValue,
        data: payloadData,
      })

      setEditModalOpen(false)
      setEditingRow(null)
      setEditFormData({})
      setReloadKey((prev) => prev + 1)
    } catch (errorValue) {
      const errorMessage = errorValue instanceof Error ? errorValue.message : "Error al actualizar"
      setSaveError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const tableFromUrl = searchParams.get("tabla")

    if (!isTableKey(tableFromUrl)) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tabla", table)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      return
    }

    setTable((prev) => (prev === tableFromUrl ? prev : tableFromUrl))
  }, [searchParams, pathname, router, table])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchTableRows(table)
        if (!cancelled) {
          setRows(data)
        }
      } catch (errorValue) {
        if (!cancelled) {
          const errorMessage = errorValue instanceof Error ? errorValue.message : "Error al cargar datos"
          setError(errorMessage)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [table, reloadKey])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return {
    table,
    rows,
    loading,
    error,
    searchTerm,
    currentPage,
    pageSize: PAGE_SIZE,
    filteredRows,
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
    tableNavItems: TABLE_NAV_ITEMS,
    setSearchTerm,
    setCurrentPage,
    setEditModalOpen,
    setTableAndUrl,
    goToPreviousTable,
    goToNextTable,
    openEditModal,
    handleEditFieldChange,
    saveEditedRow,
  }
}
