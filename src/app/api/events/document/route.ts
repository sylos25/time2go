import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 })
    }
    const external = await fetch(url)
    if (!external.ok) {
      return NextResponse.json({ error: "Failed to fetch document" }, { status: 502 })
    }

    // Determine filename and content-type; prefer PDF display
    const ct = (external.headers.get("content-type") || "").toLowerCase()
    const isPdf = ct.includes("pdf") || url.toLowerCase().endsWith(".pdf")
    const contentType = isPdf ? "application/pdf" : external.headers.get("content-type") || "application/octet-stream"

    const pathname = (() => {
      try {
        return new URL(url).pathname
      } catch (e) {
        // fallback
        const m = url.split("/")
        return m[m.length - 1] || "document.pdf"
      }
    })()
    const filename = (pathname && pathname.split("/").pop()) || "document.pdf"
    const disposition = `inline; filename="${filename.replace(/\"/g, '')}"`

    const arrayBuffer = await external.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Content-Length": String(uint8.length),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (err) {
    console.error("Error proxying document:", err)
    return NextResponse.json({ error: "Error proxying document" }, { status: 500 })
  }
}
