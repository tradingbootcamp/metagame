'use client'

import React, { useState } from 'react'

import {
  type TicketPurchaseFormData,
  paymentConfirmationSchema,
  paymentIntentSchema,
  ticketPurchaseSchema,
} from '../../lib/schemas/ticket'
import type { TicketType } from '../../lib/types'
import { SOCIAL_LINKS } from '../../utils/urls'
import { TicketFormFields } from './TicketFormFields'
import { PaymentCurrency } from './Tickets'
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { XIcon } from 'lucide-react'
import { ZodError } from 'zod'

import { ValidatedCoupon, isTicketTypeEligibleForCoupons } from '@/lib/coupons'
import { validateCouponResultSchema } from '@/lib/coupons'

import { getHostedCheckoutUrl } from '@/utils/opennode'

import { validateCouponBodySchema } from '@/app/api/validate-coupon/reqSchema'

import { getDayPassTicketType } from '@/config/tickets'
import { DbTicketType } from '@/types/database/dbTypeAliases'

// Load Stripe outside of component to avoid recreating on every render
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!stripeKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
}

const stripePromise = loadStripe(stripeKey)

interface PaymentFormProps {
  ticketType: TicketType
  onClose: () => void
  paymentMethod: PaymentCurrency
  selectedUsdPrice?: number
  selectedBtcPrice?: number
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  ticketType,
  onClose,
  paymentMethod,
  selectedUsdPrice,
  selectedBtcPrice,
}) => {
  const stripe = useStripe()
  const elements = useElements()

  const [formData, setFormData] = useState<TicketPurchaseFormData>({
    name: '',
    email: '',
    couponCode: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof TicketPurchaseFormData, string>>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(
    null,
  )
  const [finalPrice, setFinalPrice] = useState(
    selectedUsdPrice ?? ticketType.priceUSD,
  )
  const isBtc = paymentMethod === 'btc'
  const btcAmount = selectedBtcPrice ?? ticketType.priceBTC
  const couponsEnabled =
    isTicketTypeEligibleForCoupons(ticketType.id as DbTicketType) && !isBtc

  const validateForm = (): boolean => {
    try {
      // Validate the form data using the schema (with ticketTypeId added)
      ticketPurchaseSchema.parse({
        ...formData,
        ticketTypeId: ticketType.id,
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          const fieldName = String(err.path[0])
          // Skip ticketTypeId errors since it's not a form field
          if (fieldName !== 'ticketTypeId') {
            newErrors[fieldName] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponsEnabled) {
      setErrors((prev) => ({
        ...prev,
        couponCode: 'Coupons are not available for this ticket type',
      }))
      return
    }

    if (!formData.couponCode?.trim()) {
      setErrors((prev) => ({
        ...prev,
        couponCode: 'Please enter a coupon code',
      }))
      return
    }

    setIsApplyingCoupon(true)
    setErrors((prev) => {
      return {
        ...prev,
        couponCode: '',
      }
    })

    try {
      // Prepare coupon data
      const { data: couponData, error: couponError } =
        validateCouponBodySchema.safeParse({
          couponCode: formData.couponCode,
          ticketTypeId: ticketType.id,
          userEmail: formData.email || undefined,
        })
      if (couponError) {
        setErrors((prev) => ({
          ...prev,
          couponCode: couponError.issues
            .map((issue) => issue.message)
            .join(', '),
        }))
        return
      }
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      })

      if (!response.ok) {
        const responseText = await response.text()

        let errorData: { error?: string } | null = null
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.error(e)
        }

        setErrors((prev) => ({
          ...prev,
          couponCode: errorData?.error || `API error (${response.status})`,
        }))
        setAppliedCoupon(null)
        setFinalPrice(ticketType.priceUSD)
        return
      }

      const data = await response.json()
      const parsedData = validateCouponResultSchema.parse(data)
      if (!parsedData.valid) {
        setErrors((prev) => ({
          ...prev,
          couponCode: parsedData.error || 'Invalid coupon code',
        }))
        setAppliedCoupon(null)
        setFinalPrice(ticketType.priceUSD)
        return
      }

      // Apply the coupon
      setAppliedCoupon(parsedData.coupon)
      setFinalPrice(parsedData.newPriceCents / 100)
      setErrors((prev) => ({
        ...prev,
        couponCode: '',
      }))
    } catch (error) {
      console.error('Error applying coupon:', error)
      setErrors((prev) => ({
        ...prev,
        couponCode: `Failed to validate coupon: ${error}`,
      }))
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setFinalPrice(ticketType.priceUSD)
    setErrors((prev) => ({
      ...prev,
      couponCode: '',
    }))
  }

  const handlePurchaseFiat = async () => {
    console.log('handlePurchase')
    if (!stripe || !elements || !validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      console.log('creating payment intent')
      // Prepare payment intent data using schema
      const paymentIntentData = paymentIntentSchema.parse({
        ticketTypeId: ticketType.id,
        name: formData.name,
        email: formData.email,
        couponCode: appliedCoupon?.code || '',
      })

      // Step 1: Create payment intent

      const paymentIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentIntentData),
      })
      if (!paymentIntentResponse.ok) {
        const responseText = await paymentIntentResponse.text()

        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.error(e)
          throw new Error(
            `API returned HTML instead of JSON. Status: ${paymentIntentResponse.status}. Response: ${responseText.substring(0, 200)}...`,
          )
        }

        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const responseText = await paymentIntentResponse.text()

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        console.error(e)
        throw new Error(
          `API returned invalid JSON. Response: ${responseText.substring(0, 200)}...`,
        )
      }

      const { clientSecret, paymentIntentId: intentId } = responseData

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.name,
              email: formData.email,
            },
          },
        })

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed')
      }

      if (paymentIntent?.status === 'succeeded') {
        // Step 3: Confirm payment and create Airtable record
        const confirmData = paymentConfirmationSchema.parse({
          paymentIntentId: intentId,
          name: formData.name,
          email: formData.email,
          ticketType: ticketType.id,
          price: finalPrice,
        })

        const confirmResponse = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(confirmData),
        })

        const confirmResponseData = await confirmResponse.json()

        if (!confirmResponse.ok) {
          throw new Error(
            `Failed to confirm payment: ${confirmResponseData.error || 'Unknown error'}`,
          )
        }

        if (!confirmResponseData.success) {
          throw new Error(
            confirmResponseData.error || 'Payment confirmation failed',
          )
        }

        setMessage(
          `Payment successful! Your ticket has been purchased. Ticket confirmation details and information for making your account on Metagame will be emailed to ${formData.email}. Join our Discord, where all future communication will take place!`,
        )
        setShowSuccess(true)
      } else {
        throw new Error(
          `Payment was not successful. Status: ${paymentIntent?.status}`,
        )
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseBtc = async () => {
    if (!validateForm()) {
      return
    }
    setIsLoading(true)
    setMessage('')

    try {
      if (!btcAmount) {
        throw new Error('No BTC amount found for ticket type: ' + ticketType.id)
      }
      const amountBtc = Number(btcAmount.toFixed(6))
      // const isTest = (process.env.NEXT_PUBLIC_OPENNODE_ENV || 'dev') !== 'live';
      const response = await fetch('/api/checkout/opennode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountBtc,
          ticketDetails: {
            ticketType: ticketType.id,
            isTest: process.env.NEXT_PUBLIC_OPENNODE_ENV === 'dev',
            purchaserEmail: formData.email,
            purchaserName: formData.name,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create Bitcoin charge')
      }

      const data = await response.json()
      const charge = data.charge || data?.data || data // defensive

      const hostedUrl = getHostedCheckoutUrl(charge.id)

      if (!hostedUrl) {
        throw new Error('Failed to get OpenNode checkout URL')
      }

      window.location.href = hostedUrl
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setMessage('')
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }
  const headerTicketType =
    ticketType.id === 'dayPass'
      ? (getDayPassTicketType(ticketType.id) ?? ticketType)
      : ticketType
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex flex-col items-center gap-2">
        <span className="text-center text-3xl font-bold text-primary-300">
          {headerTicketType.title}
        </span>
        <span className="text-center text-sm text-gray-400">
          {headerTicketType.description}
        </span>
      </div>
      <TicketFormFields
        formData={formData}
        onFormDataChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
        onApplyCoupon={handleApplyCoupon}
        errors={errors}
        disabled={isLoading}
        isApplyingCoupon={isApplyingCoupon}
        couponsEnabled={couponsEnabled}
      />

      {/* Only show price breakdown when coupon is applied (fiat only) */}
      {!isBtc && appliedCoupon && (
        <div className="flex flex-col rounded-lg bg-gray-800 p-4">
          {/* Original Price */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Ticket Price:</span>
            <span className="text-gray-300">
              ${ticketType.priceUSD.toFixed(2)}
            </span>
          </div>

          {/* Separator */}
          <div className="my-1 border-t border-gray-700" />

          {/* Applied Coupon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-300">
                Coupon: {appliedCoupon.code}
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-red-400 transition-colors"
                title="Remove coupon"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <span className="text-green-300">
              -$
              {Math.min(
                appliedCoupon.discountAmountCents / 100,
                ticketType.priceUSD,
              ).toFixed(2)}
            </span>
          </div>

          {/* Separator */}
          <div className="my-1 border-t border-gray-700" />

          {/* Total Price */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-semibold">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {!isBtc && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Payment Information *
          </label>
          <div className="rounded-md border border-gray-600 bg-gray-800 p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      {isBtc && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-gray-800 p-2">
            <span className="text-gray-300">Amount:</span>
            <span className="font-semibold">
              {btcAmount?.toFixed(6) ?? '?'} BTC
            </span>
          </div>
          <p className="rounded-lg bg-gray-800 p-2 text-sm text-gray-400">
            Click <span className="font-semibold">Continue</span> to begin your
            Bitcoin payment. An open transaction request will be created and you
            will be redirected to a secure checkout page with the destination
            address to complete it. Your ticket will be sent the email above
            once payment is confirmed.
          </p>
        </div>
      )}

      {message && (
        <div
          className={`relative flex flex-col items-center rounded-md p-3 ${
            message.includes('successful')
              ? 'border border-green-700 bg-green-900 text-green-200'
              : 'border border-red-700 bg-red-900 text-red-200'
          }`}
        >
          {showSuccess && (
            <button
              onClick={handleCloseSuccess}
              className="absolute top-2 right-2 text-gray-300 transition-colors hover:text-white"
              aria-label="Close success message"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <div className="mb-3">{message}</div>
          {message.includes('successful') && (
            <a
              href={SOCIAL_LINKS.DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-indigo-700"
            >
              Join Discord Server
            </a>
          )}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 rounded-md border border-gray-600 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        {isBtc ? (
          <button
            onClick={handlePurchaseBtc}
            disabled={isLoading}
            className="flex-1 rounded-md bg-primary-600 px-4 py-2 transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Continue`}
          </button>
        ) : (
          <button
            onClick={handlePurchaseFiat}
            disabled={isLoading || !stripe}
            className="flex-1 rounded-md bg-primary-600 px-4 py-2 transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Purchase $${finalPrice.toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  )
}

export const TicketPurchaseForm: React.FC<PaymentFormProps> = ({
  ticketType,
  onClose,
  paymentMethod = 'usd',
  selectedUsdPrice,
  selectedBtcPrice,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        ticketType={ticketType}
        onClose={onClose}
        paymentMethod={paymentMethod}
        selectedUsdPrice={selectedUsdPrice}
        selectedBtcPrice={selectedBtcPrice}
      />
    </Elements>
  )
}
