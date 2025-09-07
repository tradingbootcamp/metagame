export function setFavicon(href: string) {
  if (typeof document === 'undefined') return

  // Remove existing favicon links so we can append ours last
  const existing = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"]',
  )
  existing.forEach((el) => el.parentNode?.removeChild(el))

  const link = document.createElement('link')
  link.rel = 'icon'
  if (href.endsWith('.svg') || href.startsWith('data:image/svg+xml'))
    link.type = 'image/svg+xml'
  link.href = href
  link.id = 'dynamic-favicon'
  document.head.appendChild(link)
}

// Ensures favicon is applied after potential head rehydration
export function setFaviconStabilized(href: string) {
  setFavicon(href)
  if (typeof window !== 'undefined') {
    // Re-apply on next frames and short timeouts to outlast head updates
    requestAnimationFrame(() => setFavicon(href))
    setTimeout(() => setFavicon(href), 0)
    setTimeout(() => setFavicon(href), 50)
    setTimeout(() => setFavicon(href), 200)
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
