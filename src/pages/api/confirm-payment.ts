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

    // Validate required fields
    if (!paymentIntentId || !name || !email || !ticketType || !price) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve payment intent from Stripe to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const success = paymentIntent.status === 'succeeded';

    if (!success) {
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
    const airtableRecord = formatAirtableRecord(
      name,
      email,
      ticketType,
      price,
      paymentIntentId,
      success
    );

    const airtableResult = await createTicketRecord(airtableRecord);

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
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 