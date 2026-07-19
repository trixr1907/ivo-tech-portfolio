import { motion, useReducedMotion } from 'motion/react'

type SplitTitleProps = {
  lines: string[]
  immediate?: boolean
}

export function SplitTitle({ lines, immediate = false }: SplitTitleProps) {
  const reduceMotion = useReducedMotion()

  return (
    <h1 id="hero-h" className="hero-title">
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, index) => (
        <span key={line} className="title-line" aria-hidden="true">
          <motion.span
            initial={reduceMotion || immediate ? false : { y: '115%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.88, delay: 0.3 + index * 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}
