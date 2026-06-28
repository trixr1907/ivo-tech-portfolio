import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Applies GSAP clip-path reveal to all elements matching the selector
 * within the given container. Call once in a section-level component.
 */
export function useGsapReveal(containerSelector: string, elementSelector = 'h2, .reveal-gsap', ready = true) {
  useEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const container = document.querySelector(containerSelector)
    if (!container) return

    const els = container.querySelectorAll(elementSelector) as NodeListOf<HTMLElement>
    els.forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [containerSelector, elementSelector, ready])
}
