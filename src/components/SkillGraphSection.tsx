import { useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/* ────────────────────────────────────────────────────────────────
   Skill Node Graph — interactive SVG-based tech-stack explorer
   Replaces the static Stack section.
   ----------------------------------------------------------------
   - Tech nodes connect to project nodes via SVG lines
   - Hover/focus on a tech node highlights connected projects
   - Keyboard accessible: nodes are focusable buttons
   - Mobile: compact scrollable matrix fallback
   - Reduced-motion: static highlights, no animation
   ──────────────────────────────────────────────────────────────── */

/* ── DATA ──────────────────────────────────────────────────────── */

interface TechNode {
  id: string
  label: string
  projects: string[]
}

interface ProjectNode {
  id: string
  label: string
  line2?: string
}

const techNodes: TechNode[] = [
  { id: 'react', label: 'React', projects: ['website', 'dld', 'data-ui', 'brand'] },
  { id: 'typescript', label: 'TypeScript', projects: ['website', 'dld', 'data-ui', 'brand', 'ai'] },
  { id: 'threejs', label: 'Three.js', projects: ['website', 'dld', 'brand'] },
  { id: 'motion', label: 'Motion', projects: ['website', 'brand'] },
  { id: 'lenis', label: 'Lenis', projects: ['website'] },
  { id: 'supabase', label: 'Supabase', projects: ['website', 'data-ui', 'ai'] },
  { id: 'docker', label: 'Docker', projects: ['homelab', 'ai'] },
  { id: 'homeassistant', label: 'Home Assistant', projects: ['homelab'] },
  { id: 'proxmox', label: 'Proxmox', projects: ['homelab'] },
  { id: 'playwright', label: 'Playwright', projects: ['website', 'dld', 'brand'] },
  { id: 'vercel', label: 'Vercel', projects: ['website', 'brand'] },
]

const projectNodes: ProjectNode[] = [
  { id: 'website', label: 'ivo-tech', line2: 'Website' },
  { id: 'dld', label: 'DLD', line2: '3D Configurator' },
  { id: 'data-ui', label: 'Realtime', line2: 'Data UI' },
  { id: 'brand', label: 'Brand', line2: 'System' },
  { id: 'homelab', label: 'Homelab', line2: 'Smart Home' },
  { id: 'ai', label: 'Automation', line2: 'Workflows' },
]

/* ── SVG Graph layout positions (relative coords in viewBox 0 0 800 420) ── */
/* tech nodes on left, project nodes on right */

interface Position {
  x: number
  y: number
}

const techPositions: Record<string, Position> = {
  react: { x: 120, y: 50 },
  typescript: { x: 120, y: 110 },
  threejs: { x: 120, y: 170 },
  motion: { x: 120, y: 230 },
  lenis: { x: 120, y: 290 },
  supabase: { x: 120, y: 350 },
  docker: { x: 340, y: 50 },
  homeassistant: { x: 340, y: 120 },
  proxmox: { x: 340, y: 190 },
  playwright: { x: 340, y: 260 },
  vercel: { x: 340, y: 330 },
}

const projectPositions: Record<string, Position> = {
  website: { x: 580, y: 45 },
  dld: { x: 680, y: 110 },
  'data-ui': { x: 580, y: 180 },
  brand: { x: 680, y: 245 },
  homelab: { x: 580, y: 310 },
  ai: { x: 680, y: 370 },
}

/* ── COLOR MAP ────────────────────────────────────────────────── */

const techColors: Record<string, string> = {
  react: '#61DAFB',
  typescript: '#3178C6',
  threejs: '#049EF4',
  motion: '#F5D000',
  lenis: '#00B7FF',
  supabase: '#3ECF8E',
  docker: '#2496ED',
  homeassistant: '#18BCF2',
  proxmox: '#E57000',
  playwright: '#45BA4B',
  vercel: '#000000',
}

/* ── MOBILE MATRIX COMPONENT ──────────────────────────────────── */

function SkillMatrix() {
  const [activeTech, setActiveTech] = useState<string | null>(null)

  return (
    <div className="skill-matrix" role="list" aria-label="Tech-Stack Matrix">
      {techNodes.map((tech) => {
        const isActive = activeTech === tech.id
        const connectedProjects = projectNodes.filter((p) => tech.projects.includes(p.id))
        return (
          <div key={tech.id} className="skill-matrix-row" role="listitem">
            <button
              className={`skill-matrix-tech ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTech(isActive ? null : tech.id)}
              aria-pressed={isActive}
              aria-label={`${tech.label} — ${tech.projects.length} Projekte`}
            >
              {tech.label}
            </button>
            <span className="skill-matrix-connector" aria-hidden="true">
              {isActive ? '⟶' : '·'}
            </span>
            <span className="skill-matrix-projects">
              {isActive
                ? connectedProjects.map((p) => (
                    <span key={p.id} className="skill-matrix-project">
                      {p.label} {p.line2 ? `(${p.line2})` : ''}
                    </span>
                  ))
                : `${tech.projects.length} Projekte`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── SVG GRAPH COMPONENT ──────────────────────────────────────── */

function SkillGraphSVG() {
  const [activeTech, setActiveTech] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  const activeProjectIds = activeTech
    ? new Set(techNodes.find((t) => t.id === activeTech)?.projects ?? [])
    : new Set<string>()

  const isAnyActive = activeTech !== null

  return (
    <svg
      className="skill-graph-svg"
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Interaktiver Tech-Stack Graph. Tabulator zum Navigieren, Enter zum Aktivieren."
      role="img"
    >
      {/* Group labels */}
      <text x="60" y="24" className="skill-graph-label" aria-hidden="true">
        Tools
      </text>
      <text x="680" y="24" className="skill-graph-label" aria-hidden="true">
        Projekte
      </text>

      {/* Divider line */}
      <line x1="460" y1="14" x2="460" y2="406" stroke="rgba(123,231,255,0.08)" strokeWidth="1" />

      {/* Connection lines — all */}
      {techNodes.map((tech) =>
        tech.projects.map((projId) => {
          const from = techPositions[tech.id]
          const to = projectPositions[projId]
          if (!from || !to) return null
          const isHighlighted = activeTech === tech.id
          const isDimmed = isAnyActive && !isHighlighted
          const midX = (from.x + to.x) / 2
          return (
            <g key={`${tech.id}-${projId}`}>
              {/* Main connection line */}
              <path
                d={`M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`}
                fill="none"
                stroke={isHighlighted ? techColors[tech.id] ?? 'var(--cyan)' : 'rgba(123,231,255,0.12)'}
                strokeWidth={isHighlighted ? 1.5 : 0.7}
                opacity={isDimmed ? 0.1 : isHighlighted ? 0.9 : 0.3}
                className={!reduceMotion ? 'skill-line' : ''}
              />
              {/* Animated dot on active lines */}
              {isHighlighted && !reduceMotion && (
                <circle
                  r="2.5"
                  fill={techColors[tech.id] ?? 'var(--cyan)'}
                  className="skill-line-dot"
                  opacity="0.9"
                >
                  <animateMotion
                    dur="2.4s"
                    repeatCount="indefinite"
                    path={`M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`}
                  />
                </circle>
              )}
            </g>
          )
        }),
      )}

      {/* Tech nodes as SVG buttons (foreignObject for a11y) */}
      {techNodes.map((tech) => {
        const pos = techPositions[tech.id]
        if (!pos) return null
        const isActive = activeTech === tech.id
        const isDimmed = isAnyActive && !isActive
        const color = techColors[tech.id] ?? 'var(--cyan)'
        return (
          <g key={`tech-${tech.id}`} className={`skill-node-group ${isActive ? 'active' : ''}`}>
            {!reduceMotion && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 18 : 14}
                fill="none"
                stroke={color}
                strokeWidth={isActive ? 2 : 0.8}
                opacity={isDimmed ? 0.15 : isActive ? 1 : 0.5}
                className="skill-node-ring"
              />
            )}
            <foreignObject
              x={pos.x - 50}
              y={pos.y - 13}
              width="100"
              height="26"
              style={{ overflow: 'visible' }}
            >
              <button
                className={`skill-node-btn ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                style={{ '--skill-color': color } as React.CSSProperties}
                onClick={() => setActiveTech(isActive ? null : tech.id)}
                aria-pressed={isActive}
                aria-label={`${tech.label} — verbunden mit ${tech.projects.length} Projekten`}
              >
                {tech.label}
              </button>
            </foreignObject>
          </g>
        )
      })}

      {/* Project nodes */}
      {projectNodes.map((proj) => {
        const pos = projectPositions[proj.id]
        if (!pos) return null
        const isActive = activeProjectIds.has(proj.id)
        const isDimmed = isAnyActive && !isActive
        return (
          <g key={`proj-${proj.id}`} className={`skill-node-group ${isActive ? 'connected' : ''}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="4"
              fill={isActive ? 'var(--cyan)' : 'var(--muted)'}
              opacity={isDimmed ? 0.15 : isActive ? 1 : 0.45}
            />
            <foreignObject
              x={pos.x - 70}
              y={pos.y - 26}
              width="140"
              height="52"
              style={{ overflow: 'visible' }}
            >
              <span
                className={`skill-proj-label ${isActive ? 'connected' : ''} ${isDimmed ? 'dimmed' : ''}`}
                aria-hidden="true"
              >
                <strong>{proj.label}</strong>
                {proj.line2 && <span>{proj.line2}</span>}
              </span>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}

/* ── WRAPPER COMPONENT ────────────────────────────────────────── */

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36, clipPath: 'inset(0% 0% 12% 0%)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, amount: 0.05, margin: '0px 0px -4% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1], clipPath: { duration: 0.75, delay } }}
    >
      {children}
    </motion.div>
  )
}

export function SkillGraphSection() {
  return (
    <section id="stack" className="section skill-graph-section" aria-labelledby="stack-h">
      <div className="section-inner">
        <Reveal className="sec-head">
          <div>
            <span className="sec-label">Stack</span>
            <span className="sec-num">— 07</span>
          </div>
          <h2 id="stack-h">Mein Tech-Ökosystem</h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="skill-graph-intro">
            Jedes Tool ist mit echten Projekten verbunden — klicke eine Technologie an, um die Zusammenhänge zu sehen.
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          {/* Desktop: SVG Graph */}
          <div className="skill-graph-desktop" aria-hidden={false}>
            <SkillGraphSVG />
          </div>

          {/* Mobile: Compact matrix */}
          <div className="skill-graph-mobile" aria-hidden={false}>
            <SkillMatrix />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
