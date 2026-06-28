import { memo, useRef, useEffect } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

export const AboutPortrait = memo(function AboutPortrait() {
  const tiltRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  useEffect(() => {
    if (reduceMotion || !tiltRef.current) return
    const el = tiltRef.current
    const MAX = 7

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateY(${x * MAX * 2}deg) rotateX(${-y * MAX}deg) scale3d(1.02,1.02,1.02)`
    }
    const onLeave = () => {
      el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [reduceMotion])

  return (
    <div ref={sectionRef} className="about-portrait-wrap">
      <div
        ref={tiltRef}
        className="about-tilt-wrap"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s linear', willChange: 'transform' }}
      >
        <div className="about-sunset-card" aria-hidden="true">
          <picture>
            <source srcSet="/images/about/ivo-sunset.webp" type="image/webp" />
            <img
              src="/images/about/ivo-sunset.jpg"
              alt="Ivo an der Küste bei Sonnenuntergang"
              loading="eager"
              decoding="async"
              width={720}
              height={723}
              sizes="(max-width: 680px) 120px, 160px"
              className="about-sunset-img"
            />
          </picture>
          <span className="about-sunset-label">GOLDEN HOUR</span>
        </div>

        <div className="about-portrait-inner">
          <div className="about-portrait-rim" aria-hidden="true" />

          <motion.div className="about-portrait-scroll" style={{ y: imgY }}>
            <picture>
              <source srcSet="/images/about/ivo-portrait.webp" type="image/webp" />
              <img
                src="/images/about/ivo-portrait.jpeg"
                alt="Portrait von Ivo"
                loading="eager"
                decoding="async"
                width={800}
                height={800}
                sizes="(max-width: 680px) calc(100vw - 3rem), (max-width: 900px) 380px, 420px"
                className="about-portrait-img"
              />
            </picture>
          </motion.div>

          <div className="about-portrait-corners" aria-hidden="true" />

          <div className="about-badge" aria-hidden="true">
            <span className="about-badge-dot" />
            IRL · Mannheim
          </div>

          <div className="about-coords" aria-hidden="true">49.487° N · 8.466° E</div>

          <div className="about-portrait-overlay" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
})
