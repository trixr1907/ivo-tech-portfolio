import { useState, useEffect, useRef } from 'react'

export function useScrollspy(sectionIds: string[], offset = 120) {
  const [activeId, setActiveId] = useState<string>('')
  const observers = useRef<IntersectionObserver[]>([])

  useEffect(() => {
    // Reset observers
    observers.current.forEach(obs => obs.disconnect())
    observers.current = []

    const visibleSections = new Map<string, number>()

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target.id, entry.intersectionRatio)
        } else {
          visibleSections.delete(entry.target.id)
        }
      })

      if (visibleSections.size > 0) {
        // Find the section taking up the most of the screen
        let maxRatio = 0
        let currentActive = ''
        
        visibleSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            currentActive = id
          }
        })
        
        if (currentActive) {
          setActiveId(currentActive)
        }
      } else if (window.scrollY < offset) {
        // Fallback for top of page
        setActiveId('')
      }
    }

    const observerOptions = {
      root: null,
      rootMargin: `-${offset}px 0px -20% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    observers.current.push(observer)

    // Wait a tick for the DOM to be fully painted (lazy loaded components)
    setTimeout(() => {
      sectionIds.forEach(id => {
        const element = document.getElementById(id)
        if (element) {
          observer.observe(element)
        }
      })
    }, 500)

    return () => {
      observers.current.forEach(obs => obs.disconnect())
    }
  }, [sectionIds, offset])

  return activeId
}
