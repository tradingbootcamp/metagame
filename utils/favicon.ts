export function setFavicon(href: string) {
  if (typeof document === 'undefined') return

  let link: HTMLLinkElement | null = Array.from(
    document.querySelectorAll('link[rel="icon"]'),
  ).at(-1) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = href
}

// Ensures favicon is applied after potential head rehydration
export function setFaviconStabilized(href: string) {
  setFavicon(href)
  if (typeof window !== 'undefined') {
    // Re-apply on next frames and short timeouts to outlast head updates
    requestAnimationFrame(() => setFavicon(href))
    // setTimeout(() => setFavicon(href), 0)
    // setTimeout(() => setFavicon(href), 50)
    // setTimeout(() => setFavicon(href), 200)
  }
}

// Observe head changes briefly and enforce our favicon
export function enforceFavicon(href: string, durationMs = 1500) {
  setFavicon(href)
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined')
    return

  const target = document.head
  const observer = new MutationObserver(() => {
    const icons = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"]',
    )
    // If anything other than our icon is present, re-apply
    const hasForeign = Array.from(icons).some(
      (l) =>
        l.id !== 'dynamic-favicon' ||
        l.href !== new URL(href, location.href).href,
    )
    if (hasForeign || icons.length === 0) {
      setFavicon(href)
    }
  })

  observer.observe(target, { childList: true, subtree: true })
  setTimeout(() => observer.disconnect(), durationMs)
}
