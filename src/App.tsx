import { lazy, Suspense, useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'
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

import { Loader } from './components/ui/Loader'
import { LazySectionFallback } from './components/ui/LazySectionFallback'
import { MeshBackground, HERO_3D_FALLBACK_SRC } from './components/ui/MeshBackground'
import { CustomCursor } from './components/ui/CustomCursor'
import { ScrollBar } from './components/ui/ScrollBar'
import { MagButton } from './components/ui/MagButton'
import { Reveal } from './components/ui/Reveal'
import { SplitTitle } from './components/ui/SplitTitle'
import { Marquee } from './components/ui/Marquee'
import { LabCard } from './components/home/LabCard'
import { AboutSection } from './components/home/AboutSection'
import { labItems, signalCards, marqueeTop, marqueeBottom } from './data/homeData'

const HeroOrbitSystem = lazy(() => import('./components/HeroOrbitSystem'))

const loadShowcase = () => import('./components/showcase/Showcase')
const loadMarketDataShowcase = () => import('./components/MarketDataShowcase')
const loadBrandSection = () => import('./components/BrandSection')
const loadHobbySection = () => import('./components/HobbySection')
const loadLayoutSections = () => import('./components/LayoutSections')
const loadSkillGraphSection = () => import('./components/SkillGraphSection')

const Hero3DLogo = lazy(() => import('./components/Hero3DLogo'))
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
  const [loaded, setLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const { scrollY } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const webglStageRef = useRef<HTMLDivElement>(null)
  // Lenis has no stable public type across installed versions in this project.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '18%'])
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

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
    if (mobileMenuOpen) {
      const close = () => setMobileMenuOpen(false)
      window.addEventListener('scroll', close, { once: true })
      return () => window.removeEventListener('scroll', close)
    }
  }, [mobileMenuOpen])

  // Load three-vendor only when the WebGL stage enters the viewport
  useEffect(() => {
    if (!loaded || canvasReady) return
    const el = webglStageRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCanvasReady(true); observer.disconnect() } },
      { threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loaded, canvasReady])

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
              ].map(({ label, href }) => (
                <a key={label} href={href} className="h-link" onClick={(event) => handleAnchorClick(event, href)}>
                  <span>{label}</span>
                </a>
              ))}
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
                id="mobile-menu"
                className="mobile-menu"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <MapPin size={12} aria-hidden="true" />
                  <span>Remote Frontend / Full-Stack · Mannheim, DE</span>
                  <span className="eyebrow-div" />
                  <span>Full-Stack Engineer</span>
                </motion.div>

                <SplitTitle line1="Ich baue" line2="was" line3="bleibt." />

                <motion.p
                  className="hero-sub"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
                >
                  React · TypeScript · Node.js · Three.js · Supabase ·<br />
                  Ich entwickle produktionsreife Webapplikationen — remote-first, mit React/TypeScript,
                  sauberer Architektur und echtem Live-Betrieb.
                </motion.p>

                <motion.div
                  className="hero-ctas"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.86, ease: [0.16, 1, 0.3, 1] }}
                >
                  <MagButton className="btn-primary" href="#selected-work" onClick={(event) => handleAnchorClick(event, '#selected-work')}>
                    Projekte ansehen <ArrowUpRight size={16} />
                  </MagButton>
                  <MagButton className="btn-ghost" href="mailto:contact@ivo-tech.com">
                    Kontakt aufnehmen
                  </MagButton>
                </motion.div>

                <motion.div
                  className="hero-scroll-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                  <span>Scroll</span>
                </motion.div>
              </motion.div>

              <motion.div
                className="hero-visual"
                initial={{ opacity: 0, scale: 0.9, rotateY: 12 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                aria-label="ivo-tech Brand Visual"
              >
                <div className="hv-webgl-stage" ref={webglStageRef}>
                  <Suspense fallback={<div className="hv-webgl-stage-placeholder" aria-hidden="true" />}>
                    <HeroOrbitSystem />
                  </Suspense>

                  <ErrorBoundary
                    fallback={<img src={HERO_3D_FALLBACK_SRC} alt="ivo-tech Logo" className="hv-fallback" decoding="async" />}
                  >
                    <Suspense
                      fallback={
                        <img
                          className="hv-emblem hero-3d-fallback-image"
                          src={HERO_3D_FALLBACK_SRC}
                          alt="ivo-tech WebGL Logo"
                          decoding="async"
                          fetchPriority="high"
                        />
                      }
                    >
                      {canvasReady && <Hero3DLogo fallbackSrc={HERO_3D_FALLBACK_SRC} alt="ivo-tech WebGL Logo — Ziehen zum Drehen" />}
                    </Suspense>
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
                  <h2 id="lab-h">Woran ich gern tüftle</h2>
                </Reveal>

                <Reveal delay={0.08}>
                  <p className="lab-intro">
                    Vier Felder, ein roter Faden: Automation, robuste Heim-Infrastruktur, Brand-Systeme und Interfaces,
                    die sich wie echte Produkte anfühlen. Kein Claim, sondern laufende Werkbank.
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

            <Suspense fallback={<LazySectionFallback label="Hobby Lab" />}>
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
