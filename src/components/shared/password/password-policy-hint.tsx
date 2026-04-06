import { getPasswordPolicyMessage } from "@/lib/password-policy"
import { cn } from "@/lib/utils"

type PasswordPolicyHintProps = {
  className?: string
  message?: string
}

export function PasswordPolicyHint({ className, message = getPasswordPolicyMessage() }: PasswordPolicyHintProps) {
  return (
    <div className={cn("bg-muted/40 border border-border rounded-lg p-3 text-sm text-muted-foreground", className)}>
      {message}
    </div>
  )
}
