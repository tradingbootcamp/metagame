'use client'

import React, { useState } from 'react'

import {
  DAY_PASS_OPTIONS,
  getDayPassTicketType,
  getTicketType,
} from '../../config/tickets'
import { Modal } from '../Modal'
import { TicketPurchaseForm } from './TicketPurchaseForm'
import { PaymentCurrency } from './Tickets'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TicketCardProps {
  ticketTypeId: string
  paymentMethod?: PaymentCurrency
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticketTypeId,
  paymentMethod = 'usd',
}) => {
  const [selectedDayPass, setSelectedDayPass] = useState<
    (typeof DAY_PASS_OPTIONS)[0] | null
  >(null)
  const [showModal, setShowModal] = useState(false)

  const ticketType = getTicketType(ticketTypeId)
  if (!ticketType) {
    return <div>Invalid ticket type</div>
  }

  // For day pass tickets, calculate price range and use selected day's details
  const isDayPass = ticketTypeId === 'dayPass'
  const dayPassPrices = DAY_PASS_OPTIONS.map((option) => option.priceUSD)
  const dayPassPricesBTC = DAY_PASS_OPTIONS.map((option) => option.priceBTC!)
  const minPrice = Math.min(...dayPassPrices)
  const maxPrice = Math.max(...dayPassPrices)
  const priceRange =
    minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-${maxPrice}`
  const minPriceBTC = Math.min(...dayPassPricesBTC)
  const maxPriceBTC = Math.max(...dayPassPricesBTC)
  const priceRangeBTC =
    minPriceBTC === maxPriceBTC
      ? `₿${minPriceBTC}`
      : `₿${minPriceBTC}-${maxPriceBTC}`
  function getDisplayTicketType(
    ticketTypeId: string,
    selectedDayPass: (typeof DAY_PASS_OPTIONS)[0] | null,
  ) {
    const ticketType = getTicketType(ticketTypeId)
    if (!ticketType) return null

    if (ticketTypeId === 'dayPass') {
      const priceUSD =
        selectedDayPass?.priceUSD ??
        Math.min(...DAY_PASS_OPTIONS.map((o) => o.priceUSD))
      const priceBTC =
        selectedDayPass?.priceBTC ??
        Math.min(...DAY_PASS_OPTIONS.map((o) => o.priceBTC!))
      return {
        ...ticketType,
        priceUSD,
        regularPrice: priceUSD,
        description:
          selectedDayPass?.description ?? 'Single day pass - choose a day',
        title: selectedDayPass
          ? `Day Pass: ${selectedDayPass.title}`
          : 'Day Pass',
        priceBTC,
      }
    }

    if (ticketTypeId === 'volunteer') {
      return {
        ...ticketType,
        priceUSD: '0+',
        priceBTC: '0+',
        regularPrice: null,
      }
    }
    if (ticketTypeId === 'financialAid') {
      return {
        ...ticketType,
        priceUSD: '0-290',
        priceBTC: '0-0.002',
        regularPrice: null,
      }
    }

    return ticketType
  }

  const handleBuyNow = () => {
    // If there's a specific URL for this ticket type, redirect to it
    if (ticketType.ticketUrl) {
      window.open(ticketType.ticketUrl, '_blank')
      return
    }

    // For day pass, require selection before proceeding
    if (isDayPass && !selectedDayPass) {
      return
    }

    // Otherwise, show the purchase modal
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleDayPassChange = (value: string) => {
    const selected = DAY_PASS_OPTIONS.find((option) => option.id === value)
    setSelectedDayPass(selected || null)
  }

  const displayTicketType = getDisplayTicketType(ticketTypeId, selectedDayPass)
  if (!displayTicketType) {
    return <div>Invalid ticket type</div>
  }
  const isBTC = paymentMethod === 'btc'
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
              {isDayPass && (
                <div className="mt-3 mb-3 flex justify-center">
                  <Select
                    value={selectedDayPass?.id || ''}
                    onValueChange={handleDayPassChange}
                  >
                    <SelectTrigger className="w-fit max-w-xs">
                      <SelectValue placeholder="Choose a day..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_PASS_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.title} -{' '}
                          {isBTC
                            ? `₿${option.priceBTC}`
                            : `$${option.priceUSD}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {displayTicketType.finePrint && (
                <ul className="text-opacity-80 mt-3 mb-3 list-outside list-disc pl-4 text-left text-xs text-cyan-300">
                  <li>{displayTicketType.finePrint}</li>
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
                {isBTC ? (
                  isDayPass && !selectedDayPass ? (
                    <span className="">{priceRangeBTC}</span>
                  ) : (
                    <span className="">₿{displayTicketType.priceBTC}</span>
                  )
                ) : isDayPass && !selectedDayPass ? (
                  priceRange
                ) : (
                  `$${displayTicketType.priceUSD}`
                )}
              </p>
            </div>
          </div>

          {/* Buy/Apply Button */}
          <div className="mt-auto pt-3">
            <div
              className={`relative inline-block transition-all hover:scale-105 ${
                ticketType.live
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-50'
              }`}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 translate-y-1 transform rounded-md bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500 opacity-30 blur-lg transition-all duration-300 hover:scale-110 hover:scale-y-150"></div>
              <button
                onClick={
                  displayTicketType.live && (!isDayPass || selectedDayPass)
                    ? handleBuyNow
                    : undefined
                }
                disabled={
                  !displayTicketType.live || (isDayPass && !selectedDayPass)
                }
                className={`relative rounded-md bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500 p-0.5 font-bold ${
                  displayTicketType.live && (!isDayPass || selectedDayPass)
                    ? 'bg-[length:200%_200%] bg-[position:-100%_0] transition-all duration-300 hover:bg-[position:100%_0]'
                    : ''
                }`}
              >
                <div className="h-full w-full rounded-md bg-dark-500 px-12 py-3 whitespace-nowrap text-white uppercase transition-all duration-1000">
                  {ticketType.live
                    ? ticketType.applicationBased
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
      {showModal && (
        <Modal onClose={handleCloseModal} className="w-full max-w-2xl">
          <div className="max-h-[90vh] overflow-y-auto rounded-lg border border-gray-700 bg-dark-500 p-6">
            <TicketPurchaseForm
              ticketType={
                selectedDayPass
                  ? (getDayPassTicketType(selectedDayPass.id) ?? ticketType)
                  : ticketType
              }
              paymentMethod={paymentMethod}
              onClose={handleCloseModal}
            />
          </div>
        </Modal>
      )}
    </>
  )
}
