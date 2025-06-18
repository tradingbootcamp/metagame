import Airtable from 'airtable';
import type { AirtableRecord } from './types';
import { AIRTABLE_PAT, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } from './env';

console.log('Airtable configuration:', {
  hasPat: !!AIRTABLE_PAT,
  patLength: AIRTABLE_PAT?.length,
  hasBaseId: !!AIRTABLE_BASE_ID,
  hasTableName: !!AIRTABLE_TABLE_NAME,
  tableName: AIRTABLE_TABLE_NAME
});

// Initialize Airtable with Personal Access Token (PAT)
const base = new Airtable({
  apiKey: AIRTABLE_PAT,
}).base(AIRTABLE_BASE_ID);

export const createTicketRecord = async (recordData: AirtableRecord) => {
  try {
    console.log('Creating Airtable record with data:', recordData);
    console.log('Using table:', AIRTABLE_TABLE_NAME);
    
    const table = base(AIRTABLE_TABLE_NAME);
    
    console.log('Table object created, attempting to create record...');
    
    const record = await table.create([
      {
        fields: {
          'Name': recordData.Name,
          'Email': recordData.Email,
          'Ticket Type': recordData['Ticket Type'],
          'Price': recordData.Price,
          'Stripe Payment ID': recordData['Stripe Payment ID'],
          'Purchase Date': recordData['Purchase Date'],
          'Status': recordData.Status,
        },
      },
    ]);

    console.log('Airtable record created successfully:', record[0].id);
    return {
      success: true,
      recordId: record[0].id,
    };
  } catch (error) {
    console.error('Error creating Airtable record:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    throw new Error(`Failed to create Airtable record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const formatAirtableRecord = (
  name: string,
  email: string,
  ticketType: string,
  price: number,
  stripePaymentId: string,
  success: boolean
): AirtableRecord => {
  // Format date for Airtable (YYYY-MM-DD format)
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Gets YYYY-MM-DD format
  
  return {
    Name: name,
    Email: email,
    'Ticket Type': ticketType,
    Price: price,
    'Stripe Payment ID': stripePaymentId,
    'Purchase Date': formattedDate,
    Status: success ? 'Success' : 'Failed',
  };
}; 