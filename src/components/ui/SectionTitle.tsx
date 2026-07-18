import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

export type SectionTitleLine = {
  text: string
  /** Wrap entire line in <em> styling */
  em?: boolean
}

type SectionTitleProps = {
  id: string
  className?: string
  lines: SectionTitleLine[]
}

/**
 * One-shot word/line stagger for section H2s.
 * reduced-motion → static text. Safety: never stays invisible.
 */
export function SectionTitle({ id, className, lines }: SectionTitleProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLHeadingElement>(null)
  const inView = useInView(rootRef, { once: true, amount: 0.25, margin: '0px 0px -8% 0px' })
  const [forceShow, setForceShow] = useState(false)
  const plain = lines.map((l) => l.text).join(' ')
  const active = Boolean(reduceMotion || inView || forceShow)

  // Intersection can miss under Lenis/smooth-scroll; never leave titles blank
  useEffect(() => {
    if (active) return
    const t = window.setTimeout(() => setForceShow(true), 1800)
    return () => window.clearTimeout(t)
  }, [active])

  return (
    <h2 id={id} className={className} ref={rootRef}>
      <span className="sr-only">{plain}</span>
      {lines.map((line, li) => {
        const words = line.text.split(/\s+/).filter(Boolean)
        const LineTag = line.em ? 'em' : 'span'
        return (
          <span key={li} className="sec-title-line" aria-hidden="true">
            <LineTag className={line.em ? 'sec-title-em' : undefined}>
              {words.map((word, wi) => (
                <span key={`${li}-${wi}`} className="sec-title-word">
                  <motion.span
                    className="sec-title-word-inner"
                    initial={reduceMotion ? false : { y: '110%', opacity: 0 }}
                    animate={
                      active
                        ? { y: '0%', opacity: 1 }
                        : { y: '110%', opacity: 0 }
                    }
                    transition={{
                      duration: 0.72,
                      delay: active ? 0.05 + li * 0.09 + wi * 0.04 : 0,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </LineTag>
          </span>
        )
      })}
    </h2>
  )
}
