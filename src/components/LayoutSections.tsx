import { useCallback, useRef, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36, clipPath: 'inset(0% 0% 12% 0%)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, amount: 0.14, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1], clipPath: { duration: 0.75, delay } }}
    >
      {children}
    </motion.div>
  )
}

function MagButton({
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
  onClick?: () => void
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

const stackRows = [
  ['Automation', 'Local tooling', 'React', 'TypeScript', 'Three.js'],
  ['Home Assistant', 'Proxmox', 'Docker', 'Motion Design', 'WebGL'],
  ['Local LLMs', 'Vite', 'Node.js', 'SQLite', 'GSAP'],
]

export function StackSection() {
  return (
    <section id="stack" className="section stack-section" aria-labelledby="stack-h">
      <div className="section-inner">
        <Reveal className="sec-head">
          <div>
            <span className="sec-label">Stack</span>
            <span className="sec-num">— 07</span>
          </div>
          <h2 id="stack-h">Tools auf meinem Radar</h2>
        </Reveal>
        <div className="stack-rows">
          {stackRows.map((row, ri) => (
            <Reveal key={ri} delay={ri * 0.06}>
              <div className="stack-row">
                {row.map((item) => (
                  <motion.span
                    key={item}
                    className="stack-tag"
                    whileHover={{ borderColor: 'rgba(0,183,255,0.55)', color: '#fff', y: -3 }}
                    transition={{ duration: 0.16 }}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ContactSection() {
  return (
    <section id="kontakt" className="section contact-section" aria-labelledby="contact-h">
      <Reveal>
        <div className="contact-wrap">
          <div className="cw-top">
            <span className="sec-label">Kontakt</span>
            <span className="sec-num">— 08</span>
          </div>
          <h2 id="contact-h" className="cw-headline">
            Lass uns etwas bauen,
            <br />
            das sich <em>echt anfühlt.</em>
          </h2>
          <p className="cw-body">
            Offen für Festanstellung als Frontend-/Full-Stack Developer und ausgewählte Freelance-Projekte.
            Schreib mir mit Rolle, Projekt oder Frage — ich antworte.
          </p>
          <div className="cw-ctas">
            <MagButton className="btn-primary" href="mailto:contact@ivo-tech.com">
              <ExternalLink size={15} /> Schreib mir
            </MagButton>
            <MagButton className="btn-ghost" href="https://github.com/trixr1907" target="_blank" rel="noreferrer">
              GitHub ansehen
            </MagButton>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner section-shell">
        <div className="ft-left">
          <img src="/brand/logos/ivo-tech-logo-master.svg" alt="ivo-tech" loading="lazy" decoding="async" width={118} height={26} />
        </div>
        <p className="ft-copy">Full-Stack Engineer · Mannheim · {new Date().getFullYear()}</p>
        <div className="ft-links">
          <a href="#top">Top</a>
          <a href="#selected-work">Projekte</a>
          <a href="mailto:contact@ivo-tech.com">Kontakt</a>
          <a href="https://github.com/trixr1907" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
