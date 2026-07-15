import { memo, useRef, useEffect } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './about-4d-layering.css' // We will create this specific CSS for the effect

export const AboutPortrait = memo(function AboutPortrait() {
  const tiltRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  
  // Parallax speeds for different layers to create depth
  const textBgY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const imgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
  const textFgY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])

  useEffect(() => {
    if (reduceMotion || !tiltRef.current) return
    const el = tiltRef.current
    const MAX = 12 // Increased tilt for stronger 3D effect

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(1000px) rotateY(${x * MAX * 2}deg) rotateX(${-y * MAX}deg)`
    }
    const onLeave = () => {
      el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [reduceMotion])

  // The text we want to display behind and in front
  const layerText = (
    <>
      <span>CREATING</span>
      <span className="text-cyan">SOTA</span>
      <span>EXPERIENCES</span>
    </>
  )

  return (
    <div ref={sectionRef} className="about-4d-wrap">
      <div
        ref={tiltRef}
        className="about-4d-tilt"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s linear', willChange: 'transform' }}
      >
        
        {/* Layer 1: Solid Background Typography (Way in the back) */}
        <motion.div 
          className="about-4d-text about-4d-text-bg" 
          style={{ y: textBgY, transform: 'translateZ(-60px)' }}
          aria-hidden="true"
        >
          {layerText}
        </motion.div>

        {/* Layer 2: The Cutout Portrait (Middle) */}
        <motion.div 
          className="about-4d-img-wrap" 
          style={{ y: imgY, transform: 'translateZ(20px)' }}
        >
          <img
            src="/images/about/ivo-portrait-cutout.png"
            alt="Portrait von Ivo"
            loading="eager"
            decoding="async"
            width={500}
            height={500}
            className="about-4d-img"
          />
          {/* A soft shadow directly under the cutout to ground it */}
          <div className="about-4d-img-shadow" />
        </motion.div>

        {/* Layer 3: Outlined Foreground Typography (Popping out in front) */}
        <motion.div 
          className="about-4d-text about-4d-text-fg" 
          style={{ y: textFgY, transform: 'translateZ(80px)' }}
          aria-hidden="true"
        >
          {layerText}
        </motion.div>

      </div>
    </div>
  )
})
