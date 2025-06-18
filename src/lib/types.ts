export interface TicketType {
  id: string;
  title: string;
  price: number;
  regularPrice?: number;
  description: string;
  features?: string[];
}

export interface TicketPurchaseData {
  name: string;
  email: string;
  ticketType: string;
  price: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentConfirmationData {
  paymentIntentId: string;
  name: string;
  email: string;
  ticketType: string;
  price: number;
  stripePaymentId: string;
  success: boolean;
}

export interface AirtableRecord {
  Name: string;
  Email: string;
  'Ticket Type': string;
  Price: number;
  'Stripe Payment ID': string;
  'Purchase Date': string;
  Status: 'Success' | 'Failed';
} 