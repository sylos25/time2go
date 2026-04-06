"use client"

import { DeleteRatingDialog } from "@/app/mis-valoraciones/components/delete-rating-dialog"
import { RatingsHero } from "@/app/mis-valoraciones/components/ratings-hero"
import { RatingsList } from "@/app/mis-valoraciones/components/ratings-list"
import { RatingsShell } from "@/app/mis-valoraciones/components/ratings-shell"
import {
  RatingsEmptyState,
  RatingsErrorState,
  RatingsLoadingState,
} from "@/app/mis-valoraciones/components/ratings-states"
import { useMyRatingsPage } from "@/app/mis-valoraciones/hooks/use-my-ratings-page"

export default function MisValoracionesPage() {
  const {
    authModalOpen,
    isLogin,
    valoraciones,
    loading,
    error,
    confirmId,
    deleting,
    editingId,
    editRating,
    editComment,
    savingEdit,
    editError,
    editSuccess,
    summaryText,
    averageText,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
    goToHome,
    goToEvents,
    goToEvent,
    startEdit,
    cancelEdit,
    setEditRating,
    updateEditComment,
    saveEdit,
    requestDelete,
    cancelDelete,
    handleDelete,
  } = useMyRatingsPage()

  return (
    <RatingsShell
      authModalOpen={authModalOpen}
      isLogin={isLogin}
      onAuthClick={openAuthModal}
      onCloseAuth={closeAuthModal}
      onToggleAuthMode={toggleAuthMode}
    >
      <section className="flex-grow pt-28 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RatingsHero
            loading={loading}
            count={valoraciones.length}
            summaryText={summaryText}
            averageText={averageText}
            onGoHome={goToHome}
          />

          {loading && <RatingsLoadingState />}

          {error && !loading && <RatingsErrorState error={error} />}

          {!loading && !error && valoraciones.length === 0 && (
            <RatingsEmptyState onExploreEvents={goToEvents} />
          )}

          {!loading && !error && valoraciones.length > 0 && (
            <RatingsList
              valoraciones={valoraciones}
              editingId={editingId}
              editRating={editRating}
              editComment={editComment}
              savingEdit={savingEdit}
              editError={editError}
              editSuccess={editSuccess}
              onGoToEvent={goToEvent}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onEditRatingChange={setEditRating}
              onEditCommentChange={updateEditComment}
              onSaveEdit={saveEdit}
              onRequestDelete={requestDelete}
            />
          )}
        </div>
      </section>

      <DeleteRatingDialog
        open={confirmId !== null}
        deleting={deleting}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
      />
    </RatingsShell>
  )
}
