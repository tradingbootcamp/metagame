import Image from 'next/image'

import { DbProfile } from '@/types/database/dbTypeAliases'

// Establish some base numbers
const CARD_WIDTH = 944
const CARD_HEIGHT = 1344
const INNER_WIDTH = 784 //between walls of inner gold frame
const INNER_HEIGHT = 1147 // from bottom gold to top
const TOP_FROM_TOP = 121 // from top of card png to top of frame
const FROM_LEFT = 79
const PICTURE_HEIGHT = INNER_HEIGHT / 2

const BASELINE_CARD_WIDTH = 300

const scale = BASELINE_CARD_WIDTH / CARD_WIDTH

export default function PlayerCard({ profile }: { profile: DbProfile | null }) {
  const washImageSrc = (() => {
    switch (profile?.team) {
      case 'orange':
        return '/images/cards/orange-wash.png'
      case 'purple':
        return '/images/cards/purple-wash.png'
      case 'green':
        return '/images/cards/green-wash.png'
      default:
        return '/images/cards/gray-wash.png'
    }
  })()
  return (
    <div
      className="relative aspect-[944/1344] max-w-full"
      style={{
        width: BASELINE_CARD_WIDTH,
        aspectRatio: CARD_WIDTH / CARD_HEIGHT,
      }}
    >
      {/* Background card image */}
      <Image
        src={washImageSrc}
        alt="Celestial Base Color"
        fill
        className="z-1 object-cover"
      />
      {/* Player picture */}
      <div
        style={{
          width: INNER_WIDTH * scale,
          height: PICTURE_HEIGHT * scale,
          top: TOP_FROM_TOP * scale,
          left: FROM_LEFT * scale,
        }}
        className="relative z-2 overflow-hidden"
      >
        <div className="relative size-full overflow-hidden bg-gradient-to-br from-stone-400 via-stone-700 to-stone-400 p-2">
          <div className="relative size-full">
            <Image
              id="player-picture"
              src={profile?.profile_pictures_url ?? '/images/incognito.svg'}
              alt="Profile picture"
              fill
              className="z-2 object-cover"
            />
          </div>
          <div className="animate-flash absolute inset-0 z-1 h-[200%] w-[20%] bg-gradient-to-r from-transparent via-yellow-100 to-transparent"></div>
        </div>
      </div>
      {/* Frame Overlay */}
      <Image
        src="/images/cards/celestial-frame.png"
        alt="Frame overlay"
        fill
        className="z-3 object-cover"
      />
      {/* Sub Profile Picture */}
      <div
        style={{
          width: INNER_WIDTH * scale,
          left: FROM_LEFT * scale,
          top: (PICTURE_HEIGHT + TOP_FROM_TOP) * scale,
        }}
        className="absolute z-2"
      >
        {/* Bio */}
        <div className="w-full p-2 font-imfell text-sm leading-none text-black">
          {profile?.bio && profile.bio.length > 200
            ? profile?.bio?.slice(0, 200) + '...'
            : profile?.bio}
        </div>
      </div>
    </div>
  )
}
