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
    goToHome,
    goToEvents,
    goToEventDetail,
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
      <section className="pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FavoritesHero
            summaryText={summaryText}
            favoritesCount={favoritos.length}
            loading={loading}
            onGoHome={goToHome}
          />

          {loading && <FavoritesLoadingState />}

          {error && !loading && <FavoritesErrorState error={error} />}

          {!loading && !error && favoritos.length === 0 && (
            <FavoritesEmptyState onExploreEvents={goToEvents} />
          )}

          {!loading && favoritos.length > 0 && (
            <FavoriteEventsList
              favorites={favoritos}
              removingId={removingId}
              onOpenDetail={goToEventDetail}
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
        </div>
      </section>
    </FavoritesShell>
  )
}