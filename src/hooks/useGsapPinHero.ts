import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SCROLL_DISTANCE_VH = 320

export function useGsapPinHero(heroRef: RefObject<HTMLElement | null>, ready = true) {
  useEffect(() => {
    const el = heroRef.current
    if (!ready || !el) return

    const media = gsap.matchMedia()
    media.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', () => {
      const publish = (progress: number) => {
        const value = Math.max(0, Math.min(1, progress))
        el.style.setProperty('--hero-sequence-progress', `${value}`)
        el.dispatchEvent(new CustomEvent('hero-sequence-progress', { detail: value }))
      }
      publish(0)

      const heroInner = el.querySelector<HTMLElement>('.hero-inner')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: `+=${SCROLL_DISTANCE_VH}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => publish(self.progress),
        },
      })
      if (heroInner) {
        tl.to(heroInner, { opacity: 0.12, xPercent: -5, duration: 0.25, ease: 'none' }, 0.25)
      }

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
        publish(0)
      }
    })

    return () => media.revert()
  }, [heroRef, ready])
}
