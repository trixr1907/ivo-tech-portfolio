import { lazy, Suspense, useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'motion/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight,
  MapPin,
  ArrowDown,
  Gauge,
} from 'lucide-react'
import './App.css'

import { ErrorBoundary } from './components/ErrorBoundary'
import { bridgeGsapLenis } from './lib/gsap-lenis-bridge'
import { useGsapPinHero } from './hooks/useGsapPinHero'
import { useGsapReveal } from './hooks/useGsapReveal'
import { useScrollspy } from './hooks/useScrollspy'

import { Loader } from './components/ui/Loader'
import { LazySectionFallback } from './components/ui/LazySectionFallback'
import { MeshBackground, HERO_3D_FALLBACK_SRC } from './components/ui/MeshBackground'
import { CustomCursor } from './components/ui/CustomCursor'
import { ScrollBar } from './components/ui/ScrollBar'
import { MagButton } from './components/ui/MagButton'
import { Reveal } from './components/ui/Reveal'
import { SplitTitle } from './components/ui/SplitTitle'
import { SectionTitle } from './components/ui/SectionTitle'
import { Marquee } from './components/ui/Marquee'
import { LabCard } from './components/home/LabCard'
import { AboutSection } from './components/home/AboutSection'
import { ContactButtons } from './components/ui/ContactButtons'
import { labItems, signalCards, marqueeTop, marqueeBottom } from './data/homeData'

// const HeroOrbitSystem = lazy(() => import('./components/HeroOrbitSystem'))

const loadShowcase = () => import('./components/showcase/Showcase')
const loadMarketDataShowcase = () => import('./components/MarketDataShowcase')
const loadBrandSection = () => import('./components/BrandSection')
const loadHobbySection = () => import('./components/HobbySection')
const loadLayoutSections = () => import('./components/LayoutSections')
const loadSkillGraphSection = () => import('./components/SkillGraphSection')

const EpicHero3D = lazy(() => import('./components/EpicHero3D'))
const Showcase = lazy(() => loadShowcase().then((module) => ({ default: module.Showcase })))
const MarketDataShowcase = lazy(() =>
  loadMarketDataShowcase().then((module) => ({ default: module.MarketDataShowcase })),
)
const BrandSection = lazy(() => loadBrandSection().then((module) => ({ default: module.BrandSection })))
const HobbySection = lazy(() => loadHobbySection().then((module) => ({ default: module.HobbySection })))
const SkillGraphSection = lazy(() =>
  loadSkillGraphSection().then((module) => ({ default: module.SkillGraphSection })),
)
const ContactSection = lazy(() => loadLayoutSections().then((module) => ({ default: module.ContactSection })))
const SiteFooter = lazy(() => loadLayoutSections().then((module) => ({ default: module.SiteFooter })))

