import { useEffect, useRef, memo } from 'react'
import { useReducedMotion } from 'motion/react'

// ─── Glyph SVG definitions — ivo-tech line-icon style ─────────────────────
// All rendered on a 48×48 viewBox, stroke-only, no fill.
// Each represents a real node in the ivo-tech system.

const GLYPHS = [
  {
    id: 'ivo-core',
    label: 'ivo-tech Core',
    color: '#00B7FF',
    svg: (
      // Paperplane / diamond emblem — abstract brand core
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="24,4 44,24 24,44 4,24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="24,12 36,24 24,36 12,24" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.55" />
        <circle cx="24" cy="24" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="4" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="44" y1="24" x2="36" y2="24" stroke="currentColor" strokeWidth="1" />
        <line x1="24" y1="44" x2="24" y2="36" stroke="currentColor" strokeWidth="1" />
        <line x1="4" y1="24" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'event-hub',
    label: 'Event Hub',
    color: '#7BE7FF',
    svg: (
      // Event/message hub — nodes connected to central point
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="9" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
        <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="40" cy="10" r="3" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="42" cy="36" r="3" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="10" cy="38" r="3" stroke="currentColor" strokeWidth="1.25" />
        <line x1="11" y1="14" x2="19" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="37" y1="12" x2="29" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="39" y1="33" x2="29" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="13" y1="36" x2="19" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <circle cx="24" cy="24" r="2" fill="currentColor" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: 'dld',
    label: 'DLD 3D Print',
    color: '#DCE6F2',
    svg: (
      // Wireframe cube — 3D print / DLD configurator
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="24,6 40,16 40,32 24,42 8,32 8,16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="24" y1="6" x2="24" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="40" y1="16" x2="24" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="8" y1="16" x2="24" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="24" y1="22" x2="24" y2="42" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.35" />
        <line x1="24" y1="22" x2="40" y2="32" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.35" />
        <line x1="24" y1="22" x2="8" y2="32" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'agent-node',
    label: 'Agent / Workflow',
    color: '#F5A623',
    svg: (
      // AI agent / workflow — neural net style abstraction
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="38" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="6" cy="30" r="3.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="42" cy="30" r="3.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="24" cy="44" r="3.5" stroke="currentColor" strokeWidth="1.25" />
        <line x1="13" y1="12" x2="19" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.65" />
        <line x1="35" y1="12" x2="29" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.65" />
        <line x1="9" y1="28" x2="18" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.65" />
        <line x1="39" y1="28" x2="30" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.65" />
        <line x1="24" y1="30" x2="24" y2="41" stroke="currentColor" strokeWidth="1" opacity="0.65" />
        <line x1="13" y1="11" x2="35" y2="11" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
      </svg>
    ),
  },
  {
    id: 'ninerouter',
    label: '9Router',
    color: '#A855F7',
    svg: (
      // Abstract routing grid — 9 nodes in 3×3, central routing
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* 3×3 grid of nodes */}
        {[10, 24, 38].flatMap((cx) =>
          [10, 24, 38].map((cy) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={cx === 24 && cy === 24 ? 4 : 2.5}
              stroke="currentColor"
              strokeWidth={cx === 24 && cy === 24 ? 1.5 : 1}
              opacity={cx === 24 && cy === 24 ? 1 : 0.65}
            />
          ))
        )}
        {/* Horizontal connectors */}
        <line x1="13" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="27" y1="10" x2="35" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="13" y1="38" x2="21" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="27" y1="38" x2="35" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        {/* Vertical connectors */}
        <line x1="10" y1="13" x2="10" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="38" y1="13" x2="38" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="10" y1="27" x2="10" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <line x1="38" y1="27" x2="38" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        {/* Center hub connectors */}
        <line x1="13" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="28" y1="24" x2="35" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="24" y1="13" x2="24" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="24" y1="28" x2="24" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'deploy-node',
    label: 'Vercel / Deploy',
    color: '#DCE6F2',
    svg: (
      // Deploy triangle — abstract Vercel/CI/CD deployment node
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="24,8 42,38 6,38" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="24" y1="8" x2="24" y2="38" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.35" />
        <line x1="6" y1="38" x2="24" y2="24" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
        <line x1="42" y1="38" x2="24" y2="24" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
        <circle cx="24" cy="24" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="24" cy="8" r="2" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <circle cx="6" cy="38" r="2" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <circle cx="42" cy="38" r="2" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'webgl-node',
    label: 'WebGL / 3D',
    color: '#00B7FF',
    svg: (
      // Octagon + inner circle — render engine / WebGL abstract
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon
          points="17,5 31,5 43,17 43,31 31,43 17,43 5,31 5,17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <circle cx="24" cy="24" r="3.5" stroke="currentColor" strokeWidth="1.25" />
        <line x1="17" y1="5" x2="19" y2="16" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="31" y1="5" x2="29" y2="16" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="43" y1="17" x2="32" y2="19" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="43" y1="31" x2="32" y2="29" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="31" y1="43" x2="29" y2="32" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="17" y1="43" x2="19" y2="32" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="5" y1="31" x2="16" y2="29" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <line x1="5" y1="17" x2="16" y2="19" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      </svg>
    ),
  },
]

// ─── Orbit layer config ───────────────────────────────────────────────────
// 3 depth layers: far (slow, blurred), mid, near (fast, sharp)
type DepthLayer = 'far' | 'mid' | 'near'

type NodeConfig = {
  glyphId: string
  layer: DepthLayer
  // Orbit params
  orbitRadiusX: number // % of container width
  orbitRadiusY: number // % of container height
  orbitSpeed: number  // full revolution seconds
  startAngle: number  // radians
  // Visual
  size: number        // px
  baseOpacity: number
  blur: number        // px
  // Pointer parallax factor (negative = opposite to pointer)
  parallaxFactor: number
}

const NODE_CONFIGS: NodeConfig[] = [
  // ── Far layer (slow, no blur — blur killed legibility) ────────────
  {
    glyphId: 'deploy-node',
    layer: 'far',
    orbitRadiusX: 44,
    orbitRadiusY: 38,
    orbitSpeed: 38,
    startAngle: 0.3,
    size: 68,
    baseOpacity: 0.50,
    blur: 0,
    parallaxFactor: 0.012,
  },
  {
    glyphId: 'dld',
    layer: 'far',
    orbitRadiusX: 42,
    orbitRadiusY: 36,
    orbitSpeed: 30,
    startAngle: Math.PI + 0.7,
    size: 62,
    baseOpacity: 0.45,
    blur: 0,
    parallaxFactor: 0.01,
  },

  // ── Mid layer ────────────────────────────────────────────────────
  {
    glyphId: 'event-hub',
    layer: 'mid',
    orbitRadiusX: 33,
    orbitRadiusY: 29,
    orbitSpeed: 24,
    startAngle: Math.PI * 0.5,
    size: 80,
    baseOpacity: 0.78,
    blur: 0,
    parallaxFactor: 0.022,
  },
  {
    glyphId: 'ninerouter',
    layer: 'mid',
    orbitRadiusX: 37,
    orbitRadiusY: 27,
    orbitSpeed: 20,
    startAngle: Math.PI * 1.5,
    size: 74,
    baseOpacity: 0.70,
    blur: 0,
    parallaxFactor: -0.018,
  },
  {
    glyphId: 'agent-node',
    layer: 'mid',
    orbitRadiusX: 39,
    orbitRadiusY: 31,
    orbitSpeed: 28,
    startAngle: Math.PI * 0.9,
    size: 76,
    baseOpacity: 0.72,
    blur: 0,
    parallaxFactor: 0.02,
  },

  // ── Near layer (fastest, sharpest, most opaque) ──────────────────
  {
    glyphId: 'ivo-core',
    layer: 'near',
    orbitRadiusX: 24,
    orbitRadiusY: 21,
    orbitSpeed: 15,
    startAngle: Math.PI * 0.25,
    size: 88,
    baseOpacity: 0.92,
    blur: 0,
    parallaxFactor: 0.038,
  },
  {
    glyphId: 'webgl-node',
    layer: 'near',
    orbitRadiusX: 26,
    orbitRadiusY: 22,
    orbitSpeed: 13,
    startAngle: Math.PI * 1.25,
    size: 82,
    baseOpacity: 0.85,
    blur: 0,
    parallaxFactor: -0.03,
  },
]

// ─── Component ────────────────────────────────────────────────────────────

const HeroOrbitSystem = memo(function HeroOrbitSystem() {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef(0)
  const startTimeRef = useRef(performance.now())
  const pointerRef = useRef({ x: 0, y: 0 })
  const isDesktopRef = useRef(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    // Desktop check — pointer-parallax only on non-touch
    isDesktopRef.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    if (reducedMotion) return

    const container = containerRef.current
    if (!container) return

    // Pointer tracking (desktop only, passive)
    const onPointerMove = (e: PointerEvent) => {
      if (!isDesktopRef.current) return
      const rect = container.getBoundingClientRect()
      pointerRef.current = {
        x: (e.clientX - rect.left - rect.width / 2) / (rect.width / 2),
        y: (e.clientY - rect.top - rect.height / 2) / (rect.height / 2),
      }
    }
    const onPointerLeave = () => {
      pointerRef.current = { x: 0, y: 0 }
    }

    container.addEventListener('pointermove', onPointerMove, { passive: true })
    container.addEventListener('pointerleave', onPointerLeave, { passive: true })

    const animate = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const rect = container.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      const cx = W / 2
      const cy = H / 2
      const { x: px, y: py } = pointerRef.current

      NODE_CONFIGS.forEach((cfg, index) => {
        const el = nodeRefs.current[index]
        if (!el) return

        const angle = cfg.startAngle + (elapsed / cfg.orbitSpeed) * Math.PI * 2
        const rx = (cfg.orbitRadiusX / 100) * W * 0.5
        const ry = (cfg.orbitRadiusY / 100) * H * 0.5

        const baseX = cx + Math.cos(angle) * rx - cfg.size / 2
        const baseY = cy + Math.sin(angle) * ry - cfg.size / 2

        // Pointer parallax (desktop only, lerped externally by RAF)
        const parallaxX = isDesktopRef.current ? px * cfg.parallaxFactor * W * 0.5 : 0
        const parallaxY = isDesktopRef.current ? py * cfg.parallaxFactor * H * 0.5 : 0

        const x = baseX + parallaxX
        const y = baseY + parallaxY

        // Opacity pulse — subtle variation per node
        const opacityPulse = Math.sin(elapsed * 1.8 + cfg.startAngle) * 0.12
        const opacity = Math.max(0.1, cfg.baseOpacity + opacityPulse)

        // Gentle rotation of the glyph itself
        const selfRotation = elapsed * (20 / cfg.orbitSpeed) + cfg.startAngle * 15

        el.style.transform = `translate(${x}px, ${y}px) rotate(${selfRotation}deg)`
        el.style.opacity = String(opacity.toFixed(3))
      })

      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [reducedMotion])

  // Build glyph lookup
  const glyphMap = Object.fromEntries(GLYPHS.map((g) => [g.id, g]))

  return (
    <div
      ref={containerRef}
      className="orbit-system"
      aria-hidden="true"
      role="presentation"
    >
      {/* Orbit trail rings — static elliptical paths as depth cues */}
      <svg
        className="orbit-rings-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Far orbit ring */}
        <ellipse
          cx="50" cy="50"
          rx="43" ry="37"
          fill="none"
          stroke="rgba(0,183,255,0.08)"
          strokeWidth="0.22"
          strokeDasharray="1.5 3"
        />
        {/* Mid orbit rings */}
        <ellipse
          cx="50" cy="50"
          rx="33" ry="28"
          fill="none"
          stroke="rgba(0,183,255,0.12)"
          strokeWidth="0.2"
          strokeDasharray="1 2.5"
        />
        <ellipse
          cx="50" cy="50"
          rx="38" ry="30"
          fill="none"
          stroke="rgba(168,85,247,0.07)"
          strokeWidth="0.18"
          strokeDasharray="0.8 3.5"
        />
        {/* Near orbit ring */}
        <ellipse
          cx="50" cy="50"
          rx="25" ry="21"
          fill="none"
          stroke="rgba(0,183,255,0.18)"
          strokeWidth="0.28"
        />
      </svg>

      {NODE_CONFIGS.map((cfg, index) => {
        const glyph = glyphMap[cfg.glyphId]
        if (!glyph) return null

        return (
          <div
            key={`${cfg.glyphId}-${index}`}
            ref={(el) => { nodeRefs.current[index] = el }}
            className={`orbit-node orbit-node--${cfg.layer}`}
            data-label={glyph.label}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: cfg.size,
              height: cfg.size,
              color: glyph.color,
              filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : undefined,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
            title={glyph.label}
          >
            {glyph.svg}

            {/* Connection dot — small pulsing indicator */}
            <div
              className={`orbit-node-dot orbit-node-dot--${cfg.layer}`}
              style={{ background: glyph.color }}
            />
          </div>
        )
      })}
    </div>
  )
})

export default HeroOrbitSystem
