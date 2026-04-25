"use client"

import { FavoriteEventsList } from "@/app/mis-favoritos/components/favorite-events-list"
import { FavoritesHero } from "@/app/mis-favoritos/components/favorites-hero"
import { FavoritesShell } from "@/app/mis-favoritos/components/favorites-shell"
import {
  FavoritesEmptyState,
  FavoritesErrorState,
  FavoritesLoadingState,
} from "@/app/mis-favoritos/components/favorites-states"
import { useFavoritesPage } from "@/app/mis-favoritos/hooks/use-favorites-page"
import { buildEventUrl } from "@/lib/event-url"

export default function MisFavoritosPage() {
  const {
    authModalOpen,
    isLogin,
    favoritos,
    loading,
    error,
    removingId,
    summaryText,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
    handleRemoveFavorite,
  } = useFavoritesPage()

  return (
    <FavoritesShell
      authModalOpen={authModalOpen}
      isLogin={isLogin}
      onAuthClick={openAuthModal}
      onCloseAuth={closeAuthModal}
      onToggleAuthMode={toggleAuthMode}
    >
      <section className="flex-grow pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FavoritesHero
            summaryText={summaryText}
            favoritesCount={favoritos.length}
            loading={loading}
            homeHref="/"
          />

          {loading && <FavoritesLoadingState />}

          {error && !loading && <FavoritesErrorState error={error} />}

          {!loading && !error && favoritos.length === 0 && (
            <FavoritesEmptyState exploreEventsHref="/eventos" />
          )}

          {!loading && favoritos.length > 0 && (
            <FavoriteEventsList
              favorites={favoritos}
              removingId={removingId}
              getEventHref={(event) =>
                buildEventUrl(event.id_publico_evento, event.nombre_evento, event.id_evento)
              }
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
        </div>
      </section>
    </FavoritesShell>
  )
}