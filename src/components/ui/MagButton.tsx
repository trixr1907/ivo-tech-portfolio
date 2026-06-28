import { useRef, useCallback, type MouseEvent, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'

export function MagButton({
  children,
  className = '',
  href,
  target,
  rel,
  onClick,
}: {
  children: ReactNode
  className?: string
  href?: string
  target?: string
  rel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduceMotion || !ref.current) return
      const r = ref.current.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width / 2) * 0.22
      const dy = (e.clientY - r.top - r.height / 2) * 0.22
      ref.current.style.transform = `translate(${dx}px,${dy}px)`
    },
    [reduceMotion],
  )
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0px,0px)'
  }, [])

  const transition = 'transform 0.35s cubic-bezier(0.23,1,0.32,1)'

  if (href)
    return (
      <a
        ref={ref}
        className={className}
        href={href}
        target={target}
        rel={rel}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        style={{ transition }}
      >
        {children}
      </a>
    )
  return (
    <button
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ transition }}
    >
      {children}
    </button>
  )
}
