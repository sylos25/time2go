"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  pdfUrl: string
  fileName?: string
  onClose?: () => void
}

export function PDFViewer({ pdfUrl, fileName = "documento.pdf", onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const onDocumentLoadError = () => {
    setError("Error al cargar el PDF")
    setLoading(false)
  }

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1)
    }
  }

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1)
    }
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{fileName}</h3>
          {!loading && numPages && (
            <p className="text-sm text-muted-foreground">
              Página {pageNumber} de {numPages}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="Descargar PDF"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="text-center text-muted-foreground">
            <p>Cargando PDF...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <p className="text-sm mt-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Descargar y abrir en nueva pestaña
              </a>
            </p>
          </div>
        )}

        {!error && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div>Cargando...</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={1.2}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
      </div>

      {/* Navigation */}
      {!loading && numPages && numPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-card border-t border-border">
          <Button
            variant="outline"
            onClick={goToPrevPage}
            disabled={pageNumber === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            Página {pageNumber} de {numPages}
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={pageNumber === numPages}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
