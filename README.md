# WTS '24 Theme

![wts-theme](https://github.com/user-attachments/assets/a15e22f7-15f0-4672-8702-259aabf1cb83)

## Background

Back in September 2024, we had our first What The Stack conference. It was a pretty good overall, and we got some really positive feedback for the website. So we decided to make it a theme, and publish it as open source.

## Features

- Retrofuturistic and synthwave inspired theme (with ambitions of being a design system when it grows up)
- Speaker showcase with profile pictures and bios
- Schedule display with session details and timings
- Ticket pricing section with multiple tier options
- Sponsor logos display
- Contact form
- Easy to customize and extend

## Stack

- Astro
- Tailwind
- DaisyUI (with the Synthwave theme, duh)

## Data and Content

When we first started, we made the "wise" decision of going full Astro content collections. Not to say it's a bad decision, but we ended up having to reinvent relational data 😅 It works fine though, as long as you stick with some of the existing conventions.

1. Each session in the sessions collection requires a `speakerId` which is a reference to a speaker in the speakers collection.
2. `speakerId` is an array, so you can have multiple speakers for a session.
3. The rest of the data config can be found in the `src/content/config.ts` file (but most of the frontmatter data is optional).

## Credits

Thanks to everyone who contributed to the theme! List below:

- [@DBozhinovski](https://github.com/DBozhinovski)
- [@iboshkov](https://github.com/iboshkov)
- [@BStojanoska](https://github.com/BStojanoska)
