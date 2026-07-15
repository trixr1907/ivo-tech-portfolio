import { memo, useRef, useEffect } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './about-4d-layering.css' // We will repurpose this for the clean portrait styling

export const AboutPortrait = memo(function AboutPortrait() {
  const tiltRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  
  // Subtle vertical parallax for the image itself
  const imgY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])
  
  // Parallax for the glow behind the portrait (moves opposite to create depth)
  const glowY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  useEffect(() => {
    if (reduceMotion || !tiltRef.current) return
    const el = tiltRef.current
    const MAX = 6 // Very subtle tilt, not aggressive

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(1200px) rotateY(${x * MAX * 2}deg) rotateX(${-y * MAX}deg)`
    }
    const onLeave = () => {
      el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [reduceMotion])

  return (
    <div ref={sectionRef} className="about-clean-wrap">
      <div
        ref={tiltRef}
        className="about-clean-tilt"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out', willChange: 'transform' }}
      >
        
        {/* Layer 1: Ambient Glow (Way in the back) */}
        <motion.div 
          className="about-clean-glow" 
          style={{ y: glowY, transform: 'translateZ(-40px)' }}
          aria-hidden="true"
        />

        {/* Layer 2: The Cutout Portrait (Middle) */}
        <motion.div 
          className="about-clean-img-wrap" 
          style={{ y: imgY, transform: 'translateZ(20px)' }}
        >
          <img
            src="/images/about/ivo-portrait-cutout.png"
            alt="Portrait von Ivo"
            loading="eager"
            decoding="async"
            width={600}
            height={600}
            className="about-clean-img"
          />
        </motion.div>

      </div>
    </div>
  )
})
