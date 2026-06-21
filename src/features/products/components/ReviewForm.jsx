import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { RatingStars } from '@/features/products/components/RatingStars'
import { reviewSchema } from '@/utils/validation'
import { reviewService } from '@/services/reviewService'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

export function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [error, setError] = useState('')
  const { toastSuccess } = useUIStore()
  const { user } = useAuthStore()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  })

  const onSubmit = async (data) => {
    if (!rating) return setError('Please select a star rating')
    setError('')
    try {
      await reviewService.submitReview(productId, { ...data, rating })
      toastSuccess('Review submitted! It will appear after moderation.')
      reset()
      setRating(0)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-background border border-border p-5 text-center">
        <p className="text-sm text-text-secondary mb-3">Sign in to leave a review</p>
        <a href="/login" className="btn-md btn-primary inline-flex">Sign in</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}

      <div>
        <p className="form-label mb-2">Your rating <span className="text-danger">*</span></p>
        <RatingStars
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>

      <Input
        label="Review title (optional)"
        placeholder="Summarise your experience"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Your review"
        placeholder="Share your experience with this product…"
        rows={4}
        required
        error={errors.body?.message}
        {...register('body')}
      />

      <Button type="submit" variant="primary" loading={isSubmitting}>
        Submit review
      </Button>
    </form>
  )
}

export default ReviewForm
