import { URLS } from '../utils/urls'
import { Button } from './Button'

interface FAQ {
  id: number
  question: string
  contentHtml: React.ReactNode
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'Who is organizing this event?',
    contentHtml: (
      <p>
        Ricki Heicklen and the <a href="/arbor">Arbor</a> team, as well as many,
        many others. More information coming soon!
      </p>
    ),
  },
  {
    id: 2,
    question: 'Where will it be?',
    contentHtml: (
      <>
        <p>
          <a href="https://lighthaven.space" target="_blank">
            Lighthaven Campus
          </a>
          , Berkeley, CA
        </p>
        <p>Address: 2740 Telegraph Ave, Berkeley, CA 94705</p>
      </>
    ),
  },
  {
    id: 3,
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
    id: 4,
    question: 'Do you offer any discounts?',
    contentHtml: (
      <>
        <p>Yes, we offer several discount options:</p>
        <ul>
          <li>
            <strong>Volunteer tickets</strong>: Applications for volunteer
            tickets can be found{' '}
            <a href={URLS.TICKET_VOLUNTEER} target="_blank">
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
            <a href={URLS.TICKET_FINANCIAL_AID} target="_blank">
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
    id: 5,
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
          <a href="/schedule" target="_blank">
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
    id: 6,
    question: 'What is the refund policy?',
    contentHtml: (
      <p>
        Metagame tickets purchased in dollars are 94% refundable if requested by
        September 1st. After that point, we will not be able to issue refunds.
        Tickets purchased in Bitcoin are not refundable. You can also transfer
        your ticket to someone else by September 1st by emailing{' '}
        <a href="mailto:team@metagame.games">team@metagame.games</a>.
      </p>
    ),
  },
  {
    id: 7,
    question: 'I have another question',
    contentHtml: (
      <p>
        Let us know{' '}
        <a href={URLS.INTEREST_FORM} target="_blank">
          here
        </a>
        !
      </p>
    ),
  },
]

export default function FAQ() {
  return (
    <div className="flex max-w-prose flex-col gap-5 py-20">
      <h1 className="pb-8 text-center text-2xl font-black text-secondary-300">
        Frequently Asked Questions
      </h1>
      {faqs.map((faq) => (
        <div key={faq.id} className="collapse-plus collapse bg-base-200">
          <input type="checkbox" name={`accordion-${faq.id}`} />
          <div className="collapse-title text-xl font-medium">
            {faq.question}
          </div>
          <div className="prose-xl collapse-content prose">
            <article className="prose">{faq.contentHtml}</article>
          </div>
        </div>
      ))}
    </div>
  )
}
