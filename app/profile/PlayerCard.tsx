'use client'

import { usePublicProfile } from './useProfiles'
import { GlobeIcon } from 'lucide-react'
import Image from 'next/image'

// Establish some base numbers
const CARD_WIDTH = 941
const CARD_HEIGHT = 1341
const FRAME_FROM_EDGE = 92
const CIRCLE_FROM_EDGE = 19
const CIRCLE_DIAMETER = 173
const SQUARE_FROM_EDGE = 32
const SQUARE_FROM_TOP = 235
const SQUARE_SIZE = 143
const INNER_WIDTH = CARD_WIDTH - FRAME_FROM_EDGE * 2 //between walls of inner gold frame
const INNER_HEIGHT = 1147 // from bottom gold to top
const TOP_FROM_TOP = 121 // from top of card png to top of frame
const PICTURE_HEIGHT = INNER_HEIGHT / 2
const BIO_CHAR_LIMIT = 150
const BASELINE_CARD_WIDTH = 300
const ABILITY_COST_SIZE = 75

const scale = BASELINE_CARD_WIDTH / CARD_WIDTH

export default function PlayerCard({ userId }: { userId: string }) {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = usePublicProfile(userId)
  const washImageSrcs = {
    orange: '/images/cards/orange-wash.png',
    purple: '/images/cards/purple-wash.png',
    green: '/images/cards/green-wash.png',
    unassigned: '/images/cards/gray-wash.png',
    blue: '/images/cards/blue-wash.png',
  }

  // Loading state - show gray wash, question mark, and frame
  if (profileLoading || profileError) {
    return (
      <div
        className="relative max-w-full overflow-hidden rounded-[2px] font-imfell"
        style={{
          width: BASELINE_CARD_WIDTH,
          aspectRatio: CARD_WIDTH / CARD_HEIGHT,
          fontSize: 500 * scale,
        }}
      >
        {/* Background card image - gray wash */}
        <Image
          src="/images/cards/fog.gif"
          alt="Loading..."
          fill
          className="z-1 object-cover"
        />
        <Image
          src="/images/cards/gray-wash.png"
          alt="Loading..."
          fill
          className="z-2 object-cover opacity-50"
        />
        {/* Frame Overlay */}
        <Image
          src="/images/cards/celestial-frame.png"
          alt="Frame overlay"
          fill
          className="z-3 object-cover"
        />
        {/* Large question mark in center */}
        <div
          // style={{
          //   width: INNER_WIDTH * scale,
          //   height: PICTURE_HEIGHT * scale,
          //   top: TOP_FROM_TOP * scale,
          //   left: FRAME_FROM_EDGE * scale,
          // }}
          className="absolute inset-0 z-2 flex items-center justify-center"
        >
          <div className="flex flex-col items-center text-gray-200">
            <span>{profileLoading ? '?' : 'X'}</span>
            <span style={{ fontSize: 100 * scale }}>
              {profileLoading ? 'Loading...' : 'Error'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative max-w-full overflow-hidden rounded-[2px] font-imfell"
      style={{
        width: BASELINE_CARD_WIDTH,
        aspectRatio: CARD_WIDTH / CARD_HEIGHT,
      }}
    >
      {/* Background card image */}
      <Image
        src={washImageSrcs[profile?.team || 'unassigned']}
        alt="Celestial Base Color"
        fill
        className="z-1 object-cover"
      />
      {/* Frame Overlay */}
      <Image
        src="/images/cards/celestial-frame.png"
        alt="Frame overlay"
        fill
        className="z-3 object-cover"
      />
      {/* Breath Square icon */}
      <div
        style={{
          width: SQUARE_SIZE * scale,
          height: SQUARE_SIZE * scale,
          top: SQUARE_FROM_TOP * scale,
          left: SQUARE_FROM_EDGE * scale,
        }}
        className="absolute z-4"
      >
        <Image
          src="/images/cards/fog.gif"
          alt="Breath"
          fill
          objectFit="cover"
        />
      </div>
      {/* Points? Cirlce icon */}
      <div
        style={{
          width: CIRCLE_DIAMETER * scale,
          height: CIRCLE_DIAMETER * scale,
          top: CIRCLE_FROM_EDGE * scale,
          left: CIRCLE_FROM_EDGE * scale,
        }}
        className="absolute z-4 overflow-hidden rounded-full"
      >
        <Image
          src="/images/cards/fog.gif"
          alt="Points"
          fill
          objectFit="cover"
        />
      </div>
      {/* Hosting line */}
      {
        /*hostedSessions.length > 0 && */ <div
          style={{
            top: 35 * scale,
            right: 55 * scale,
            fontSize: 50 * scale,
          }}
          className="absolute z-4 text-white"
        >
          {/* <span className="flex items-center gap-1">
            Hosting:
            <div
              style={{
                width: 50 * scale,
                height: 50 * scale,
              }}
              className="flex items-center justify-center rounded-full bg-gray-500 p-1 text-secondary-300"
            >
              <strong className="font-serif">{hostedSessions.length}</strong>
            </div>
          </span> */}
          <span className="text-opacity-50 font-cinzel text-gray-400">
            #{profile?.player_id}
          </span>
        </div>
      }
      {/* Name */}
      <div
        style={{
          left: 210 * scale,
          top: 35 * scale,
          fontSize: 50 * scale,
        }}
        className="absolute z-3 font-cinzel text-white"
      >
        <strong>
          {profile?.first_name} {profile?.last_name}
        </strong>
      </div>
      {/* Player picture */}
      <div
        style={{
          width: INNER_WIDTH * scale,
          height: PICTURE_HEIGHT * scale,
          top: TOP_FROM_TOP * scale,
          left: FRAME_FROM_EDGE * scale,
        }}
        className="relative z-2 overflow-hidden"
      >
        <div className="relative size-full overflow-hidden rounded-b-xs bg-gradient-to-br from-stone-400 via-stone-700 to-stone-400 p-2">
          {/* Gray border */}
          <Image
            src={washImageSrcs.unassigned}
            alt="border"
            fill
            className="z-1 object-cover"
          />
          {/* flash thing */}
          <div className="absolute inset-0 z-1 h-[200%] w-[20%] animate-flash bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="relative size-full">
            <Image
              id="player-picture"
              src={profile?.profile_pictures_url ?? '/images/incognito.svg'}
              alt="Profile picture"
              fill
              className="z-2 rounded-sm object-cover"
            />
          </div>
        </div>
      </div>
      {/* Sub Profile Picture */}
      <div
        style={{
          width: INNER_WIDTH * scale,
          left: FRAME_FROM_EDGE * scale,
          top: (PICTURE_HEIGHT + TOP_FROM_TOP) * scale,
          bottom: FRAME_FROM_EDGE * scale,
          fontSize: 40 * scale,
        }}
        className="absolute z-2 flex flex-col gap-1 leading-none break-words text-black"
      >
        {/* Bio */}
        <div className="w-full p-1">
          {profile?.bio && profile.bio.length > BIO_CHAR_LIMIT
            ? profile?.bio?.slice(0, BIO_CHAR_LIMIT) + '...'
            : profile?.bio}
        </div>
        {/* Abilities? */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-start gap-1">
            <div
              className="relative z-1 flex flex-shrink-0 items-center justify-center overflow-hidden rounded-sm"
              style={{
                width: ABILITY_COST_SIZE * scale,
                height: ABILITY_COST_SIZE * scale,
              }}
            >
              <Image
                src="/images/cards/fog.gif"
                alt=""
                fill
                objectFit="cover"
              />
              {/* Idk Breatch cost here? */}
              <span className="z-2"></span>
            </div>
            <span>
              <strong>Ability 1:</strong> Your first ability, it probably takes
              at least this many characters to describe
            </span>
          </div>
          <div className="flex items-center justify-start gap-1">
            <div
              className="justify-cente relative flex flex-shrink-0 items-center overflow-hidden rounded-sm"
              style={{
                width: ABILITY_COST_SIZE * scale,
                height: ABILITY_COST_SIZE * scale,
              }}
            >
              <Image
                src="/images/cards/fog.gif"
                alt=""
                fill
                objectFit="cover"
              />
              {/* Idk Breatch cost here? */}
              <span className="z-2"></span>
            </div>
            <span>
              <strong>Ability 2:</strong> Your second ability, maybe this
              one&apos;s shorter
            </span>
          </div>
        </div>
        {/* Bottom right */}
        <div className="absolute right-0 bottom-0 flex items-center gap-1 pr-1">
          <GlobeIcon className="size-3" />
          <a
            href={profile?.site_url ?? ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile?.site_url}
          </a>
        </div>
        {/* Bottom left */}
        <div className="absolute bottom-0 left-0 flex items-center gap-1 pl-1">
          <Image
            src="/logos/discord-logo.svg"
            alt="D"
            width={40 * scale}
            height={40 * scale}
          />
          {profile?.discord_handle ?? 'Discord Handle'}
        </div>
      </div>
    </div>
  )
}
