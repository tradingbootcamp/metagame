import React from 'react'

import { TicketPurchaseFormData } from '@/lib/schemas/ticket'

interface TicketFormFieldsProps {
  formData: TicketPurchaseFormData
  onFormDataChange: (
    field: keyof TicketFormFieldsProps['formData'],
    value: string,
  ) => void
  onApplyCoupon: () => void
  errors: {
    name?: string
    email?: string
    couponCode?: string
  }
  disabled?: boolean
  isApplyingCoupon?: boolean
  couponsEnabled?: boolean
}

export const TicketFormFields: React.FC<TicketFormFieldsProps> = ({
  formData,
  onFormDataChange,
  onApplyCoupon,
  errors,
  disabled = false,
  isApplyingCoupon = false,
  couponsEnabled = true,
}) => {
  // Ensure couponCode is always a string
  const safeCouponCode = formData.couponCode || ''

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          disabled={disabled}
          className={`w-full rounded-md border border-gray-600 bg-bg-secondary px-3 py-2 transition-colors focus:border-primary-300 focus:ring-1 focus:ring-primary-300 focus:outline-none ${
            errors.name ? 'border-red-500' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-300"
        >
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => onFormDataChange('email', e.target.value)}
          disabled={disabled}
          className={`w-full rounded-md border border-gray-600 bg-bg-secondary px-3 py-2 transition-colors focus:border-primary-300 focus:ring-1 focus:ring-primary-300 focus:outline-none ${
            errors.email ? 'border-red-500' : ''
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          placeholder="Enter your email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>
      {couponsEnabled && (
        <div>
          <label
            htmlFor="couponCode"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Coupon Code (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="couponCode"
              value={safeCouponCode}
              onChange={(e) =>
                onFormDataChange('couponCode', e.target.value.toUpperCase())
              }
              disabled={disabled || isApplyingCoupon}
              className={`flex-1 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 transition-colors focus:border-primary-300 focus:ring-1 focus:ring-primary-300 focus:outline-none ${
                errors.couponCode ? 'border-red-500' : ''
              } ${disabled || isApplyingCoupon ? 'cursor-not-allowed opacity-50' : ''}`}
              placeholder="Enter coupon code"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={disabled || isApplyingCoupon || !safeCouponCode.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isApplyingCoupon ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {errors.couponCode && (
            <p className="mt-1 text-sm text-red-400">{errors.couponCode}</p>
          )}
        </div>
      )}
    </div>
  )
}
