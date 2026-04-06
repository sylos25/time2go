import { FilePenLine } from "lucide-react"

import { formatCellValue, getColumnLabel, type DataRow, type TableKey } from "@/lib/dashboard-view-data"

type ViewDataTableProps = {
  table: TableKey
  rowIdColumn: string
  loading: boolean
  error: string | null
  visibleColumns: string[]
  paginatedRows: DataRow[]
  startIndex: number
  totalRows: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  onEdit: (row: DataRow) => void
}

export function ViewDataTable({
  table,
  rowIdColumn,
  loading,
  error,
  visibleColumns,
  paginatedRows,
  startIndex,
  totalRows,
  currentPage,
  pageSize,
  totalPages,
  onPrevPage,
  onNextPage,
  onEdit,
}: ViewDataTableProps) {
  if (loading) {
    return <div>Cargando registros...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (totalRows === 0) {
    return <div className="py-8 text-center text-muted-foreground">No hay registros</div>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-lime-200/70 bg-white/85 shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/35">
      <table className="w-full min-w-max table-auto border-collapse text-sm">
        <thead className="bg-teal-600 dark:bg-emerald-700">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column}
                className="border-r border-lime-200/35 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95 last:border-r-0 dark:border-emerald-300/20 dark:text-lime-100"
              >
                {getColumnLabel(column)}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/95 dark:text-lime-100">
              Editar
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-lime-200/80 dark:divide-emerald-700/60">
          {paginatedRows.map((row, index) => (
            <tr
              key={`${startIndex + index}-${String(row[rowIdColumn] ?? index)}`}
              className={`transition-colors ${
                (startIndex + index) % 2 === 0
                  ? "bg-white/95 hover:bg-lime-50/90 dark:bg-emerald-950/25 dark:hover:bg-emerald-900/35"
                  : "bg-lime-50/45 hover:bg-lime-100/75 dark:bg-teal-950/25 dark:hover:bg-teal-900/35"
              }`}
            >
              {visibleColumns.map((column) => (
                <td
                  key={column}
                  className="border-r border-lime-200/70 px-4 py-3 text-left text-sm text-green-900 last:border-r-0 dark:border-emerald-700/45 dark:text-emerald-100/90"
                >
                  {formatCellValue(column, row[column])}
                </td>
              ))}

              <td className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  title="Editar informacion"
                  aria-label="Editar informacion"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-green-700 transition-colors hover:bg-lime-200/70 hover:text-green-800 dark:text-lime-300 dark:hover:bg-emerald-800/45 dark:hover:text-lime-200"
                >
                  <FilePenLine className="h-4 w-4" />
                  <span className="sr-only">Editar informacion</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-lime-200/80 bg-lime-50/50 px-4 py-3 dark:border-emerald-700/60 dark:bg-emerald-900/20">
        <p className="text-sm text-green-800 dark:text-emerald-200/90">
          Mostrando {Math.min(startIndex + 1, totalRows)} - {Math.min(currentPage * pageSize, totalRows)} de {totalRows}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1 || loading}
            className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
          >
            Anterior
          </button>
          <span className="text-sm text-green-800 dark:text-emerald-200/90">
            Pagina {currentPage} de {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages || loading}
            className="rounded-lg border border-lime-200 px-3 py-1.5 text-green-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-700 dark:text-emerald-200"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
