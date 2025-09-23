export type PlatformCapabilities = {
  cardSize: 'mobile' | 'tablet' | 'desktop' | 'large'
  portraitSize: 'mobile' | 'desktop'
}

export const detectPlatform = (): PlatformCapabilities => {
  if (typeof window === 'undefined') return { cardSize: 'desktop', portraitSize: 'desktop' }
  const width = window.innerWidth
  if (width < 480) return { cardSize: 'mobile', portraitSize: 'mobile' }
  if (width < 768) return { cardSize: 'tablet', portraitSize: 'mobile' }
  if (width < 1280) return { cardSize: 'desktop', portraitSize: 'desktop' }
  return { cardSize: 'large', portraitSize: 'desktop' }
}

export const usePlatformFeatures = (): PlatformCapabilities => {
  return detectPlatform()
}

