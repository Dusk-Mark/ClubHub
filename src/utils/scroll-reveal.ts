import type { App, Directive, DirectiveBinding } from 'vue'

type RevealOrigin = 'up' | 'left' | 'right' | 'zoom'

interface RevealOptions {
  origin?: RevealOrigin
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  threshold?: number
}

interface NormalizedRevealOptions {
  origin: RevealOrigin
  delay: number
  duration: number
  distance: number
  once: boolean
  threshold: number
}

const DEFAULT_OPTIONS: NormalizedRevealOptions = {
  origin: 'up',
  delay: 0,
  duration: 860,
  distance: 52,
  once: true,
  threshold: 0.18,
}

const revealObservers = new WeakMap<HTMLElement, IntersectionObserver>()

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') {
    return true
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const normalizeOptions = (
  binding: DirectiveBinding<RevealOptions | RevealOrigin | undefined>,
): NormalizedRevealOptions => {
  if (typeof binding.value === 'string') {
    return {
      ...DEFAULT_OPTIONS,
      origin: binding.value,
    }
  }

  if (typeof binding.value === 'object' && binding.value !== null) {
    return {
      ...DEFAULT_OPTIONS,
      ...binding.value,
    }
  }

  return { ...DEFAULT_OPTIONS }
}

const disconnectObserver = (element: HTMLElement) => {
  const observer = revealObservers.get(element)

  if (observer) {
    observer.disconnect()
    revealObservers.delete(element)
  }
}

const applyHiddenState = (element: HTMLElement, options: NormalizedRevealOptions) => {
  let revealX = '0px'
  let revealY = '0px'
  let revealScale = '1'

  if (options.origin === 'up') {
    revealY = `${options.distance}px`
  }

  if (options.origin === 'left') {
    revealX = `-${options.distance}px`
  }

  if (options.origin === 'right') {
    revealX = `${options.distance}px`
  }

  if (options.origin === 'zoom') {
    revealScale = '0.94'
    revealY = `${Math.round(options.distance * 0.35)}px`
  }

  element.dataset.reveal = 'hidden'
  element.style.setProperty('--reveal-x', revealX)
  element.style.setProperty('--reveal-y', revealY)
  element.style.setProperty('--reveal-scale', revealScale)
  element.style.setProperty('--reveal-delay', `${options.delay}ms`)
  element.style.setProperty('--reveal-duration', `${options.duration}ms`)
}

const applyVisibleState = (element: HTMLElement) => {
  element.dataset.reveal = 'visible'
}

const initializeReveal = (
  element: HTMLElement,
  binding: DirectiveBinding<RevealOptions | RevealOrigin | undefined>,
) => {
  disconnectObserver(element)

  const options = normalizeOptions(binding)

  if (prefersReducedMotion()) {
    applyVisibleState(element)
    return
  }

  applyHiddenState(element, options)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          applyVisibleState(element)

          if (options.once) {
            disconnectObserver(element)
          }

          return
        }

        if (!options.once) {
          applyHiddenState(element, options)
        }
      })
    },
    {
      threshold: options.threshold,
    },
  )

  observer.observe(element)
  revealObservers.set(element, observer)
}

const scrollRevealDirective: Directive<HTMLElement, RevealOptions | RevealOrigin | undefined> = {
  mounted(element, binding) {
    initializeReveal(element, binding)
  },
  updated(element, binding) {
    if (binding.value !== binding.oldValue) {
      initializeReveal(element, binding)
    }
  },
  unmounted(element) {
    disconnectObserver(element)
  },
}

export const registerScrollReveal = (app: App<Element>) => {
  app.directive('reveal', scrollRevealDirective)
}
