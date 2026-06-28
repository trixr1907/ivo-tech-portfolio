import { motion, useReducedMotion } from 'motion/react'

export function SplitTitle({ line1, line2, line3 }: { line1: string; line2: string; line3: string }) {
  const reduceMotion = useReducedMotion()
  const lines = [line1, line2, line3]

  return (
    <h1 id="hero-h" className="hero-title">
      <span className="sr-only">{`${line1} ${line2} ${line3}`}</span>
      {lines.map((line, li) => (
        <span key={li} className="title-line" aria-hidden="true">
          <motion.span
            initial={reduceMotion ? false : { y: '115%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.88, delay: 0.3 + li * 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}
