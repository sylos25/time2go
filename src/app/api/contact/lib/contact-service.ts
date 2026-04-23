import { sendContactMessageEmail } from "@/lib/email"

import type { ContactPayload } from "@/app/api/contact/lib/contact-validation"

export async function sendContactMessage(payload: ContactPayload): Promise<boolean> {
  return await sendContactMessageEmail(payload)
}
