import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGsapPinHero(heroRef: RefObject<HTMLElement | null>, ready = true) {
  useEffect(() => {
    if (!ready) return

    const el = heroRef.current
    if (!el || window.matchMedia('(max-width: 768px)').matches) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=32%',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      },
    })

    // Headline stays, 3D element scales slightly down
    const heroVisual = el.querySelector('.hero-visual')
    if (heroVisual) {
      tl.to(heroVisual, { scale: 0.92, opacity: 0.7, ease: 'none' })
    }

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [heroRef, ready])
}
