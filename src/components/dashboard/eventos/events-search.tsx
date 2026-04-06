import { Search } from "lucide-react"

type EventsSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function EventsSearch({ value, onChange }: EventsSearchProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-lime-600" />
      <input
        type="text"
        placeholder="Buscar eventos..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-green-600 bg-white/95 py-2.5 pl-10 pr-4 text-green-900 placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-400"
      />
    </div>
  )
}
