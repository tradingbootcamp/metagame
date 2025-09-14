'use client'

import { FaDiscord } from 'react-icons/fa'

import { GlobeIcon } from 'lucide-react'
import Image from 'next/image'

import { Card } from '@/components/Card'
import styles from '@/components/PlayerCard/holo.module.css'

import { usePublicProfile } from '@/hooks/useProfiles'
import {
  DbCelestialCard,
  DbPublicProfile,
} from '@/types/database/dbTypeAliases'

const dummyProfile: DbPublicProfile = {
  id: '1',
  first_name: '',
  last_name: '',
  pronouns: null,
  minor: false,
  team: 'green',
  discord_handle: null,
  opted_in_to_homepage_display: true,
  bio: null,
  is_admin: false,
  homepage_order: 0,
  site_name: null,
  site_url: null,
  site_name_2: null,
  site_url_2: null,
  dismissed_info_request: false,
  profile_pictures_url: null,
  player_id: 3141,
  volunteer: false,
  celestial_card_id: null,
  celestial_card: null,
  checked_in: false,
}
// Establish some base numbers
const CARD_WIDTH = 800 // width of the card image unscaled
const CARD_HEIGHT = 1200 // height of the card image unscaled
const FRAME_FROM_EDGE = 82 // distance from edge of card image to the inside of the frame where content lives
const CIRCLE_FROM_EDGE = 12 // placement of Breath circle left from left and top from top of card
const CIRCLE_DIAMETER = 182 // width of Breath circle
const SQUARE_FROM_EDGE = 12 // placement of Points square left from left of card
const SQUARE_FROM_TOP = 205 // placement of Points square top from top of card
const SQUARE_SIZE = 182 // width of Points square
const INNER_WIDTH = CARD_WIDTH - FRAME_FROM_EDGE * 2 //between walls of inner gold frame
const TOP_FROM_TOP_TALL_BANNER = 211 // distance from top of card to top of inner content section
const TOP_FROM_TOP_SHORT_BANNER = 107 // distance from top of card to top of inner content section
const BIO_CHAR_LIMIT = 100 // baseline bio character limit based on ___?
const SHORT_BANNER_HEIGHT = 99 // the inside height of the short top banner (holds name)
const TALL_BANNER_HEIGHT = 203 // the inside height of the tall top banner (holds name)
const TIP_TOP_FRAME = 6 // the width of the very outermost frame edge of the frame
const NO_ABILITY_BIO_CHAR_LIMIT = 330 // different char limit for when we do not need space for abilities
const PICTURE_HEIGHT = CARD_HEIGHT / 2 // height of framed profile picture
export default function PlayerCard({
  userId,
  tiltFactor = 0,
  gleamFollowsTilt = false,
  tiny = false,
  width = 300,
  showStatBoxes = false,
  asCelestialCard = false,
  overrideCelestialCard = null,
}: {
  userId: string | null
  tiltFactor?: number
  gleamFollowsTilt?: boolean
  tiny?: boolean
  width?: number
  showStatBoxes?: boolean
  asCelestialCard?: boolean
  overrideCelestialCard?: DbCelestialCard | null
}) {
  const scale = width / CARD_WIDTH
  const isTiny = tiny || width < 200
  // Calculate some of our constants based on card tinystatus
  const TOP_FROM_TOP = isTiny
    ? TOP_FROM_TOP_TALL_BANNER
    : TOP_FROM_TOP_SHORT_BANNER

  // derive calculate inner height inside the frame based on which banner we use
  const INNER_HEIGHT = CARD_HEIGHT - TOP_FROM_TOP - FRAME_FROM_EDGE

  const NAME_DIV_WIDTH =
    CARD_WIDTH -
    TIP_TOP_FRAME * 2 -
    (showStatBoxes ? CIRCLE_DIAMETER + CIRCLE_FROM_EDGE : 0) -
    (isTiny ? 0 : CIRCLE_DIAMETER) // ~estimates size of player_id, this could be its own placeholder prob

  const bioCharLimit = asCelestialCard
    ? BIO_CHAR_LIMIT
    : NO_ABILITY_BIO_CHAR_LIMIT
  const oneLineNameLengthLimit = showStatBoxes ? 12 : 18
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = usePublicProfile(userId)
  const profile = userId === null ? dummyProfile : profileData
  const washImageSrcs = {
    orange: '/images/cards/orange-wash.png',
    purple: '/images/cards/purple-wash.png',
    green: '/images/cards/green-wash.png',
    unassigned: '/images/cards/gray-wash.png',
    blue: '/images/cards/blue-wash.png',
  }
  //effective length of name for spacing concerns, factoring in pronouns
  const playerNameLength =
    (profile?.first_name?.length || 0) +
    (profile?.last_name?.length || 0) +
    ((!isTiny && profile?.pronouns?.length) || 0) +
    (profile?.minor ? 1 : 0)
  // Loading state - show gray wash, question mark, and frame
  if (profileLoading || profileError || !profile) {
    return (
      <div
        className="pointer-events-none relative max-w-full overflow-hidden rounded-[2px] font-imfell text-celestial-primary"
        style={{
          width: width,
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
          src="/images/cards/celestial-frame-2x3.png"
          alt="Frame overlay"
          fill
          className="pointer-events-none z-3 object-cover"
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
          <div className="flex flex-col items-center text-celestial-gray">
            <span>{profileLoading ? '?' : 'X'}</span>
            <span style={{ fontSize: 100 * scale }}>
              {profileLoading ? 'Loading...' : 'Error'}
            </span>
          </div>
        </div>
      </div>
    )
  }
  const celestialCard = overrideCelestialCard ?? profile?.celestial_card ?? null

  return (
    <Card borderless padless tiltFactor={tiltFactor}>
      <div
        className={`group relative max-w-full overflow-hidden rounded-[2px] text-left font-imfell`}
        style={{
          width: width,
          aspectRatio: CARD_WIDTH / CARD_HEIGHT,
        }}
      >
        <div
          id="holo"
          className={`z-4 ${styles.shine} ${styles.dice} absolute inset-0 z-3 size-full opacity-[.3] transition-opacity duration-300 hover:opacity-100`}
        />
        {/* Background card image */}
        <Image
          src={washImageSrcs[profile.team || 'unassigned']}
          alt="Celestial Base Color"
          fill
          className="z-1 object-cover"
        />
        {/* Frame Overlay */}
        <Image
          src={
            isTiny
              ? '/images/cards/celestial-frame-2x3-tallbanner.png'
              : '/images/cards/celestial-frame-2x3-shortbanner.png'
          }
          alt="Frame overlay"
          fill
          className="pointer-events-none z-3 object-cover"
        />
        {/* Breath Square icon */}
        {showStatBoxes && (
          <>
            <div
              style={{
                width: Math.floor(SQUARE_SIZE * scale),
                height: Math.floor(SQUARE_SIZE * scale),
                top: Math.floor(SQUARE_FROM_TOP * scale),
                left: Math.floor(SQUARE_FROM_EDGE * scale),
                clipPath: `polygon(
                  5px 0, calc(100% - 5px) 0, 100% 5px, 
                  100% calc(100% - 5px), calc(100% - 5px) 100%, 
                  5px 100%, 0 calc(100% - 5px), 0 5px
                )`,
                backgroundImage: `url('/images/cards/fog.gif')`,
              }}
              className="absolute z-5 overflow-hidden bg-cover"
            >
              <Image
                src="/images/cards/celestial-square-section.png"
                alt="Points"
                fill
                objectFit="cover"
                className="z-2"
              />
              {asCelestialCard && (
                <span
                  style={{ fontSize: 130 * scale }}
                  className="absolute top-1/2 left-1/2 z-3 -translate-x-1/2 -translate-y-1/2 font-cinzel text-celestial-primary"
                >
                  {celestialCard?.points ?? ''}
                </span>
              )}
            </div>
            {/* Points? Cirlce icon */}
            <div
              style={{
                width: CIRCLE_DIAMETER * scale,
                height: CIRCLE_DIAMETER * scale,
                top: CIRCLE_FROM_EDGE * scale,
                left: CIRCLE_FROM_EDGE * scale,
                backgroundImage: `url('/images/cards/fog.gif')`,
              }}
              className="absolute z-5 overflow-hidden rounded-full bg-cover"
            >
              <Image
                src="/images/cards/celestial-circle-cost.png"
                alt="Breath"
                fill
                objectFit="cover"
                className="z-2"
              />

              {asCelestialCard && (
                <span
                  style={{ fontSize: 130 * scale }}
                  className="absolute top-1/2 left-1/2 z-3 -translate-x-1/2 -translate-y-1/2 font-cinzel text-celestial-primary"
                >
                  {celestialCard?.cost ?? ''}
                </span>
              )}
            </div>
          </>
        )}
        {/* Player ID */}
        {!isTiny && (
          <div
            style={{
              top: (TOP_FROM_TOP / 2) * scale,
              right: 55 * scale,
              fontSize: 50 * scale,
              height: SHORT_BANNER_HEIGHT * scale,
            }}
            className="absolute z-4 flex -translate-y-1/2 items-center"
          >
            <span className="text-opacity-50 font-cinzel leading-none text-gray-400">
              #{profile.player_id}
            </span>
          </div>
        )}
        {/* Name */}
        <div
          style={{
            left: showStatBoxes ? 210 * scale : 40 * scale,
            top: TIP_TOP_FRAME * scale,
            height: isTiny
              ? TALL_BANNER_HEIGHT * scale
              : SHORT_BANNER_HEIGHT * scale,
            width: NAME_DIV_WIDTH * scale,
            fontSize: isTiny ? 75 * scale : 50 * scale,
          }}
          className="absolute z-3 flex items-center font-cinzel leading-none text-celestial-primary"
        >
          <strong className="flex items-center justify-start gap-1">
            {playerNameLength > oneLineNameLengthLimit ? (
              <div className="flex grow-0 flex-col" id="namecol">
                <span>{profile.first_name || ''}</span>
                <span>{profile.last_name || ''}</span>
              </div>
            ) : (
              <span className="grow-0" id="namesing">
                {`${profile.first_name || ''} ${profile.last_name || ''}`}
              </span>
            )}
            <span>{profile.minor ? '🌱' : ''}</span>
            {profile.pronouns && !isTiny && (
              <span
                style={{ fontSize: isTiny ? 50 * scale : 40 * scale }}
                className={`${playerNameLength > oneLineNameLengthLimit ? 'self-center' : 'self-end'} h-fit opacity-40`}
              >
                {profile.pronouns}
              </span>
            )}
          </strong>
        </div>
        {/* Card Content */}
        <div
          style={{
            width: INNER_WIDTH * scale,
            height: INNER_HEIGHT * scale,
            top: TOP_FROM_TOP * scale,
            left: FRAME_FROM_EDGE * scale,
          }}
          className="relative z-4 flex flex-col"
        >
          {/* Profile Picture */}
          <div
            style={{
              height: PICTURE_HEIGHT * scale,
              minHeight: PICTURE_HEIGHT * scale,
              maxHeight: PICTURE_HEIGHT * scale,
            }}
            className="relative w-full overflow-hidden"
          >
            <div
              style={{ padding: 16 * scale }}
              className="relative size-full overflow-hidden rounded-b-xs bg-gradient-to-br from-stone-400 via-stone-700 to-stone-400"
            >
              {/* Gray border */}
              <Image
                src={washImageSrcs.unassigned}
                alt="border"
                fill
                className="z-1 object-cover"
              />
              {/* Tilt-reactive spotlight (shows on hover), and flash bar fallback (shows when not hovered) */}
              {profile.profile_pictures_url ? (
                gleamFollowsTilt ? (
                  <div className="absolute inset-0 z-1 overflow-hidden">
                    {/* Spotlight (show only on hover) */}
                    <div
                      className="absolute inset-0 hidden group-hover:block"
                      style={{
                        background:
                          'radial-gradient(circle at calc(50% + (var(--tx, 0) * 60%)) calc(50% + (var(--ty, 0) * 60%)), rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 12%, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.0) 54%), radial-gradient(circle at calc(50% - (var(--tx, 0) * 60%)) calc(50% - (var(--ty, 0) * 60%)), rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.0) 78%)',
                        mixBlendMode: 'overlay',
                        filter: 'blur(1px)',
                      }}
                    />
                    {/* Flash bar (hide on hover) */}
                    <div className="absolute inset-0 h-[200%] w-[20%] animate-flash bg-gradient-to-r from-transparent via-gray-300 to-transparent group-hover:hidden" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-1 h-[200%] w-[20%] animate-flash bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                )
              ) : (
                <span
                  style={{ fontSize: 225 * scale }}
                  className="absolute inset-0 z-3 flex h-full w-full items-center justify-center text-celestial-gray"
                >
                  ?
                </span>
              )}
              <div className="relative size-full">
                {profile.profile_pictures_url && (
                  <Image
                    id="player-picture"
                    src={profile.profile_pictures_url}
                    alt="Profile picture"
                    fill
                    style={{ borderRadius: 12 * scale }}
                    className="z-2 object-cover"
                  />
                )}
                {asCelestialCard && (
                  <div
                    style={{
                      fontSize: 70 * scale,
                      padding: 1 * scale,
                      backgroundColor: 'rgba(50, 50, 80, 0.5)',
                    }}
                    className="absolute bottom-0 z-3 w-full text-center leading-tight text-celestial-primary"
                  >
                    {celestialCard?.name ?? ''}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Sub Profile Picture */}
          <div
            style={{
              fontSize: isTiny ? 65 * scale : 40 * scale,
            }}
            className="z-10 flex grow flex-col justify-between leading-none break-words text-black"
          >
            {/* Bio */}
            <div className="flex flex-col gap-1">
              {!isTiny && profile.bio && (
                <div
                  className="w-full p-1 whitespace-pre-line"
                  title={profile.bio ?? ''}
                >
                  {(() => {
                    if (isTiny || !profile.bio) return ''
                    // Count each newline as 24 extra characters
                    const newlineCount = profile.bio.match(/\n/g)?.length || 0
                    const effectiveLength =
                      profile.bio.length + newlineCount * 24

                    if (effectiveLength > bioCharLimit) {
                      // Find where to truncate accounting for newlines
                      let truncateAt = bioCharLimit
                      let currentLength = 0
                      let i = 0

                      while (
                        currentLength < bioCharLimit &&
                        i < profile.bio.length
                      ) {
                        if (profile.bio[i] === '\n') {
                          currentLength += 24
                        } else {
                          currentLength += 1
                        }
                        if (currentLength <= bioCharLimit) {
                          truncateAt = i + 1
                        }
                        i++
                      }

                      return profile.bio.slice(0, truncateAt) + '...'
                    }

                    return profile.bio
                  })()}
                </div>
              )}
              {/* Abilities? (hidden when used on Profile page) */}
              {asCelestialCard && celestialCard && celestialCard.text && (
                <div
                  style={{
                    backgroundImage: `url('/images/cards/gray-wash.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: 16 * scale,
                    margin: (isTiny ? 10 : 16) * scale,
                    borderWidth: 6 * scale,
                    borderStyle: 'solid',
                    borderImageSource: `linear-gradient(to top right, #FFD700, #B8860B)`,
                    borderImageSlice: 1,
                    fontSize: isTiny
                      ? 55 *
                        scale *
                        ((celestialCard.text?.length ?? 0) < 70 ? 1 : 0.9)
                      : 40 * scale,
                  }}
                  className="text-center text-balance whitespace-pre-line"
                  title={celestialCard.text?.replace(/\\n/g, '\n') ?? ''}
                >
                  {celestialCard.text?.replace(/\\n/g, '\n') ?? ''}
                </div>
              )}
            </div>
            {/* Bottom */}
            <div
              style={{ gap: 10 * scale }}
              className="flex w-full items-end justify-between"
            >
              {/* Bottom left */}
              {!isTiny && profile.discord_handle && (
                <div
                  style={{ gap: 10 * scale, paddingLeft: 10 * scale }}
                  className="flex items-center"
                >
                  <FaDiscord
                    style={{ width: 40 * scale, height: 40 * scale }}
                  />
                  {profile.discord_handle}
                </div>
              )}
              {/* Bottom right */}
              {profile.site_url && (
                <div
                  style={{
                    gap: 10 * scale,
                    paddingRight: 10 * scale,
                    fontSize: isTiny
                      ? asCelestialCard
                        ? 50 * scale
                        : 90 * scale
                      : 40 * scale,
                  }}
                  className={`flex items-center font-bold ${profile.site_name?.includes(' ') ? '' : 'break-all'}`}
                >
                  <GlobeIcon
                    style={{
                      width: isTiny
                        ? asCelestialCard
                          ? 50 * scale
                          : 90 * scale
                        : 40 * scale,
                      height: isTiny
                        ? asCelestialCard
                          ? 50 * scale
                          : 90 * scale
                        : 40 * scale,
                    }}
                    className="shrink-0"
                  />
                  <a
                    href={profile.site_url ?? ''}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto z-10 cursor-pointer underline"
                  >
                    {profile.site_name ||
                      profile.site_url?.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
