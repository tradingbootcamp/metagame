'use client'

import React, { useMemo, useState } from 'react'

import { Modal } from '../Modal'
import { Slider } from '../ui/slider'
import { TicketPurchaseForm } from './TicketPurchaseForm'
import { PaymentCurrency } from './Tickets'

import { TicketType } from '@/lib/types'

import { URLS } from '@/utils/urls'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  dayPassTicketTypes,
  displayOnlyTicketType,
  ticketTypeDetails,
} from '@/config/tickets'
import { DbTicketType } from '@/types/database/dbTypeAliases'

interface TicketCardProps {
  ticketTypeId: DbTicketType | 'dayPass' | 'slidingScale'
  paymentMethod?: PaymentCurrency
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticketTypeId,
  paymentMethod = 'usd',
}) => {
  const [selectedDayPass, setSelectedDayPass] = useState<
    'friday' | 'saturday' | 'sunday' | null
  >(null)
  const [showModal, setShowModal] = useState(false)
  const [slidingScalePriceUSD, setSlidingScalePriceUSD] = useState(435)
  const [slidingScalePriceBTC, setSlidingScalePriceBTC] = useState(0.003)
  const purchaseableTicketType = useMemo<TicketType | null>(() => {
    switch (ticketTypeId) {
      case 'dayPass':
        return selectedDayPass ? ticketTypeDetails[selectedDayPass] : null
      case 'slidingScale':
        return {
          ...ticketTypeDetails['player'],
          priceUSD: slidingScalePriceUSD,
          priceBTC: slidingScalePriceBTC,
        }
      default:
        return ticketTypeDetails[ticketTypeId]
    }
  }, [
    selectedDayPass,
    slidingScalePriceUSD,
    slidingScalePriceBTC,
    ticketTypeId,
  ])
  const displayTicketType = useMemo(() => {
    switch (ticketTypeId) {
      case 'dayPass':
        if (selectedDayPass) {
          return ticketTypeDetails[selectedDayPass]
        }
        return displayOnlyTicketType['dayPass']
      case 'slidingScale':
        return displayOnlyTicketType['slidingScale']
      case 'volunteer':
        return displayOnlyTicketType['volunteer']
      default:
        return ticketTypeDetails[ticketTypeId]
    }
  }, [selectedDayPass, ticketTypeId])

  const handleClickBuy = () => {
    // If there's a specific URL for this ticket type, redirect to it
    if (displayTicketType.ticketUrl) {
      window.open(displayTicketType.ticketUrl, '_blank')
      return
    }

    // For day pass, require selection before proceeding
    if (ticketTypeId === 'dayPass' && !selectedDayPass) {
      return
    }

    // Otherwise, show the purchase modal
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const isBTC = paymentMethod === 'btc'
  const underspecifiedDayPass = ticketTypeId === 'dayPass' && !selectedDayPass
  return (
    <>
      <div className="group relative transition-all duration-300">
        <div className="card flex h-full flex-col rounded-md border-2 border-amber-400 p-6 text-center transition-all">
          {/* Ticket Header */}
          <div className="flex flex-grow flex-col justify-between">
            <div>
              <h3 className="text-5xl font-black text-primary-300 uppercase md:text-3xl">
                {displayTicketType.title}
              </h3>

              <p className="mt-3 mb-3 font-bold text-cyan-300">
                {displayTicketType.description}
              </p>
              {/* Day Pass Dropdown */}
              {ticketTypeId === 'dayPass' && (
                <div className="mt-3 mb-3 flex justify-center">
                  <Select
                    value={selectedDayPass ?? ''}
                    onValueChange={(value) =>
                      setSelectedDayPass(
                        value as 'friday' | 'saturday' | 'sunday',
                      )
                    }
                  >
                    <SelectTrigger className="w-fit max-w-xs">
                      <SelectValue placeholder="Choose a day..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dayPassTicketTypes.map((option) => (
                        <SelectItem key={option} value={option}>
                          {ticketTypeDetails[option].title} -{' '}
                          {isBTC
                            ? `₿${ticketTypeDetails[option].priceBTC}`
                            : `$${ticketTypeDetails[option].priceUSD}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {ticketTypeId === 'slidingScale' &&
                (!isBTC ? (
                  <div className="mt-3 mb-3 flex flex-col justify-center">
                    <Slider
                      min={290}
                      max={580}
                      step={5}
                      value={[slidingScalePriceUSD]}
                      onValueChange={(value) =>
                        setSlidingScalePriceUSD(value[0])
                      }
                    />
                    <span className="text-lg text-gray-400">
                      ${slidingScalePriceUSD}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 mb-3 flex flex-col justify-center">
                    <Slider
                      min={0.002}
                      max={0.004}
                      step={0.00005}
                      value={[slidingScalePriceBTC]}
                      onValueChange={(value) =>
                        setSlidingScalePriceBTC(value[0])
                      }
                    />
                    <span className="text-lg text-gray-400">
                      ₿{slidingScalePriceBTC}
                    </span>
                  </div>
                ))}
              {ticketTypeId === 'slidingScale' && (
                <ul className="text-opacity-80 mt-3 mb-3 list-outside pl-4 text-left text-sm text-cyan-300 italic">
                  <li>
                    We also have a financial aid program with further price
                    reductions available.{' '}
                    <a
                      className="link"
                      href={URLS.TICKET_FINANCIAL_AID}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {' '}
                      Apply here
                    </a>{' '}
                    by 9/1.
                  </li>
                </ul>
              )}
              {/* Features List */}
              {displayTicketType.features &&
                displayTicketType.features.length > 0 && (
                  <ul className="my-16 text-lg">
                    {displayTicketType.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}
            </div>

            {/* Price Display  */}
            <div className="">
              {!isBTC &&
              displayTicketType.regularPrice &&
              displayTicketType.priceUSD !== displayTicketType.regularPrice ? (
                <div className="relative text-4xl text-gray-400">
                  ${displayTicketType.regularPrice}
                  <div className="absolute top-5 right-0 left-7 mx-auto w-[65px] -rotate-[33deg] border-b-2 border-secondary-300" />
                </div>
              ) : (
                <div className="h-0 text-4xl text-gray-400" />
              )}

              <p className="my-4 text-6xl font-black text-secondary-300 md:text-3xl lg:text-6xl">
                {isBTC
                  ? `₿${displayTicketType.priceBTC}`
                  : `$${displayTicketType.priceUSD}`}
              </p>
            </div>
          </div>

          {/* Buy/Apply Button */}
          <div className="mt-auto pt-3">
            <div
              className={`relative inline-block transition-all hover:scale-105 ${
                displayTicketType.live
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-50'
              }`}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-y-1 transform rounded-md bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500 opacity-30 blur-lg transition-all duration-300 hover:scale-110 hover:scale-y-150"></div>
              <button
                onClick={
                  displayTicketType.live && !underspecifiedDayPass
                    ? handleClickBuy
                    : undefined
                }
                disabled={!displayTicketType.live || underspecifiedDayPass}
                className={`relative rounded-md bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500 p-0.5 font-bold ${
                  displayTicketType.live && !underspecifiedDayPass
                    ? 'bg-[length:200%_200%] bg-[position:-100%_0] transition-all duration-300 hover:bg-[position:100%_0]'
                    : ''
                }`}
              >
                <div className="h-full w-full rounded-md bg-dark-500 px-12 py-3 whitespace-nowrap text-white uppercase transition-all duration-1000">
                  {displayTicketType.live
                    ? displayTicketType.applicationBased
                      ? 'Apply'
                      : isBTC
                        ? '₿uy Now'
                        : 'Buy Now'
                    : 'Coming Soon'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showModal && purchaseableTicketType && (
        <Modal onClose={handleCloseModal} className="w-full max-w-2xl">
          <div className="max-h-[90vh] overflow-y-auto rounded-lg border border-gray-700 bg-dark-500 p-6">
            <TicketPurchaseForm
              ticketType={purchaseableTicketType}
              paymentMethod={paymentMethod}
              onClose={handleCloseModal}
              slidingScalePrice={
                ticketTypeId === 'slidingScale'
                  ? isBTC
                    ? slidingScalePriceBTC
                    : slidingScalePriceUSD
                  : null
              }
            />
          </div>
        </Modal>
      )}
    </>
  )
}
