import React, { useState } from 'react';
import { TicketPurchaseForm } from './TicketPurchaseForm';
import { getTicketType } from '../../config/tickets';
import type { TicketType } from '../../lib/types';

interface TicketCardProps {
  ticketTypeId: string;
  onPurchaseSuccess?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ 
  ticketTypeId, 
  onPurchaseSuccess 
}) => {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const ticketType = getTicketType(ticketTypeId);
  if (!ticketType) {
    return <div>Invalid ticket type</div>;
  }

  const handleBuyNow = () => {
    setIsExpanded(true);
    setShowPurchaseForm(true);
  };

  const handleClose = () => {
    setShowPurchaseForm(false);
    setIsExpanded(false);
  };

  const handleSuccess = () => {
    setShowPurchaseForm(false);
    setIsExpanded(false);
    onPurchaseSuccess?.();
  };

  const discountPercentage = ticketType.regularPrice 
    ? Math.round(((ticketType.regularPrice - ticketType.price) / ticketType.regularPrice) * 100)
    : 0;

  return (
    <div className={`relative group transition-all duration-300 ${
      isExpanded ? 'md:col-span-3' : ''
    }`}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-full flex flex-col">
        {/* Discount Badge */}
        {ticketType.regularPrice && discountPercentage > 0 && (
          <div className="absolute right-[-38px] h-10 w-[164px] border-b-2 rotate-45 transition-all border-amber-400 group-hover:border-fuchsia-400 motion-reduce:animate-pulse">
            <div className="mb-8 text-3xl text-secondary-300 font-bold animate-pulse">
              -{discountPercentage}%
            </div>
          </div>
        )}

        {/* Ticket Header */}
        <div className="flex-grow">
          <h3 className="uppercase text-2xl font-black text-primary-300 mb-3">
            {ticketType.title}
          </h3>
          
          <p className="text-cyan-300 font-bold mb-6">
            {ticketType.description}
          </p>

          {/* Price Display */}
          {ticketType.regularPrice && ticketType.price !== ticketType.regularPrice ? (
            <div className="text-4xl text-gray-400 relative mb-4">
              ${ticketType.regularPrice}
              <div className="absolute left-7 right-0 mx-auto w-[65px] top-5 border-b-2 -rotate-[33deg] border-secondary-300" />
            </div>
          ) : (
            <div className="text-4xl text-gray-400 h-10 mb-4" />
          )}
          
          <p className="text-6xl font-black text-secondary-300 mb-6">
            ${ticketType.price}
          </p>

          {/* Features List */}
          {ticketType.features && ticketType.features.length > 0 && (
            <ul className="text-lg flex-grow space-y-2 mb-6">
              {ticketType.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Purchase Form or Buy Button */}
        <div className="mt-auto pt-3">
          {showPurchaseForm ? (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <TicketPurchaseForm
                ticketType={ticketType}
                onClose={handleClose}
                onSuccess={handleSuccess}
              />
            </div>
          ) : (
            <button
              onClick={handleBuyNow}
              className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 