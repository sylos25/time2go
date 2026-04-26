"use client"

import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

import { EventExpandedModal } from "@/app/eventos/components/event-expanded-modal"
import { EventsGrid } from "@/app/eventos/components/events-grid"
import { EventsSearchFilters } from "./components/events-search-filters"
import { useEventsPage } from "@/app/eventos/hooks/use-events-page"

export default function EventosPage() {
  const {
    categories,
    eventTypes,
    departments,
    selectedImageByEvent,
    favoriteIds,
    favoritePendingIds,
    authModalOpen,
    isLogin,
    searchTerm,
    filters,
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
    setFilters,
    setCategoryFilter,
    setDepartmentFilter,
    clearFilters,
    setIsSearchFocused,
    setExpandedEventId,
    openAuthModal,
    toggleFavorite,
    handleShareEvent,
  } = useEventsPage()

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />

      <section className="relative overflow-visible pt-16 pb-10 lg:pt-20 lg:pb-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-emerald-50/70 to-transparent dark:from-emerald-950/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventsSearchFilters
            searchTerm={searchTerm}
            filters={filters}
            isSearchFocused={isSearchFocused}
            topRatedEvents={topRatedEvents}
            categories={categories}
            eventTypes={eventTypes}
            departments={departments}
            municipalities={municipalities}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategoryFilter}
            onEventTypeChange={(eventTypeId) =>
              setFilters((current) => ({ ...current, eventTypeId }))
            }
            onDepartmentChange={setDepartmentFilter}
            onMunicipalityChange={(municipalityId) =>
              setFilters((current) => ({ ...current, municipalityId }))
            }
            onDateFromChange={(startDate) =>
              setFilters((current) => ({ ...current, startDate }))
            }
            onDateToChange={(endDate) =>
              setFilters((current) => ({ ...current, endDate }))
            }
            onPriceModeChange={(priceMode) =>
              setFilters((current) => ({ ...current, priceMode }))
            }
            onMinPriceChange={(minPrice) =>
              setFilters((current) => ({ ...current, minPrice }))
            }
            onMaxPriceChange={(maxPrice) =>
              setFilters((current) => ({ ...current, maxPrice }))
            }
            onAvailabilityChange={(availability) =>
              setFilters((current) => ({ ...current, availability }))
            }
            onClearFilters={clearFilters}
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

      <section id="eventos-disponibles" className="relative z-10 pb-20 pt-8 lg:pt-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-700 tracking-tight text-foreground">
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
