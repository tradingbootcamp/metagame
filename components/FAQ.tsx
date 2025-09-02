'use client'

import { Suspense, useEffect, useRef, useState } from 'react'

import { SOCIAL_LINKS, URLS } from '../utils/urls'
import { Button } from './Button'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LinkIcon,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface FAQ {
  id: string
  question: string
  contentHtml: React.ReactNode
}

const faqs: FAQ[] = [
  {
    id: 'organizers',
    question: 'Who is organizing this event?',
    contentHtml: (
      <p>
        Ricki Heicklen and the{' '}
        <a className="link" href="/arbor">
          Arbor
        </a>{' '}
        team, as well as many, many others. More information coming soon!
      </p>
    ),
  },
  {
    id: 'location',
    question: 'Where will it be?',
    contentHtml: (
      <>
        <p>
          <a className="link" href="https://lighthaven.space" target="_blank">
            Lighthaven Campus
          </a>
          , Berkeley, CA
        </p>
        <p>Address: 2740 Telegraph Ave, Berkeley, CA 94705</p>
      </>
    ),
  },
  {
    id: 'schedule',
    question: 'What time does Metagame start and end?',
    contentHtml: (
      <p>
        The registration desk opens at 2pm Friday, September 12th, and will stay
        open over the course of the conference. Metagame will run late into the
        night Sunday, September 14th.
      </p>
    ),
  },
  {
    id: 'discounts',
    question: 'Do you offer any discounts?',
    contentHtml: (
      <>
        <p>Yes, we offer several discount options:</p>
        <ul className="list-outside list-disc pl-4">
          <li>
            <strong>Volunteer tickets</strong>: Applications for volunteer
            tickets can be found{' '}
            <a className="link" href={URLS.TICKET_VOLUNTEER} target="_blank">
              here
            </a>{' '}
            and will be evaluated on a rolling basis. Volunteers work up to 6
            credits (with most 4-hour shifts worth between 1 and 3 credits)
            during or in advance of the conference, in exchange for a free or
            reduced price ticket.
          </li>
          <li>
            <strong>Financial aid tickets</strong>: We have a scholarship fund
            with free and reduced price tickets available for people for whom
            attending Metagame would pose a financial hardship. If the current
            ticket price ($580) is prohibitive but a 50% off ticket would be
            doable, you can use the discount code <strong>HALFPRICE</strong> to
            get a $290 ticket, on the honor system. For a reduction in ticket
            price beyond that or to apply for travel assistance, please fill out{' '}
            <a
              className="link"
              href={URLS.TICKET_FINANCIAL_AID}
              target="_blank"
            >
              this form
            </a>
            . The deadline to apply for financial aid is Monday, August 25th. We
            will try to get answers by Monday, September 1st.
          </li>
          <li>
            <strong>Hidden discounts</strong>: There are plenty of easter eggs
            throughout the site that will unlock discounts. Only one discount
            code can be used per ticket, and the maximum discount attainable
            through minigames and puzzles is $100.
          </li>
          <li>
            <strong>Community Partner Discount</strong>
            {`: If you want to be a major sponsor, we'll give you a free ticket, for a confusing notion of "free".`}
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'lodging',
    question: 'Where can I stay?',
    contentHtml: (
      <p>
        Rooms at and near the venue can be booked via{' '}
        <a
          href="https://www.havenbookings.space/events/metagame"
          target="_blank"
        >
          Haven Bookings
        </a>
        . You can also coordinate with others in the{' '}
        <a
          className="link"
          href="https://discord.gg/GsT3yRrxR9"
          target="_blank"
        >
          #housing
        </a>{' '}
        Discord channel.
      </p>
    ),
  },
  {
    id: 'children',
    question: 'Are children welcome at Metagame?',
    contentHtml: (
      <>
        <p>
          Yes! We&apos;d love to see more children around, and kids under 13
          attend Metagame for free. If you&apos;re bringing children, please
          register them by <strong>September 1st</strong>.
        </p>
        <p>
          In addition, childcare and children&apos;s programming for kids ages
          5-12 will be available free of charge during the following hours:
        </p>
        <ul>
          <li>
            <strong>Friday:</strong> 3pm-7pm (flexible dropoff & pickup)
          </li>
          <li>
            <strong>Saturday:</strong> 9:45am-3pm (dropoff 9:45am-10am, pickup
            2:45pm-3pm)
          </li>
          <li>
            <strong>Saturday:</strong> 5pm-7:30pm (dropoff 5pm-5:15pm, pickup
            7:15pm-7:30pm)
          </li>
          <li>
            <strong>Sunday:</strong> 9:45am-3pm (dropoff 9:45am-10am, pickup
            2:45pm-3pm)
          </li>
          <li>
            <strong>Sunday:</strong> 5pm-7:30pm (dropoff 5pm-5:15pm, pickup
            7:15pm-7:30pm)
          </li>
        </ul>
        <p>
          See the{' '}
          <a className="link" href="/schedule" target="_blank">
            schedule
          </a>{' '}
          for more details.
        </p>
        <div className="mt-4 text-center">
          <Button
            link={URLS.CHILDREN_REGISTRATION}
            target="_blank"
            className="inline-block"
          >
            Register Your Children
          </Button>
        </div>
      </>
    ),
  },
  {
    id: 'refunds',
    question: 'What is the refund policy?',
    contentHtml: (
      <p>
        Metagame tickets purchased in dollars are 94% refundable if requested by
        September 1st. After that point, we will not be able to issue refunds.
        Tickets purchased in Bitcoin are not refundable. You can also transfer
        your ticket to someone else by September 1st by emailing{' '}
        <a className="link" href="mailto:team@metagame.games">
          team@metagame.games
        </a>
        .
      </p>
    ),
  },
  {
    id: 'contact',
    question: 'I have another question!',
    contentHtml: (
      <p>
        Ask it in the{' '}
        <a className="link" href={SOCIAL_LINKS.DISCORD} target="_blank">
          Discord
        </a>
        ! Or email us at{' '}
        <a className="link" href="mailto:team@metagame.games">
          team@metagame.games
        </a>
        .
      </p>
    ),
  },
]

function FaqItem({ faq, isTarget }: { faq: FAQ; isTarget: boolean }) {
  const [isOpen, setIsOpen] = useState<boolean>(isTarget)
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isTarget) {
      setIsOpen(true)
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
    }
  }, [isTarget])

  const copyLink = () => {
    const base = window.location.origin
    const fullUrl = `${base}/faq?qId=${faq.id}`
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setShowCopiedMessage(true)
        setTimeout(() => setShowCopiedMessage(false), 2000)
      })
      .catch(() => {
        setCopyError(true)
        setTimeout(() => setCopyError(false), 2000)
      })
  }

  return (
    <div ref={ref} id={faq.id} className="w-full rounded-md bg-indigo-950">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-3 text-left">
          <span className="text-xl font-medium">{faq.question}</span>

          <div className="flex items-center">
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex items-start justify-between p-3">
          <article className="text-lg">{faq.contentHtml}</article>
          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyLink()
              }}
              className="mr-2 rounded-md p-1 transition-colors hover:bg-dark-400"
              title="Copy link to this question"
              aria-label="Copy link to this question"
            >
              {showCopiedMessage ? (
                <CheckIcon className="h-4 w-4 text-green-400" />
              ) : (
                <LinkIcon
                  className={`h-4 w-4 opacity-50 ${copyError ? 'text-red-500' : 'text-white-300'}`}
                />
              )}
            </button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function FAQInner() {
  const searchParams = useSearchParams()
  const qId = (searchParams.get('qId') ?? '').trim()

  return (
    <div className="flex w-full max-w-[600px] flex-col gap-5">
      <h1 className="my-6 text-center text-2xl font-black text-secondary-300">
        Frequently Asked Questions
      </h1>
      {faqs.map((faq) => (
        <FaqItem key={faq.id} faq={faq} isTarget={qId === faq.id} />
      ))}
    </div>
  )
}

export default function FAQ() {
  return (
    <Suspense fallback={<div className="py-20" />}>
      <FAQInner />
    </Suspense>
  )
}
