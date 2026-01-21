'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, Flag } from 'lucide-react'
import { Review } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate, cn } from '@/lib/utils'
import { toast } from '@/stores/toastStore'

interface ProductReviewsProps {
  reviews: Review[]
  productId: string
  averageRating?: number
  onReviewAdded?: () => void
}

export function ProductReviews({
  reviews,
  productId,
  averageRating = 0,
  onReviewAdded,
}: ProductReviewsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 || 0,
  }))

  const handleWriteReview = () => {
    if (!session) {
      router.push('/connexion?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    setShowForm(!showForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, comment }),
      })

      const data = await response.json()

      if (data.success) {
        setShowForm(false)
        setRating(0)
        setTitle('')
        setComment('')
        toast.success(data.message)
        onReviewAdded?.()
        router.refresh()
      } else {
        setError(data.error)
        toast.error(data.error)
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Rating Summary */}
        <div className="flex items-start gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-text-primary">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-text-muted">
              {reviews.length} avis
            </p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2 flex-1 max-w-xs">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-12">
                  {star} étoile{star > 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: star * 0.1 }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-text-muted w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        <Button onClick={handleWriteReview}>
          {session ? 'Écrire un avis' : 'Connectez-vous pour donner votre avis'}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="p-6 bg-bg-secondary rounded-xl space-y-4"
        >
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Votre note *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isLoading}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 disabled:cursor-not-allowed"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Titre (optionnel)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Résumez votre avis en quelques mots"
            disabled={isLoading}
          />

          <Textarea
            label="Votre avis (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce produit..."
            rows={4}
            disabled={isLoading}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={rating === 0 || isLoading}>
              {isLoading ? 'Publication...' : 'Publier l\'avis'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </motion.form>
      )}

      {/* Sort */}
      <div className="flex items-center gap-4 border-b border-border-light pb-4">
        <span className="text-sm text-text-secondary">Trier par :</span>
        {[
          { value: 'recent', label: 'Plus récents' },
          { value: 'helpful', label: 'Plus utiles' },
          { value: 'rating', label: 'Note' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value as typeof sortBy)}
            className={cn(
              'text-sm transition-colors',
              sortBy === option.value
                ? 'text-text-primary font-medium'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center py-8 text-text-secondary">
            Aucun avis pour le moment. Soyez le premier à partager votre expérience !
          </p>
        ) : (
          reviews.map((review) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-6 border-b border-border-light last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center">
                    <span className="text-sm font-medium text-text-primary">
                      {review.user.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">
                        {review.user.name || 'Anonyme'}
                      </span>
                      {review.verified && (
                        <Badge variant="success" size="sm">
                          Achat vérifié
                        </Badge>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                      <span className="ml-2 text-sm text-text-muted">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h4 className="mt-3 font-medium text-text-primary">
                        {review.title}
                      </h4>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <p className="mt-2 text-text-secondary">
                        {review.comment}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      <button className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        Utile
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
                        <Flag className="h-4 w-4" />
                        Signaler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  )
}
