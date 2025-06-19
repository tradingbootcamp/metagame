// Force ROLLUP_SKIP_NATIVE to prevent native module errors
if (!process.env.ROLLUP_SKIP_NATIVE) {
  process.env.ROLLUP_SKIP_NATIVE = 'true';
}

import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';
import { createTicketRecord, formatAirtableRecord } from '../../lib/airtable';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { paymentIntentId, name, email, ticketType, price } = body;

    console.log('Confirm payment request received:', { paymentIntentId, name, email, ticketType, price });

    // Validate required fields
    if (!paymentIntentId || !name || !email || !ticketType || !price) {
      console.error('Missing required fields:', { paymentIntentId, name, email, ticketType, price });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve payment intent from Stripe to check its status
    console.log('Retrieving payment intent from Stripe:', paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('Payment intent status:', paymentIntent.status);
    console.log('Payment intent amount:', paymentIntent.amount);
    console.log('Payment intent currency:', paymentIntent.currency);

    const success = paymentIntent.status === 'succeeded';

    if (!success) {
      console.error('Payment not succeeded. Status:', paymentIntent.status);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Payment not succeeded. Status: ${paymentIntent.status}`,
          paymentIntentId 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Airtable record
    console.log('Creating Airtable record for successful payment');
    const airtableRecord = formatAirtableRecord(
      name,
      email,
      ticketType,
      price,
      paymentIntentId,
      success
    );

    const airtableResult = await createTicketRecord(airtableRecord);
    console.log('Airtable record created:', airtableResult.recordId);

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId,
        airtableRecordId: airtableResult.recordId,
        message: 'Payment successful! Your ticket has been purchased.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in confirm-payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 