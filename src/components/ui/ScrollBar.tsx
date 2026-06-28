import { useScroll, useSpring, motion } from 'motion/react'

export function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40 })
  return <motion.div className="scroll-bar" style={{ scaleX }} />
}
