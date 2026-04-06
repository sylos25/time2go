import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

type ViewDataSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ViewDataSearch({ value, onChange }: ViewDataSearchProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-600" />
      <Input
        placeholder="Buscar registros..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-green-600 pl-10 placeholder-lime-600 focus-visible:ring-lime-400"
      />
    </div>
  )
}
