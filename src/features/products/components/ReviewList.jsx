import { useState, useEffect } from 'react'
import { ThumbsUp, CheckCircle2 } from 'lucide-react'
import { RatingStars } from './RatingStars'
import { ReviewForm } from './ReviewForm'
import { Skeleton } from '@/components/ui/Skeleton'
import { Pagination } from '@/components/ui/Pagination'
import { reviewService } from '@/services/reviewService'
import { timeAgo } from '@/utils/date'
import { cn } from '@/utils/helpers'

function RatingBar({ count, total, stars }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-text-muted text-xs">{stars}★</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-warning rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-text-muted">{count}</span>
    </div>
  )
}

export function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const LIMIT = 5

  const load = (p = page) => {
    setLoading(true)
    Promise.all([
      reviewService.getProductReviews(productId, { page: p, limit: LIMIT }),
      reviewService.getRatingSummary(productId),
    ]).then(([{ reviews: r, total: t }, s]) => {
      setReviews(r)
      setTotal(t)
      setSummary(s)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [productId, page])

  const avgRating = summary ? Number(summary.avg_rating) : 0
  const reviewCount = summary ? Number(summary.review_count) : 0

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-text-primary">
          Customer Reviews
          {reviewCount > 0 && (
            <span className="ml-2 text-base font-normal text-text-muted">({reviewCount})</span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a review'}
        </button>
      </div>

      {/* Rating summary */}
      {summary && reviewCount > 0 && (
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-black text-text-primary">{avgRating.toFixed(1)}</p>
              <RatingStars rating={avgRating} size="md" className="justify-center my-1" />
              <p className="text-xs text-text-muted">{reviewCount} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5 w-full">
              {[5, 4, 3, 2, 1].map(s => (
                <RatingBar
                  key={s}
                  stars={s}
                  count={Number(summary[`${['one','two','three','four','five'][s-1]}_star`]) || 0}
                  total={reviewCount}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="card mb-8">
          <h3 className="font-semibold text-text-primary mb-4">Your Review</h3>
          <ReviewForm
            productId={productId}
            onSuccess={() => { setShowForm(false); load(1) }}
          />
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="font-medium text-text-primary mb-1">No reviews yet</p>
          <p className="text-sm">Be the first to review this product.</p>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-primary font-medium hover:underline">
              Write a review
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {reviews.map(review => (
              <div key={review.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {review.profiles?.full_name?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">
                          {review.profiles?.full_name || 'Anonymous'}
                        </p>
                        {review.is_verified && (
                          <span className="flex items-center gap-1 text-xs text-success font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified purchase
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{timeAgo(review.created_at)}</p>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                {review.title && (
                  <p className="font-semibold text-text-primary mb-1">{review.title}</p>
                )}
                <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>
              </div>
            ))}
          </div>

          {Math.ceil(total / LIMIT) > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / LIMIT)}
                onPageChange={(p) => { setPage(p); load(p) }}
              />
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ReviewList
