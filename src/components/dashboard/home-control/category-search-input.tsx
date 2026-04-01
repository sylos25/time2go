import type { ChangeEvent } from "react"

import { CATEGORY_SEARCH_INPUT_CLASS, CATEGORY_SEARCH_MAX_LENGTH } from "./utils"

type CategorySearchInputProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function CategorySearchInput({ value, onChange }: CategorySearchInputProps) {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar categorías..."
        value={value}
        onChange={onChange}
        maxLength={CATEGORY_SEARCH_MAX_LENGTH}
        className={CATEGORY_SEARCH_INPUT_CLASS}
      />
    </div>
  )
}
