# Ticket Purchase System Setup Guide

This guide explains how to set up the new local ticket purchase system with Stripe integration and Airtable record creation.

## Overview

The new system allows users to purchase tickets directly on your website without being redirected to external Stripe links. The flow is:

1. User clicks "Buy Now" on a ticket card
2. Form expands with name/email fields and Stripe payment form
3. User fills out information and completes payment
4. Payment is processed through Stripe
5. Airtable record is created with purchase details

## Required Dependencies

The following packages have been added to `package.json`:
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe SDK
- `@stripe/react-stripe-js` - React components for Stripe
- `airtable` - Airtable SDK for record creation

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Airtable Configuration (using Personal Access Token)
AIRTABLE_PAT=pat_your_airtable_personal_access_token_here
AIRTABLE_BASE_ID=app_your_airtable_base_id_here
AIRTABLE_TABLE_NAME=Tickets

# Optional: Stripe Webhook Secret (for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your `.env` file
4. For production, use live keys instead of test keys

### 3. Airtable Setup

1. Create an Airtable base for your tickets
2. Create a table named "Tickets" with the following fields:
   - Name (Single line text)
   - Email (Email)
   - Ticket Type (Single line text)
   - Price (Number)
   - Stripe Payment ID (Single line text)
   - Purchase Date (Date)
   - Status (Single select: Success, Failed)
3. **Create a Personal Access Token (PAT):**
   - Go to https://airtable.com/create/tokens
   - Click "Create new token"
   - Give it a name (e.g., "Metagame Ticket System")
   - Set scopes to include your base with "data.records:read" and "data.records:write"
   - Copy the generated PAT (starts with `pat_`)
4. Get your Base ID from the Airtable API documentation or URL
5. Add the PAT and Base ID to your `.env` file

**Important:** Airtable has moved from API keys to Personal Access Tokens (PATs). The old API keys are deprecated and will stop working.

### 4. Deploy Environment Variables

If deploying to Vercel, Netlify, or another platform, add the environment variables to your deployment settings.

## File Structure

```
src/
├── components/tickets/
│   ├── TicketCard.tsx           # Main ticket card component
│   ├── TicketPurchaseForm.tsx   # Purchase form with Stripe
│   └── TicketFormFields.tsx     # Reusable form fields
├── pages/api/
│   ├── create-payment-intent.ts # Stripe payment intent creation
│   └── confirm-payment.ts       # Payment confirmation & Airtable
├── lib/
│   ├── stripe.ts                # Stripe utilities
│   ├── airtable.ts              # Airtable utilities
│   └── types.ts                 # TypeScript interfaces
└── config/
    └── tickets.ts               # Ticket configuration
```

## Ticket Configuration

Tickets are configured in `src/config/tickets.ts`. You can easily modify:
- Ticket types and prices
- Descriptions and features
- Regular vs sale prices

## Security Considerations

- All payment processing happens server-side
- Environment variables are used for sensitive data
- Input validation is implemented on both client and server
- CORS protection is in place for API routes
- Personal Access Tokens provide more granular permissions than old API keys

## Testing

1. Use Stripe test cards for development:
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
2. Test the complete flow from purchase to Airtable record creation
3. Verify error handling with invalid inputs

## Troubleshooting

### Common Issues

1. **"Cannot find module 'stripe'"** - Run `npm install` to install dependencies
2. **Payment fails** - Check Stripe keys and ensure they're correct
3. **Airtable record not created** - Verify Airtable PAT and table name
4. **Environment variables not working** - Ensure `.env` file is in project root
5. **Airtable authentication fails** - Make sure you're using a PAT (not an old API key)

### Debug Mode

Add console logs in the API routes to debug issues:
- Check payment intent creation
- Verify payment confirmation
- Monitor Airtable record creation

## Production Deployment

1. Switch to Stripe live keys
2. Set up proper error monitoring
3. Configure webhooks for payment confirmation (optional)
4. Test the complete flow in production environment

## Maintenance

- Monitor Stripe dashboard for failed payments
- Check Airtable for successful records
- Update ticket prices in `src/config/tickets.ts` as needed
- Keep dependencies updated
- Regularly rotate Personal Access Tokens for security

## Support

For issues with:
- **Stripe**: Check Stripe documentation and dashboard
- **Airtable**: Verify PAT permissions and table structure
- **Code**: Review console logs and API responses 