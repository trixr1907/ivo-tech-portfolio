import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'counting' | 'done'>('counting')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('ivo-loaded') === 'true') {
      onDone()
      return
    }
    const started = performance.now()
    const timer = window.setInterval(() => {
      const next = Math.min(100, Math.round(((performance.now() - started) / 500) * 100))
      setProgress(next)
      if (next >= 100) {
        window.clearInterval(timer)
        sessionStorage.setItem('ivo-loaded', 'true')
        setPhase('done')
        window.setTimeout(onDone, 80)
      }
    }, 24)
    return () => window.clearInterval(timer)
  }, [onDone])

  return (
    <AnimatePresence>
      {phase !== 'done' || progress < 100 ? (
        <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}>
          <div className="loader-inner">
            <motion.div
              className="loader-wordmark"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <img src="/brand/logos/ivo-tech-logo-master.svg" alt="ivo-tech" decoding="async" width={140} height={31} />
            </motion.div>
            <div className="loader-bar">
              <motion.div className="loader-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="loader-num">{String(progress).padStart(3, '0')}</div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
