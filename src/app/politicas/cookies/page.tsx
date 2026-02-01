import React from 'react'

export default function CookiePolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Política de Cookies</h1>
      <p className="mb-4">En Time2Go usamos cookies para distintos propósitos. Esta página describe qué cookies usamos, para qué sirven y cómo puedes gestionarlas.</p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Tipos de cookies</h2>
      <ul className="list-disc pl-6">
        <li><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (p. ej. sesión de autenticación HttpOnly).</li>
        <li><strong>Analíticas:</strong> recogen información anónima sobre el uso del sitio para mejorar la experiencia.</li>
        <li><strong>Publicidad/terceros:</strong> usadas para mostrar contenidos relevantes y medición.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Gestión de preferencias</h2>
      <p className="mb-4">Puedes aceptar o rechazar cookies no esenciales desde el banner que aparece en la esquina inferior. Si rechazas cookies, no almacenaremos datos de seguimiento ni persistiremos la sesión en almacenamiento local; la sesión HttpOnly seguirá siendo utilizada por el servidor cuando proceda.</p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Contacto</h2>
      <p>Si tienes preguntas sobre nuestra política de cookies, contacta con soporte en: soporte@time2go.local</p>
    </main>
  )
}
