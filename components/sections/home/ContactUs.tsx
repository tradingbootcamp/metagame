import React from 'react'

import { URLS } from '../../../utils/urls'
import { Button } from '../../Button'
import { Card } from '../../Card'

export const ContactUs: React.FC = () => {
  return (
    <section className="mb-20 flex w-full flex-col" id="Supporters">
      <div className="flex w-full flex-col items-center justify-center">
        <Card className="mt-[80px]">
          <div className="flex h-full flex-col items-center justify-center p-4">
            <h3 className="text-2xl font-bold">Sound fun?</h3>
            <p className="mt-4 text-center">
              Plans for Metagame 2026 are still in the works; fill out our
              interest form here to get updates!
            </p>
            <Button
              className="mt-8 uppercase"
              link={URLS.METAGAME_2026_INTEREST}
              target="_blank"
            >
              Metagame 2026
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
