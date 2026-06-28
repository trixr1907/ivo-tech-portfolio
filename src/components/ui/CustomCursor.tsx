import { useRef, useEffect } from 'react'
import { useReducedMotion } from 'motion/react'

export function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -200, y: -200 })
  const ring = useRef({ x: -200, y: -200 })
  const stateRef = useRef<'default' | 'link' | 'card'>('default')
  const initializedRef = useRef(false)
  const rafRef = useRef(0)

  useEffect(() => {
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return
    const move = (e: MouseEvent) => {
      const next = { x: e.clientX, y: e.clientY }
      pos.current = next

      if (!initializedRef.current) {
        ring.current = next
        initializedRef.current = true
      }
    }
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('.lab-card, .reveal-card')) stateRef.current = 'card'
      else if (t.closest('a, button')) stateRef.current = 'link'
      else stateRef.current = 'default'
    }
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      const state = stateRef.current
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.1)
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.1)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x - 3}px,${pos.current.y - 3}px,0)`
      }
      if (ringRef.current) {
        const s = state === 'card' ? 60 : state === 'link' ? 44 : 28
        ringRef.current.style.transform = `translate3d(${ring.current.x - s / 2}px,${ring.current.y - s / 2}px,0)`
        ringRef.current.style.width = s + 'px'
        ringRef.current.style.height = s + 'px'
        ringRef.current.style.mixBlendMode = state === 'card' ? 'screen' : 'normal'
        ringRef.current.style.borderColor =
          state === 'card' ? 'rgba(0,183,255,0.7)' : state === 'link' ? 'rgba(0,183,255,0.6)' : 'rgba(220,230,242,0.45)'
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduceMotion])

  if (reduceMotion) return null

  return (
    <>
      <div ref={dotRef} className="c-dot" aria-hidden="true" />
      <div ref={ringRef} className="c-ring" aria-hidden="true" />
    </>
  )
}
