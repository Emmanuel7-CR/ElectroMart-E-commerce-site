import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CreditCard, MapPin, CheckCircle2 } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { CheckoutStepper } from '../components/CheckoutStepper'
import { AddressForm } from '../components/AddressForm'
import { OrderSummary } from '../components/OrderSummary'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/currency'
import { cn } from '@/utils/helpers'

const SHIPPING_THRESHOLD = 50000 // Free shipping above this

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()
  const { user, profile } = useAuthStore()
  const { toastSuccess, toastError } = useUIStore()

  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [couponData, setCouponData] = useState(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const cartSubtotal = subtotal()
  const shippingAmount = cartSubtotal >= SHIPPING_THRESHOLD ? 0 : 1500
  const discountAmount = couponData?.discountAmount || 0
  const total = cartSubtotal + shippingAmount - discountAmount

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) navigate('/cart')
  }, [items, navigate])

  // Load saved addresses
  useEffect(() => {
    if (!user) return
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setSavedAddresses(data)
          const def = data.find(a => a.is_default) || data[0]
          setSelectedAddressId(def.id)
          setShippingAddress(def)
        } else {
          setShowNewAddress(true)
        }
      })
  }, [user])

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr.id)
    setShippingAddress(addr)
    setShowNewAddress(false)
  }

  const handleNewAddressSubmit = async (data) => {
    try {
      const { data: saved, error } = await supabase
        .from('addresses')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      setSavedAddresses(prev => [...prev, saved])
      setSelectedAddressId(saved.id)
      setShippingAddress(saved)
      setShowNewAddress(false)
      toastSuccess('Address saved')
    } catch (err) {
      toastError(err.message || 'Failed to save address')
    }
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress) return
    setPlacingOrder(true)
    setPaymentError('')
    try {
      // 1. Create the order
      const order = await orderService.createOrder({
        items,
        shippingAddress,
        subtotal: cartSubtotal,
        shippingAmount,
        discountAmount,
        couponCode: couponData?.coupon?.code || null,
      })

      // 2. Initiate Paystack payment
      await paymentService.initializePayment({
        email: user.email,
        amount: total,
        reference: orderService.generatePaymentReference(order.id),
        orderId: order.id,
        onSuccess: async (response) => {
          try {
            await paymentService.recordTransaction({
              orderId: order.id,
              reference: response.reference,
              amount: total,
              status: 'success',
              gatewayResponse: response,
            })
            await paymentService.markOrderPaid(order.id)
            clearCart()
            toastSuccess('Payment successful! Your order is confirmed.')
            navigate(`/order-confirmation/${order.id}`)
          } catch (err) {
            toastError('Payment verified but order update failed. Contact support.')
          }
        },
        onClose: () => {
          setPaymentError('Payment was cancelled. Your order has been saved — you can complete payment from your orders page.')
          setPlacingOrder(false)
        },
      })
    } catch (err) {
      setPaymentError(err.message || 'Failed to place order. Please try again.')
      setPlacingOrder(false)
    }
  }

  if (items.length === 0) return null

  return (
    <>
      <SEO title="Checkout" noIndex />
      <div className="container-base py-8 max-w-5xl">
        <CheckoutStepper currentStep={step} />

        <div className="lg:grid lg:grid-cols-3 lg:gap-10 space-y-6 lg:space-y-0">
          {/* Main checkout area */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Step 1: Delivery Address ── */}
            {step === 1 && (
              <div className="card animate-fade-in">
                <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </h2>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-5">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr)}
                        className={cn(
                          'w-full text-left p-4 rounded-xl border-2 transition-all',
                          selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-text-primary">{addr.full_name}</p>
                              {addr.label && (
                                <span className="px-2 py-0.5 bg-border rounded-full text-xs text-text-muted">{addr.label}</span>
                              )}
                              {addr.is_default && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary">
                              {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state}
                            </p>
                            <p className="text-sm text-text-secondary">{addr.phone}</p>
                          </div>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                            selectedAddressId === addr.id ? 'border-primary bg-primary' : 'border-border'
                          )}>
                            {selectedAddressId === addr.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Toggle new address form */}
                {!showNewAddress ? (
                  <button
                    onClick={() => setShowNewAddress(true)}
                    className="text-sm text-primary font-medium hover:text-primary-hover transition-colors flex items-center gap-1.5"
                  >
                    + Add a new address
                  </button>
                ) : (
                  <div className="border-t border-border pt-5">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">New address</h3>
                    <AddressForm
                      defaultValues={{ full_name: profile?.full_name || '', phone: profile?.phone || '' }}
                      onSubmit={handleNewAddressSubmit}
                      submitLabel="Save & use this address"
                    />
                    {savedAddresses.length > 0 && (
                      <button onClick={() => setShowNewAddress(false)} className="mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {/* Next */}
                {shippingAddress && !showNewAddress && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setStep(2)}
                      rightIcon={ArrowRight}
                    >
                      Continue to review
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Review Order ── */}
            {step === 2 && (
              <div className="card animate-fade-in">
                <h2 className="text-lg font-semibold text-text-primary mb-6">Review your order</h2>

                {/* Delivery address summary */}
                <div className="rounded-xl bg-background border border-border p-4 mb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Delivering to</p>
                      <p className="text-sm font-medium text-text-primary">{shippingAddress.full_name}</p>
                      <p className="text-sm text-text-secondary">
                        {shippingAddress.address_line1}, {shippingAddress.city}, {shippingAddress.state}
                      </p>
                      <p className="text-sm text-text-secondary">{shippingAddress.phone}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-primary font-medium hover:text-primary-hover transition-colors">
                      Change
                    </button>
                  </div>
                </div>

                {/* Shipping info */}
                <div className="rounded-xl bg-background border border-border p-4 mb-5">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Shipping</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">Standard delivery (3–5 business days)</p>
                    <p className={cn('text-sm font-semibold', shippingAmount === 0 ? 'text-success' : 'text-text-primary')}>
                      {shippingAmount === 0 ? 'Free' : formatCurrency(shippingAmount)}
                    </p>
                  </div>
                  {shippingAmount > 0 && (
                    <p className="text-xs text-text-muted mt-1">
                      Add {formatCurrency(SHIPPING_THRESHOLD - cartSubtotal)} more for free shipping
                    </p>
                  )}
                </div>

                {/* Order items list */}
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.key} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">{item.name[0]}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                        {item.variant_name && <p className="text-xs text-text-muted">{item.variant_name}</p>}
                        <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-text-primary shrink-0">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" onClick={() => setStep(1)} leftIcon={ArrowLeft}>
                    Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={() => setStep(3)} rightIcon={ArrowRight} className="flex-1">
                    Continue to payment
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Payment ── */}
            {step === 3 && (
              <div className="card animate-fade-in">
                <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment
                </h2>

                <div className="rounded-xl bg-background border border-border p-4 mb-6 space-y-2">
                  <p className="text-sm font-semibold text-text-primary">You will pay: {formatCurrency(total)}</p>
                  <p className="text-xs text-text-secondary">
                    Secured by Paystack. You'll be redirected to complete payment.
                    Your card details are never stored on our servers.
                  </p>
                </div>

                {/* Accepted payment methods */}
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-xs text-text-muted">Accepted:</p>
                  {['Visa', 'Mastercard', 'Bank Transfer', 'USSD'].map(m => (
                    <span key={m} className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium text-text-secondary">
                      {m}
                    </span>
                  ))}
                </div>

                {paymentError && (
                  <Alert variant="warning" className="mb-4" onDismiss={() => setPaymentError('')}>
                    {paymentError}
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" onClick={() => setStep(2)} leftIcon={ArrowLeft}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePlaceOrder}
                    loading={placingOrder}
                    leftIcon={CreditCard}
                    className="flex-1"
                  >
                    Pay {formatCurrency(total)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                subtotal={cartSubtotal}
                shippingAmount={shippingAmount}
                discountAmount={discountAmount}
                coupon={couponData}
                onCouponApply={(data) => setCouponData(data)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
