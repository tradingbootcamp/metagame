import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { TicketFormFields } from './TicketFormFields';
import type { TicketType } from '../../lib/types';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

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
        }),
      });

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId: intentId } = await paymentIntentResponse.json();
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
        console.log('Payment succeeded, confirming with server...');
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
        console.log('Confirm response:', confirmData);

        if (!confirmResponse.ok) {
          throw new Error(`Failed to confirm payment: ${confirmData.error || 'Unknown error'}`);
        }

        if (!confirmData.success) {
          throw new Error(confirmData.error || 'Payment confirmation failed');
        }

        setMessage('Payment successful! Your ticket has been purchased.');
        setTimeout(() => {
          onSuccess();
        }, 5000);
      } else {
        throw new Error(`Payment was not successful. Status: ${paymentIntent?.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Purchase Details</h3>
        <p className="text-gray-300 mb-4">
          {ticketType.title} - ${ticketType.price}
        </p>
        <p className="text-sm text-gray-400">{ticketType.description}</p>
      </div>

      <TicketFormFields
        name={name}
        email={email}
        onNameChange={setName}
        onEmailChange={setEmail}
        errors={errors}
        disabled={isLoading}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Information *
        </label>
        <div className="border border-gray-600 rounded-md p-3 bg-gray-800">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('successful') 
            ? 'bg-green-900 text-green-200 border border-green-700' 
            : 'bg-red-900 text-red-200 border border-red-700'
        }`}>
          {message}
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
          {isLoading ? 'Processing...' : `Purchase $${ticketType.price}`}
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