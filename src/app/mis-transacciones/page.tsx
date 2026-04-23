"use client"

import { TransactionsHero } from "@/app/mis-transacciones/components/transactions-hero"
import { TransactionsList } from "@/app/mis-transacciones/components/transactions-list"
import { TransactionsShell } from "@/app/mis-transacciones/components/transactions-shell"
import {
  TransactionsEmptyState,
  TransactionsErrorState,
  TransactionsLoadingState,
} from "@/app/mis-transacciones/components/transactions-states"
import { useMyTransactionsPage } from "@/app/mis-transacciones/hooks/use-my-transactions-page"

export default function MisTransaccionesPage() {
  const { loading, error, transacciones, summaryText, goToHome } = useMyTransactionsPage()

  return (
    <TransactionsShell>
      <section className="flex-grow pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TransactionsHero
            loading={loading}
            count={transacciones.length}
            summaryText={summaryText}
            onGoHome={goToHome}
          />

          {loading && <TransactionsLoadingState />}

          {error && !loading && <TransactionsErrorState error={error} />}

          {!loading && !error && transacciones.length === 0 && <TransactionsEmptyState />}

          {!loading && !error && transacciones.length > 0 && (
            <TransactionsList transacciones={transacciones} />
          )}
        </div>
      </section>
    </TransactionsShell>
  )
}
