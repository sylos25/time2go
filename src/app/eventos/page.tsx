"use client"

import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

import { EventExpandedModal } from "@/app/eventos/components/event-expanded-modal"
import { EventsGrid } from "@/app/eventos/components/events-grid"
import { EventsSearchFilters } from "@/app/eventos/components/events-search-filters"
import { useEventsPage } from "@/app/eventos/hooks/use-events-page"

export default function EventosPage() {
  const {
    categories,
    selectedImageByEvent,
    favoriteIds,
    favoritePendingIds,
    authModalOpen,
    isLogin,
    searchTerm,
    selectedFilterType,
    selectedFilterValue,
    isSearchFocused,
    copiedEventId,
    filteredEvents,
    topRatedEvents,
    municipalities,
    expandedEvent,
    setSelectedImageByEvent,
    setAuthModalOpen,
    setIsLogin,
    setSearchTerm,
    setSelectedFilterValue,
    setIsSearchFocused,
    setExpandedEventId,
    handleFilterTypeChange,
    openAuthModal,
    toggleFavorite,
    handleShareEvent,
  } = useEventsPage()

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={openAuthModal} />

      <section className="relative overflow-visible pt-16 pb-8 lg:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-emerald-50/70 to-transparent dark:from-emerald-950/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventsSearchFilters
            searchTerm={searchTerm}
            selectedFilterType={selectedFilterType}
            selectedFilterValue={selectedFilterValue}
            isSearchFocused={isSearchFocused}
            topRatedEvents={topRatedEvents}
            categories={categories}
            municipalities={municipalities}
            onSearchChange={setSearchTerm}
            onFilterTypeChange={handleFilterTypeChange}
            onFilterValueChange={setSelectedFilterValue}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => window.setTimeout(() => setIsSearchFocused(false), 200)}
          />
        </div>
      </section>

      {expandedEvent && (
        <EventExpandedModal
          event={expandedEvent}
          onClose={() => setExpandedEventId(null)}
        />
      )}

      <section id="eventos-disponibles" className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Eventos Disponibles ({filteredEvents.length})
            </h2>
          </div>

          <EventsGrid
            events={filteredEvents}
            selectedImageByEvent={selectedImageByEvent}
            favoriteIds={favoriteIds}
            favoritePendingIds={favoritePendingIds}
            copiedEventId={copiedEventId}
            onSelectImage={(eventId, index) =>
              setSelectedImageByEvent((prev) => ({
                ...prev,
                [eventId]: index,
              }))
            }
            onToggleFavorite={toggleFavorite}
            onShareEvent={handleShareEvent}
            getViewDetailsHref={(eventId) =>
              `/eventos/${eventId}?returnTo=${encodeURIComponent("/eventos#eventos-disponibles")}`
            }
          />
        </div>
      </section>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        isLogin={isLogin}
        onToggleMode={() => setIsLogin((prev) => !prev)}
      />
    </main>
  )
}
