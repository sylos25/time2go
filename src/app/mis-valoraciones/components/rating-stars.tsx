import { useState } from "react"
import { Star } from "lucide-react"

type ReadOnlyStarsProps = {
  value: number
}

type InteractiveStarsProps = {
  value: number
  onChange: (value: number) => void
}

export function ReadOnlyStars({ value }: ReadOnlyStarsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index <= value ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
          }`}
        />
      ))}
    </div>
  )
}

export function InteractiveStars({ value, onChange }: InteractiveStarsProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          onMouseEnter={() => setHover(starValue)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-5 w-5 transition-colors cursor-pointer ${
              starValue <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
      <span className="ml-1 self-center text-xs text-muted-foreground">{hover || value}/5</span>
    </div>
  )
}
