import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36, clipPath: 'inset(0% 0% 12% 0%)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, amount: 0.05, margin: '0px 0px -4% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1], clipPath: { duration: 0.75, delay } }}
    >
      {children}
    </motion.div>
  )
}
