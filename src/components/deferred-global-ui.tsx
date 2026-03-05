"use client"

import dynamic from "next/dynamic"

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  { ssr: false }
)

const CookieConsent = dynamic(
  () => import("@/components/cookie-consent"),
  { ssr: false }
)

export default function DeferredGlobalUI() {
  return (
    <>
      <ThemeToggle />
      <CookieConsent />
    </>
  )
}