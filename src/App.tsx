import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import './App.css'
import './relaunch.css'

import { ErrorBoundary } from './components/ErrorBoundary'
import { Loader } from './components/ui/Loader'
import { MagButton } from './components/ui/MagButton'
import { MeshBackground, HERO_3D_FALLBACK_SRC } from './components/ui/MeshBackground'
import { CustomCursor } from './components/ui/CustomCursor'
import { ScrollBar } from './components/ui/ScrollBar'
import { SplitTitle } from './components/ui/SplitTitle'
import { Showcase } from './components/showcase/Showcase'
import { AboutSection, CraftSection, LabSection, ContactSection, RelaunchFooter } from './components/relaunch/RelaunchSections'

const Hero3DLogo = lazy(() => import('./components/Hero3DLogo'))
const COMPACT_HERO_QUERY = '(max-width: 960px), (hover: none), (pointer: coarse)'

const navItems = [
  { label: 'Über mich', href: '#about' },
  { label: 'Work', href: '#selected-work' },
  { label: 'Craft', href: '#craft' },
  { label: 'Lab', href: '#lab' },
  { label: 'Kontakt', href: '#kontakt' },
]

function App() {
  const reduceMotion = useReducedMotion()
  const [compactHero, setCompactHero] = useState(() => window.matchMedia(COMPACT_HERO_QUERY).matches)
  const [loaded, setLoaded] = useState(compactHero)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const heroStageRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const enableHero3D = !compactHero && !reduceMotion

  useEffect(() => {
    const query = window.matchMedia(COMPACT_HERO_QUERY)
    const update = () => setCompactHero(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [loaded])

  useEffect(() => {
    if (!loaded || !enableHero3D || canvasReady) return
    const stage = heroStageRef.current
    if (!stage) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setCanvasReady(true)
      observer.disconnect()
    }, { threshold: 0.01 })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [loaded, enableHero3D, canvasReady])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const menuTrigger = burgerRef.current
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    focusable?.[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMobileMenuOpen(false)
        return
      }
      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      menuTrigger?.focus()
    }
  }, [mobileMenuOpen])

  const scrollTo = (href: string) => {
    const id = href.slice(1)
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    setMobileMenuOpen(false)
    window.history.pushState(null, '', href)
  }

  const handleNavClick = (event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    event.preventDefault()
    scrollTo(href)
  }

  return (
    <>
      <AnimatePresence mode="wait">{!loaded && <Loader key="loader" onDone={() => setLoaded(true)} />}</AnimatePresence>
      {loaded && (
        <>
          <CustomCursor />
          <ScrollBar />
          <MeshBackground />
          <a className="skip-link" href="#content">Direkt zum Inhalt</a>

          <motion.header
            className={`site-header ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Navigation"
          >
            <a className="h-brand" href="#top" aria-label="ivo-tech" onClick={(event) => handleNavClick(event, '#top')}>
              <img src="/brand/logos/ivo-tech-logo-master.svg" alt="ivo-tech" width={140} height={31} fetchPriority="high" />
            </a>
            <nav className="h-nav" aria-label="Hauptnavigation">
              {navItems.map(({ label, href }) => (
                <a key={href} href={href} className="h-link" onClick={(event) => handleNavClick(event, href)}>{label}</a>
              ))}
            </nav>
            <div className="h-right">
              <span className="h-status"><span className="pulse-dot" /> Online</span>
              <MagButton className="h-btn" href="mailto:contact@ivo-tech.com">Kontakt <ArrowUpRight size={14} /></MagButton>
              <button
                ref={burgerRef}
                className="h-burger"
                aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileMenuOpen((value) => !value)}
              >
                <span className="h-burger-bar" /><span className="h-burger-bar" /><span className="h-burger-bar" />
              </button>
            </div>
          </motion.header>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                ref={mobileMenuRef}
                id="mobile-menu"
                className="mobile-menu"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
              >
                <nav>
                  {navItems.map(({ label, href }) => (
                    <a key={href} href={href} className="mobile-menu-link" onClick={(event) => handleNavClick(event, href)}>{label}</a>
                  ))}
                  <a href="mailto:contact@ivo-tech.com" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Kontakt aufnehmen</a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          <main id="content">
            <section className="hero relaunch-hero" id="top" aria-labelledby="hero-h">
              <div className="relaunch-shell hero-grid">
                <motion.div className="hero-copy" initial={compactHero ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
                  <div className="hero-eyebrow"><span>Ivo · Full-Stack Development / Frontend Craft</span><span className="hero-eyebrow-location">Mannheim · Remote</span></div>
                  <SplitTitle lines={['Ich baue,', 'was bleibt.']} immediate={compactHero} />
                  <p className="hero-sub">Ich entwickle produktionsreife Webapplikationen — vom belastbaren System bis zum präzisen Interface und stabilen Live-Betrieb.</p>
                  <div className="hero-ctas">
                    <MagButton className="btn-primary" href="#selected-work" onClick={(event) => handleNavClick(event, '#selected-work')}>Projekte ansehen <ArrowUpRight size={16} /></MagButton>
                    <MagButton className="btn-ghost" href="/yves-simon-schenker-cv.pdf" download>Lebenslauf</MagButton>
                    <MagButton className="btn-ghost" href="mailto:contact@ivo-tech.com">Kontakt</MagButton>
                  </div>
                  <div className="hero-meta"><span>Offen für passende Remote- und Hybrid-Rollen</span><span><ArrowDown size={14} aria-hidden="true" /> Scrollen</span></div>
                </motion.div>

                <motion.div className="hero-visual" initial={compactHero ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} aria-label="ivo-tech 9-Facet-Emblem">
                  <div className="hv-webgl-stage" ref={heroStageRef}>
                    <ErrorBoundary fallback={<img className="hv-fallback" src={HERO_3D_FALLBACK_SRC} alt="ivo-tech Logo" width={246} height={149} />}>
                      {enableHero3D ? (
                        <Suspense fallback={<img className="hv-emblem hero-3d-fallback-image" src={HERO_3D_FALLBACK_SRC} alt="ivo-tech Logo" width={246} height={149} fetchPriority="high" />}>
                          {canvasReady && <Hero3DLogo fallbackSrc={HERO_3D_FALLBACK_SRC} alt="ivo-tech 9-Facet-Emblem aus mattem Werkzeugstahl" />}
                        </Suspense>
                      ) : (
                        <div className="hero-3d-logo hero-3d-logo--fallback" role="img" aria-label="ivo-tech 9-Facet-Emblem" data-mode="fallback">
                          <img className="hv-emblem hero-3d-fallback-image" src={HERO_3D_FALLBACK_SRC} alt="" aria-hidden="true" width={246} height={149} fetchPriority="high" />
                        </div>
                      )}
                    </ErrorBoundary>
                  </div>
                  <div className="hero-object-caption"><span>09 Facetten</span><span>Ein System</span></div>
                </motion.div>
              </div>
            </section>

            <div className="relaunch-signal-band" aria-label="Kompetenzen">
              <span>React</span><span>TypeScript</span><span>Supabase</span><span>Three.js</span><span>Testing</span><span>Live Production</span>
            </div>

            <AboutSection />

            <Suspense fallback={<div className="section-loading">Selected Work wird geladen …</div>}><Showcase /></Suspense>
            <CraftSection />
            <LabSection />
            <ContactSection />
          </main>
          <RelaunchFooter />
        </>
      )}
    </>
  )
}

export default App
