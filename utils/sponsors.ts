import type { Partner } from '@/lib/content'

export const sponsors: Partner[] = [
  {
    id: 1,
    name: 'Bitcoin',
    logo: '/logos/bitcoin-white.png',
    wideLogo: false,
    website: 'https://www.bitcoin.org/',
    type: 'sponsor',
    tier: 'headline',
  },
  {
    id: 4,
    name: 'RECON',
    logo: '/logos/recon.webp',
    wideLogo: false,
    website: 'https://realityescapecon.com/',
    type: 'sponsor',
    tier: 'silver',
  },
  {
    id: 5,
    name: 'Morty',
    logo: '/logos/morty.svg',
    wideLogo: false,
    website: 'https://morty.app/',
    type: 'sponsor',
    tier: 'silver',
  },
  {
    id: 7,
    name: 'Sovereign',
    logo: '/logos/L_Sovereign_Logo_Gold_Gradient_Gold_Typeface.svg',
    wideLogo: false,
    website:
      'https://www.notion.so/nascent/Sovereign-Metagame-264d307ab5638076a3dff139fc1b78e1?source=copy_link',
    type: 'sponsor',
    tier: 'gold',
    description:
      'TechCorp is a leading provider of innovative gaming infrastructure and technology solutions, supporting the next generation of game developers.',
    tagline: 'Powering the Future of Gaming',
    industry: 'Gaming Technology',
    twitter: 'https://twitter.com/techcorp',
    linkedin: 'https://linkedin.com/company/techcorp',
    github: 'https://github.com/techcorp',
  },
  {
    id: 8,
    name: 'Celestial',
    logo: '/logos/Celestial_Logo_Black.svg',
    wideLogo: false,
    website: 'https://celestialdecks.gg/about',
    type: 'sponsor',
    tier: 'gold',
    description: 'Celestial is a card game',
  },
]