function App() {
  const reduceMotion = useReducedMotion()
  const [compactHero, setCompactHero] = useState(() => window.matchMedia('(max-width: 960px)').matches)
  const [loaded, setLoaded] = useState(compactHero)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const { scrollY } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const webglStageRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  // Lenis has no stable public type across installed versions in this project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '18%'])
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  const activeSectionId = useScrollspy(['about', 'lab', 'selected-work', 'brand'], 150)
  const enableHero3D = !compactHero && !reduceMotion

  useEffect(() => {
    const query = window.matchMedia('(max-width: 960px)')
    const update = () => setCompactHero(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const scrollToSection = useCallback((hash: string) => {
    const targetId = hash.replace('#', '')
    const target = document.getElementById(targetId)
    if (!target) return

    setMobileMenuOpen(false)
    ScrollTrigger.refresh()

    const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 72
    const extraOffset = window.matchMedia('(max-width: 680px)').matches ? 28 : 20
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset

    const top = Math.max(0, targetY)
    window.history.pushState(null, '', `#${targetId}`)

    if (lenisRef.current?.scrollTo) {
      lenisRef.current.scrollTo(top, { duration: 1.05, easing: (t: number) => 1 - Math.pow(1 - t, 3) })
      return
    }

    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const handleAnchorClick = useCallback((event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>, hash: string) => {
    event.preventDefault()
    scrollToSection(hash)
  }, [scrollToSection])

  useGsapReveal("#lab", "h2, .reveal-gsap", loaded)
  useGsapPinHero(heroRef, loaded)

  useEffect(() => {
    if (!loaded) return undefined

    const onDocumentClick = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented) return

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const hash = anchor?.getAttribute('href')
      if (!hash || hash === '#') return

      event.preventDefault()
      scrollToSection(hash)
    }

    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [loaded, scrollToSection])

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 48))
    return unsub
  }, [scrollY])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const burgerButton = burgerRef.current
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
      burgerButton?.focus()
    }
  }, [mobileMenuOpen])

  // Never import the Three.js scene on compact or reduced-motion layouts.
  useEffect(() => {
    if (!loaded || !enableHero3D || canvasReady) return
    const el = webglStageRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCanvasReady(true); observer.disconnect() } },
      { threshold: 0.01 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loaded, enableHero3D, canvasReady])

  useEffect(() => {
    if (!loaded || !heroRef.current) return
    const el = heroRef.current
    let raf = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 16
      target.y = (e.clientY / window.innerHeight - 0.5) * 10
    }

    const tick = () => {
      current.x += (target.x - current.x) * 0.08
      current.y += (target.y - current.y) * 0.08
      el.style.setProperty('--hero-tilt-x', `${current.x}px`)
      el.style.setProperty('--hero-tilt-y', `${current.y}px`)
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [loaded])

  useEffect(() => {
    if (!loaded) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null
    import('lenis').then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LenisClass = (mod as any).default ?? (mod as any).Lenis ?? mod
      lenis = new LenisClass({ lerp: 0.1, smoothWheel: true })
      lenisRef.current = lenis
      bridgeGsapLenis(lenis)
      const raf = (time: number) => {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    })
    return () => {
      lenisRef.current = null
      lenis?.destroy()
    }
  }, [loaded])

  useEffect(() => {
    if (!loaded) return

    const scrollToHashTarget = () => {
      const targetId = window.location.hash.slice(1)
      if (!targetId) return

      const delays = [0, 160, 520, 1200]
      delays.forEach((delay) => {
        globalThis.setTimeout(() => {
          scrollToSection(`#${targetId}`)
        }, delay)
      })
    }

    const preloadLowerSections = () => {
      void Promise.all([
        loadShowcase(),
        loadMarketDataShowcase(),
        loadBrandSection(),
        loadHobbySection(),
        loadLayoutSections(),
        loadSkillGraphSection(),
      ]).then(scrollToHashTarget)
    }

    if (window.location.hash) {
      preloadLowerSections()
      return undefined
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadLowerSections, { timeout: 2500 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = globalThis.setTimeout(preloadLowerSections, 1200)
    return () => globalThis.clearTimeout(timeoutId)
  }, [loaded, scrollToSection])

  return (
    <>
      <AnimatePresence mode="wait">{!loaded && <Loader key="loader" onDone={() => setLoaded(true)} />}</AnimatePresence>

      {loaded && (
        <>
          <CustomCursor />
          <ScrollBar />
          <MeshBackground />

          <a className="skip-link" href="#content">
            Direkt zum Inhalt
          </a>

          <motion.header
            className={`site-header ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Navigation"
          >
            <a className="h-brand" href="#top" aria-label="ivo-tech">
              <img src="/brand/logos/ivo-tech-logo-master.svg" alt="ivo-tech" decoding="async" fetchPriority="high" width={140} height={31} />
            </a>

            <nav className="h-nav">
              {[
                { label: 'About', href: '#about' },
                { label: 'Lab', href: '#lab' },
                { label: 'Work', href: '#selected-work' },
                { label: 'Brand', href: '#brand' },
              ].map(({ label, href }) => {
                const isActive = activeSectionId === href.replace('#', '')
                return (
                  <a key={label} href={href} className={`h-link ${isActive ? 'active' : ''}`} onClick={(event) => handleAnchorClick(event, href)}>
                    <span>{label}</span>
                  </a>
                )
              })}
            </nav>

            <div className="h-right">
              <span className="h-status">
                <span className="pulse-dot" />
                Online
              </span>
              <MagButton className="h-btn" href="mailto:contact@ivo-tech.com">
                Kontakt <ArrowUpRight size={14} />
              </MagButton>
              <button
                ref={burgerRef}
                className="h-burger"
                aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileMenuOpen(prev => !prev)}
              >
                <span className="h-burger-bar" />
                <span className="h-burger-bar" />
                <span className="h-burger-bar" />
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
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
              >
                <nav>
                  {[
                    { label: 'About', href: '#about' },
                    { label: 'Lab', href: '#lab' },
                    { label: 'Work', href: '#selected-work' },
                    { label: 'Brand', href: '#brand' },
                    { label: 'Kontakt', href: 'mailto:contact@ivo-tech.com' },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="mobile-menu-link"
                      onClick={(event) => {
                        if (href.startsWith('#')) handleAnchorClick(event, href)
                        else setMobileMenuOpen(false)
                      }}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          <main id="content">
            <section className="hero" ref={heroRef} id="top" aria-labelledby="hero-h">
              <motion.div className="hero-inner" style={{ y: heroY, opacity: heroOpacity }}>
                <motion.div
                  className="hero-eyebrow"
                  initial={compactHero ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <MapPin size={12} aria-hidden="true" />
                  <span>Full-Stack Developer mit Frontend-Fokus · Mannheim, DE</span>
                  <span className="eyebrow-div" />
                  <span>Remote-Festanstellung</span>
                </motion.div>

                <SplitTitle line1="Ich baue" line2="was" line3="bleibt." immediate={compactHero} />

                <motion.p
                  className="hero-sub"
                  initial={compactHero ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="hero-stack">React · TypeScript · Node.js · Three.js · Supabase</span>
                  <span className="hero-description">
                    Ich entwickle produktionsreife Webapplikationen — remote-first, mit React/TypeScript,
                    sauberer Architektur und echtem Live-Betrieb.
                  </span>
                </motion.p>

                <motion.div
                  className="hero-ctas"
                  initial={compactHero ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.86, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ContactButtons onNavigate={handleAnchorClick} />
                  <span className="hero-employment-note">Offen für Remote-Festanstellung</span>
                </motion.div>

                <motion.div
                  className="hero-scroll-hint"
                  initial={compactHero ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                  <span>Scrollen zum Zerlegen</span>
                </motion.div>
              </motion.div>

              <motion.div
                className="hero-visual"
                initial={compactHero ? false : { opacity: 0, scale: 0.9, rotateY: 12 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                aria-label="ivo-tech Brand Visual"
              >
                <div className="hv-webgl-stage" ref={webglStageRef}>
                  <ErrorBoundary
                    fallback={<img src={HERO_3D_FALLBACK_SRC} alt="ivo-tech Logo" className="hv-fallback" decoding="async" width={246} height={149} />}
                  >
                    {enableHero3D ? (
                      <Suspense
                        fallback={
                          <img
                            className="hv-emblem hero-3d-fallback-image"
                            width={246}
                            height={149}
                            src={HERO_3D_FALLBACK_SRC}
                            alt="ivo-tech WebGL Logo"
                            decoding="async"
                            fetchPriority="high"
                          />
                        }
                      >
                        {canvasReady && <EpicHero3D fallbackSrc={HERO_3D_FALLBACK_SRC} alt="ivo-tech Logo als cineatische 3D-Skulptur" />}
                      </Suspense>
                    ) : (
                      <div
                        className="epic-hero-3d epic-hero-3d--fallback"
                        role="img"
                        aria-label="ivo-tech Logo"
                        data-mode="fallback"
                      >
                        <img
                          className="hv-emblem hero-3d-fallback-image"
                          width={246}
                          height={149}
                          src={HERO_3D_FALLBACK_SRC}
                          alt=""
                          aria-hidden="true"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </div>
                    )}
                  </ErrorBoundary>
                </div>
              </motion.div>
            </section>

            <div className="mq-band">
              <Marquee items={marqueeTop} />
              <Marquee items={marqueeBottom} reverse />
            </div>

            <AboutSection />

            <section id="lab" className="section lab-section" aria-labelledby="lab-h">
              <div className="section-inner">
                <Reveal className="sec-head">
                  <div>
                    <span className="sec-label">Lab Notes</span>
                    <span className="sec-num">— 02</span>
                  </div>
                  <SectionTitle id="lab-h" lines={[{ text: 'Woran ich arbeite' }]} />
                </Reveal>

                <Reveal delay={0.08}>
                  <p className="lab-intro">
                    Vier Felder, ein roter Faden: Automation, eigens betriebene Infrastruktur, Brand-Systeme und
                    Interfaces, die sich wie echte Produkte anfühlen. Parallel zu den Kundenprojekten laufend
                    in Betrieb und Weiterentwicklung.
                  </p>
                </Reveal>

                <div className="lab-grid">
                  {labItems.map((item, i) => (
                    <LabCard key={item.num} item={item} index={i} />
                  ))}
                </div>

                <Reveal delay={0.18}>
                  <div className="signal-deck" aria-label="ivo-tech Operating System">
                    <div className="signal-orb" aria-hidden="true">
                      <div className="orb-ring r1" />
                      <div className="orb-ring r2" />
                      <Gauge size={34} strokeWidth={1.25} />
                      <span>ivo-tech OS</span>
                    </div>
                    <div className="signal-copy">
                      <span className="sec-label">Operating layer</span>
                      <h3>Ein persönliches Tech-System — nicht nur eine Website.</h3>
                      <p>
                        Die Seite erzählt nicht „Portfolio", sondern zeigt ein Setup: Automation, Homelab, Design-Craft
                        und Motion-Assets greifen ineinander.
                      </p>
                    </div>
                    <div className="signal-cards">
                      {signalCards.map(({ icon: Icon, label, value, text }) => (
                        <article key={label} className="signal-card">
                          <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                          <span>{label}</span>
                          <strong>{value}</strong>
                          <p>{text}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            <Suspense fallback={<LazySectionFallback label="Selected Work" />}>
              <Showcase />
            </Suspense>

            <Suspense fallback={<LazySectionFallback label="Realtime Data" />}>
              <MarketDataShowcase />
            </Suspense>

            <Suspense fallback={<LazySectionFallback label="Brand System" />}>
              <BrandSection />
            </Suspense>

            <Suspense fallback={<LazySectionFallback label="Operating Layer" />}>
              <HobbySection />
            </Suspense>

            <Suspense fallback={<LazySectionFallback label="Stack" />}>
              <SkillGraphSection />
            </Suspense>

            <Suspense fallback={<LazySectionFallback label="Kontakt" />}>
              <ContactSection />
            </Suspense>
          </main>

          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
        </>
      )}
    </>
  )
}

export default App
