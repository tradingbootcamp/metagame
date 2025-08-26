import { URLS } from '@/utils/urls'

import { Button } from '@/components/Button'

import ScheduleProvider from '@/app/schedule/ScheduleProvider'

export default function ScheduleSection() {
  return (
    <section className="mb-10 flex h-fit w-full max-w-full flex-col justify-center overflow-hidden">
      <h2 className="mb-4 text-center text-3xl font-bold">Schedule</h2>
      <p className="mb-8 text-center text-primary-200">
        Times, locations, content, hosts, and the fundamental fabric of reality
        all subject to change.
      </p>
      <div className="relative container mx-auto flex h-[calc(100vh-150px)] flex-col overflow-y-auto rounded-xl border border-secondary-300">
        <ScheduleProvider />
      </div>
      <div className="my-8 flex justify-center">
        <Button
          background="bg-cyan-500"
          link={URLS.CALL_FOR_SESSIONS}
          target="_blank"
        >
          Submit a session proposal
        </Button>
      </div>
    </section>
  )
}
