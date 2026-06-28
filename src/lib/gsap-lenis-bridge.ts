import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Call this ONCE after Lenis is initialized.
 * Bridges Lenis scroll events into GSAP ScrollTrigger.
 */
export function bridgeGsapLenis(lenis: Lenis): () => void {
  // Tell ScrollTrigger to use the Lenis scroll position
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value?: number) {
      if (arguments.length && value !== undefined) {
        lenis.scrollTo(value, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
    },
    pinType: document.body.style.transform ? 'transform' : 'fixed',
  })

  // Sync lenis raf with ScrollTrigger
  const onScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onScroll)

  // Cleanup on destroy
  return () => {
    lenis.off('scroll', onScroll)
  }
}
