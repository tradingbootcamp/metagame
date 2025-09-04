# Metagame 2025

## Overview

This is a website for the Metagame 2025 conference.

## Contributing

Metagame is intended to be collaborative! Anybody can insert a little game into the site! Please feel free to make a fork, make a feature branch, and submit a PR.

If you'd like to add a coupon associated with your game, please reach out to Ricki (ricki.heicklen@gmail.com) or leave a note about that in the PR.

If you have any problems with or requests for the site and don't want to fix it yourself, let us know or open an issue on Github

## Running the site

Install pnpm if you don't have it already:

```
npm install -g pnpm
```

Start the local supabase database (requires docker & 12GB free space):

```
npx supabase start
```

Copy `.env.local.template` to `.env.local` and fill in the anon and secret_role keys from the output of `supabase start`

Then run the site with:

```
pnpm dev
```

The site should now be running at `http://localhost:3000`

### Requirements

- Node.js 18 or later
- pnpm 8.x or later
- Docker (for local supabase instance)
