import { Check } from 'lucide-react'
import { cn } from '@/utils/helpers'

const STEPS = [
  { id: 1, label: 'Delivery' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Payment' },
]

export function CheckoutStepper({ currentStep }) {
  return (
    <nav aria-label="Checkout steps" className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const done = currentStep > step.id
        const active = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-200',
                done  && 'bg-primary border-primary text-white',
                active && 'bg-surface border-primary text-primary shadow-sm',
                !done && !active && 'bg-surface border-border text-text-muted'
              )}>
                {done ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={cn(
                'text-xs font-medium',
                active ? 'text-primary' : done ? 'text-text-secondary' : 'text-text-muted'
              )}>
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className={cn(
                'w-16 sm:w-24 h-0.5 mb-5 mx-2 transition-colors',
                currentStep > step.id ? 'bg-primary' : 'bg-border'
              )} aria-hidden="true" />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default CheckoutStepper
