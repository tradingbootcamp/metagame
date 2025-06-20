import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { TicketFormFields } from './TicketFormFields';
import type { TicketType } from '../../lib/types';
import { SOCIAL_LINKS } from '../../config';

// Load Stripe outside of component to avoid recreating on every render
const stripeKey = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  throw new Error('PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = loadStripe(stripeKey);

interface TicketPurchaseFormProps {
  ticketType: TicketType;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentFormProps {
  ticketType: TicketType;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ ticketType, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; couponCode?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [finalPrice, setFinalPrice] = useState(ticketType.price);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; couponCode?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setErrors(prev => ({ ...prev, couponCode: 'Please enter a coupon code' }));
      return;
    }

    setIsApplyingCoupon(true);
    setErrors(prev => ({ ...prev, couponCode: undefined }));

    try {
      console.log('Applying coupon:', couponCode.trim());
      
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          ticketTypeId: ticketType.id,
        }),
      });

      const data = await response.json();
      console.log('Coupon validation response:', data);

      if (!data.valid) {
        console.log('Coupon invalid:', data.error);
        setErrors(prev => ({ ...prev, couponCode: data.error || 'Invalid coupon code' }));
        setAppliedCoupon(null);
        setFinalPrice(ticketType.price);
        return;
      }

      // Apply the coupon
      console.log('Coupon valid, applying...');
      setAppliedCoupon(data.coupon);
      setFinalPrice(data.discountedPrice / 100);
      setCouponCode(''); // Clear the input field
      setErrors(prev => ({ ...prev, couponCode: undefined }));
    } catch (error) {
      console.log('Error applying coupon:', error);
      setErrors(prev => ({ ...prev, couponCode: 'Failed to validate coupon' }));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFinalPrice(ticketType.price);
    setErrors(prev => ({ ...prev, couponCode: undefined }));
  };

  const handlePurchase = async () => {
    if (!stripe || !elements || !validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Step 1: Create payment intent
      const paymentIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketTypeId: ticketType.id,
          name,
          email,
          couponCode: appliedCoupon?.code || '',
        }),
      });

      if (!paymentIntentResponse.ok) {
        const responseText = await paymentIntentResponse.text();
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`API returned HTML instead of JSON. Status: ${paymentIntentResponse.status}. Response: ${responseText.substring(0, 200)}...`);
        }
        
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const responseText = await paymentIntentResponse.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`API returned invalid JSON. Response: ${responseText.substring(0, 200)}...`);
      }
      
      const { clientSecret, paymentIntentId: intentId } = responseData;
      setPaymentIntentId(intentId);

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Step 3: Confirm payment and create Airtable record
        const confirmResponse = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: intentId,
            name,
            email,
            ticketType: ticketType.title,
            price: ticketType.price,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (!confirmResponse.ok) {
          throw new Error(`Failed to confirm payment: ${confirmData.error || 'Unknown error'}`);
        }

        if (!confirmData.success) {
          throw new Error(confirmData.error || 'Payment confirmation failed');
        }

        setMessage('Payment successful! Your ticket has been purchased. Join our Discord, where all future communication will take place!');
        setShowSuccess(true);
      } else {
        throw new Error(`Payment was not successful. Status: ${paymentIntent?.status}`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setMessage('');
    onSuccess();
  };

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
  };

  return (
    <div className="space-y-6">
      {/* <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Purchase Details</h3>
        <p className="text-gray-300 mb-4">
          {ticketType.title} - ${ticketType.price}
        </p>
        <p className="text-sm text-gray-400">{ticketType.description}</p>
      </div> */}

      <TicketFormFields
        name={name}
        email={email}
        couponCode={couponCode}
        onNameChange={setName}
        onEmailChange={setEmail}
        onCouponChange={setCouponCode}
        onApplyCoupon={handleApplyCoupon}
        errors={errors}
        disabled={isLoading}
        isApplyingCoupon={isApplyingCoupon}
      />

      {/* Only show price breakdown when coupon is applied */}
      {appliedCoupon && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-3">
          {/* Original Price */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Ticket Price:</span>
            <span className="text-gray-300">${ticketType.price.toFixed(2)}</span>
          </div>

          {/* Applied Coupon */}
          <div className="flex justify-between items-center py-2 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-green-300 text-sm">Coupon: {appliedCoupon.code}</span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Remove coupon"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <span className="text-green-300 text-sm">
              -${Math.min(appliedCoupon.discountAmount / 100, ticketType.price).toFixed(2)}
            </span>
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            <span className="text-white font-semibold">Total:</span>
            <span className="text-white font-semibold text-lg">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Information *
        </label>
        <div className="border border-gray-600 rounded-md p-3 bg-gray-800">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md relative ${
          message.includes('successful') 
            ? 'bg-green-900 text-green-200 border border-green-700' 
            : 'bg-red-900 text-red-200 border border-red-700'
        }`}>
          {showSuccess && (
            <button
              onClick={handleCloseSuccess}
              className="absolute top-2 right-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Close success message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="mb-3">{message}</div>
          {message.includes('successful') && (
            <a
              href={SOCIAL_LINKS.DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
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
          className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handlePurchase}
          disabled={isLoading || !stripe}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : `Purchase $${finalPrice.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export const TicketPurchaseForm: React.FC<TicketPurchaseFormProps> = ({
  ticketType,
  onClose,
  onSuccess,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        ticketType={ticketType}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};