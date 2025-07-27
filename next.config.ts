import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'metagame.games',
      'fkarmpoupazxnshofaeg.supabase.co',
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },
  distDir: 'dist',
  // Redirects configuration
  // the proset-poster is hardcoded into QR code in the poster version but should also lead here
  async redirects() {
    return [
      {
        source: '/proset-poster',
        destination: '/proset-puzzle',
        permanent: true, // This creates a 308 permanent redirect
      },
      {
        source: '/recon', // for the RECON sponsorship QR code
        destination: '/proset-puzzle',
        permanent: true, // This creates a 308 permanent redirect
      },
    ];
  },
  // Environment variables
  env: {
    PUBLIC_INTEREST_FORM_URL: process.env.PUBLIC_INTEREST_FORM_URL,
    PUBLIC_TICKET_EARLY_BIRD_URL: process.env.PUBLIC_TICKET_EARLY_BIRD_URL,
    PUBLIC_TICKET_REGULAR_URL: process.env.PUBLIC_TICKET_REGULAR_URL,
    PUBLIC_TICKET_VOLUNTEER_URL: process.env.PUBLIC_TICKET_VOLUNTEER_URL,
    PUBLIC_TICKET_SUPPORTER_URL: process.env.PUBLIC_TICKET_SUPPORTER_URL,
    PUBLIC_CALL_FOR_SPEAKERS: process.env.PUBLIC_CALL_FOR_SPEAKERS,
    PUBLIC_CALL_FOR_SESSIONS: process.env.PUBLIC_CALL_FOR_SESSIONS,
    PUBLIC_CALL_FOR_VOLUNTEERS: process.env.PUBLIC_CALL_FOR_VOLUNTEERS,
    PUBLIC_CALL_FOR_SPONSORS: process.env.PUBLIC_CALL_FOR_SPONSORS,
  },
};

export default nextConfig;
