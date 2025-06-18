import type { APIRoute } from 'astro';
import { createPaymentIntent } from '../../lib/stripe';
import { getTicketType } from '../../config/tickets';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('API route called: /api/create-payment-intent');
    
    // Check environment variables
    console.log('Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasAirtablePat: !!process.env.AIRTABLE_PAT,
      hasAirtableBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasAirtableTableName: !!process.env.AIRTABLE_TABLE_NAME,
    });

    const body = await request.json();
    console.log('Request body:', body);
    
    const { ticketTypeId, name, email } = body;

    // Validate required fields
    if (!ticketTypeId || !name || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get ticket type and validate
    const ticketType = getTicketType(ticketTypeId);
    if (!ticketType) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticket type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create payment intent
    const metadata = {
      ticketType: ticketType.title,
      customerName: name,
      customerEmail: email,
    };

    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      ticketType.price,
      metadata
    );

    return new Response(
      JSON.stringify({
        clientSecret,
        paymentIntentId,
        amount: ticketType.price,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-payment-intent:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 