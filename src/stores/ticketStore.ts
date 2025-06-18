import { atom } from 'nanostores';
import type { TicketType } from '../lib/types';

// Store for currently selected ticket
export const selectedTicket = atom<TicketType | null>(null);

// Store for purchase status
export const purchaseStatus = atom<'idle' | 'loading' | 'success' | 'error'>('idle');

// Store for error messages
export const errorMessage = atom<string>('');

// Store for success messages
export const successMessage = atom<string>('');

// Actions
export const setSelectedTicket = (ticket: TicketType | null) => {
  selectedTicket.set(ticket);
};

export const setPurchaseStatus = (status: 'idle' | 'loading' | 'success' | 'error') => {
  purchaseStatus.set(status);
};

export const setErrorMessage = (message: string) => {
  errorMessage.set(message);
  purchaseStatus.set('error');
};

export const setSuccessMessage = (message: string) => {
  successMessage.set(message);
  purchaseStatus.set('success');
};

export const resetPurchaseState = () => {
  purchaseStatus.set('idle');
  errorMessage.set('');
  successMessage.set('');
}; 