import React from 'react'

import { Card } from './Card'
import Image from 'next/image'

import { cn } from '@/utils/cn'
import { urlWithProtocol } from '@/utils/urlFix'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

type SpeakerCardProps = {
  profile: Partial<DbFullProfile>
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ profile }) => {
  const {
    first_name,
    last_name,
    profile_pictures_url,
    site_name,
    site_url,
    site_name_2,
    site_url_2,
  } = profile
  const ExternalLinkIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 hidden md:inline"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  )

  // Handle different image URL formats
  const getImageSrc = (imageUrl: string | null) => {
    if (!imageUrl) return '/images/incognito.svg'

    // If it's already a full URL (from Supabase), use it directly
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    // If it's a relative path, treat it as before (fallback for markdown data)
    return `/images/${imageUrl.split('/').pop()}`
  }

  return (
    <Card
      className="bg-opacity-50 flex w-24 flex-col items-center bg-slate-700 py-1 sm:w-32 sm:pt-2 md:w-48"
      padless
    >
      <Image
        alt={first_name + ' ' + last_name || 'YOU?'}
        className={cn(
          'glitch mb-2 aspect-square h-20 w-20 rounded sm:h-28 sm:w-28 md:h-40 md:w-40',
          profile_pictures_url ? 'object-cover' : 'object-fill',
        )}
        src={getImageSrc(profile_pictures_url ?? null)}
        height="160"
        width="160"
      />
      <div className="mx-1 flex-grow">
        <h3
          className={cn(
            'text-xs font-bold',
            (first_name + ' ' + last_name).length > 20
              ? 'md:text-sm'
              : 'md:text-base',
          )}
        >
          {first_name + ' ' + last_name}
        </h3>
        {site_url && (
          <a
            href={
              site_name === 'METAGAME'
                ? `/?metagame=true#speakers`
                : urlWithProtocol(site_url)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex link items-center justify-center gap-1 text-[10px] font-semibold sm:text-sm"
          >
            {site_name}
            <ExternalLinkIcon />
          </a>
        )}
        {site_name_2 && site_url_2 && (
          <a
            href={
              site_name_2 === 'METAGAME'
                ? `/?metagame=true#speakers`
                : urlWithProtocol(site_url_2)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex link items-center justify-center gap-1 text-[10px] font-semibold sm:text-sm"
          >
            {site_name_2}
            <ExternalLinkIcon />
          </a>
        )}
      </div>
    </Card>
  )
}
