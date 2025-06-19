import React, { useState, useEffect, useRef } from 'react';
import { getTicketType } from '../../config/tickets';
import { Button } from '../Button';
import type { TicketType } from '../../lib/types';
import {
  TICKET_EARLY_BIRD_URL,
  TICKET_REGULAR_URL,
  TICKET_VOLUNTEER_URL,
  TICKET_SUPPORTER_URL
} from '../../config';

interface TicketCardProps {
  ticketTypeId: string;
  onPurchaseSuccess?: () => void;
}

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <span
        className="cursor-help underline decoration-dotted"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg max-w-lg whitespace-normal min-w-[200px]">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export const TicketCard: React.FC<TicketCardProps> = ({ 
  ticketTypeId, 
  onPurchaseSuccess 
}) => {
  const ticketType = getTicketType(ticketTypeId);
  if (!ticketType) {
    return <div>Invalid ticket type</div>;
  }

  // Map ticketTypeId to Stripe URL
  const ticketUrl =
    ticketTypeId === 'player' ? TICKET_EARLY_BIRD_URL :
    ticketTypeId === 'npc' ? TICKET_VOLUNTEER_URL :
    ticketTypeId === 'supporter' ? TICKET_SUPPORTER_URL :
    ticketTypeId === 'regular' ? TICKET_REGULAR_URL :
    '';

  const discountPercentage = ticketType.regularPrice 
    ? Math.round(((ticketType.regularPrice - ticketType.price) / ticketType.regularPrice) * 100)
    : 0;

  return (
    <div className="relative group transition-all duration-300">
      <div className="card rounded-md border-amber-400 border-2 transition-all text-center flex flex-col p-6 h-full">
        {/* Ticket Header */}
        <div className="flex-grow flex flex-col">
          <div>
            <h3 className="uppercase text-5xl md:text-3xl font-black text-primary-300">
              {ticketType.title}
            </h3>
            
            <p className="mt-3 mb-6 text-cyan-300 font-bold">
              {ticketType.tooltipText ? (
                <>
                  {ticketType.description.split('Volunteer')[0]}
                  <Tooltip text={ticketType.tooltipText}>
                    Volunteer
                  </Tooltip>
                  {ticketType.description.split('Volunteer')[1]}
                </>
              ) : (
                ticketType.description
              )}
            </p>

            {/* Features List */}
            {ticketType.features && ticketType.features.length > 0 && (
              <ul className="my-16 text-lg">
                {ticketType.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Price Display - pushed to bottom of flex-grow container */}
          <div className="mt-auto">
            {ticketType.regularPrice && ticketType.price !== ticketType.regularPrice ? (
              <div className="text-4xl text-gray-400 relative">
                ${ticketType.regularPrice}
                <div className="absolute left-7 right-0 mx-auto w-[65px] top-5 border-b-2 -rotate-[33deg] border-secondary-300" />
              </div>
            ) : (
              <div className="text-4xl text-gray-400 h-0" />
            )}
            
            <p className="my-4 text-6xl md:text-5xl lg:text-6xl font-black text-secondary-300">
              ${ticketType.price}
            </p>
          </div>
        </div>

        {/* Buy Button */}
        <div className="mt-auto pt-3">
          <Button link={ticketUrl} target="_blank">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}; 