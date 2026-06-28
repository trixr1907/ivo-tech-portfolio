import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const motionReveals = [
  {
    name: 'Premium Light Sweep',
    file: '/brand/media/ivo-tech-premium-light-sweep-1080p.webm',
    tag: 'Primary',
    duration: '2.6s',
    use: 'Website · Intro · Loader',
    desc: 'Diagonaler Light-Sweep über Chrome-Oberfläche mit Cyan-Core-Peak am Ende.',
  },
  {
    name: 'Energy Trail',
    file: '/brand/media/ivo-tech-energy-trail-1080p.webm',
    tag: 'Dynamic',
    duration: '4.2s',
    use: 'Ads · Hero-Loop',
    desc: 'Cyan Trail mit Motion Blur — schneller, kontrollierter Energie-Moment.',
  },
  {
    name: 'Cinematic Assembly',
    file: '/brand/media/ivo-tech-cinematic-assembly-1080p.webm',
    tag: 'Cinematic',
    duration: '7.0s',
    use: 'Brandfilm · Launch',
    desc: 'Die 9 Facetten setzen sich mechanisch präzise zusammen — kein Shatter-Chaos.',
  },
]

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function BrandSection() {
  return (
    <section id="brand" className="section brand-section" aria-labelledby="brand-h">
      <div className="section-inner">
        <Reveal className="sec-head">
          <div>
            <span className="sec-label">Brand System</span>
            <span className="sec-num">— 05</span>
          </div>
          <h2 id="brand-h">
            9 Facetten.<br /><em>Ein System.</em>
          </h2>
          <p className="brand-intro">
            Das ivo-tech Brand-System entstand aus dem Wunsch nach einem konsistenten visuellen Kern
            über Web, Motion und Print hinweg. Logo in Adobe Illustrator konstruiert,
            3D-Render in Blender, Motion in After Effects — alle Assets aus einer einzigen
            geometrischen Quelle: dem Paperplane-Icon mit seinen 9 benannten Facetten.
          </p>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="brand-block">
            <div className="brand-block-head">
              <div className="brand-block-title">
                <span className="brand-block-label">Logo System</span>
                <div className="brand-tool-pills">
                  <span className="brand-pill">Adobe Illustrator</span>
                  <span className="brand-pill">9 Facets</span>
                  <span className="brand-pill">SVG · PDF · AI</span>
                </div>
              </div>
              <p className="brand-block-desc">
                Konstruiert als sauberer Vektorpfad — jede Facette einzeln benannt und in
                WebGL, Blender und AE wiederverwendet. Keine eingebetteten Bitmaps, keine Effekte im Master.
              </p>
            </div>
            <div className="brand-logo-grid">
              {[
                { src: '/brand/logos/ivo-tech-logo-master.svg', label: 'Master', sub: 'Horizontal · Color', bg: '#05070B', w: 40, h: 9 },
                { src: '/brand/logos/ivo-tech-logo-icon.svg', label: 'Icon', sub: 'Square · Color', bg: '#05070B', w: 23, h: 23 },
                { src: '/brand/logos/ivo-tech-logo-horizontal.svg', label: 'Horizontal Light', sub: 'On Dark', bg: '#0B111C', w: 58, h: 13 },
                { src: '/brand/logos/ivo-tech-logo-master.svg', label: 'Wordmark', sub: '8+ Varianten', bg: '#1B2432', w: 62, h: 14 },
              ].map((v) => (
                <div key={v.label} className="brand-logo-card" style={{ background: v.bg }}>
                  <div className="brand-logo-media">
                    <img src={v.src} alt={`ivo-tech ${v.label}`} loading="lazy" decoding="async" width={v.w} height={v.h} />
                  </div>
                  <div className="brand-logo-meta">
                    <strong>{v.label}</strong>
                    <span>{v.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="brand-colors-row">
              {[
                { hex: '#05070B', name: 'Deep Black', role: 'Base Canvas' },
                { hex: '#0B111C', name: 'Carbon Navy', role: 'Elevated Surface' },
                { hex: '#1B2432', name: 'Gunmetal', role: 'UI Layer' },
                { hex: '#DCE6F2', name: 'Silver', role: 'Text · Icon' },
                { hex: '#00B7FF', name: 'Electric Cyan', role: 'Primary Signal' },
                { hex: '#7BE7FF', name: 'Ice Blue', role: 'Hover · Glow' },
              ].map((c) => (
                <div key={c.hex} className="brand-color-item">
                  <span
                    className="brand-color-dot"
                    style={{
                      background: c.hex,
                      border: c.hex === '#05070B' ? '1px solid rgba(220,230,242,0.2)' : 'none',
                      boxShadow: c.hex === '#00B7FF' ? '0 0 10px #00B7FF55' : 'none',
                    }}
                  />
                  <span className="brand-color-name">{c.name}</span>
                  <code className="brand-color-hex">{c.hex}</code>
                  <span className="brand-color-role">{c.role}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="brand-block brand-block-3d">
            <div className="brand-3d-poster">
              <img
                src="/brand/3d/ivo-tech-3d-master-dark.webp"
                alt="ivo-tech 3D Logo — Blender Master Dark Render"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={1920}
                height={1080}
              />
              <div className="brand-3d-overlay">
                <span className="brand-3d-tag">Blender · Cycles · WebP · 1080p</span>
              </div>
            </div>
            <div className="brand-3d-info">
              <div className="brand-block-title">
                <span className="brand-block-label">3D System</span>
                <div className="brand-tool-pills">
                  <span className="brand-pill">Blender</span>
                  <span className="brand-pill">GLB · GLTF</span>
                  <span className="brand-pill">Cycles Render</span>
                </div>
              </div>
              <p className="brand-block-desc">
                Das Icon wurde aus den Illustrator-Vektorpfaden in Blender übertragen und als
                Mesh mit eigenem Material-System modelliert. Alle Facetten-Namen aus dem
                AI-Master sind direkt als Blender-Objekte übernommen.
              </p>
              <dl className="brand-spec-list">
                <div><dt>Geometrie</dt><dd>9 Facets — left_top_silver, cyan_core, lower_shadow …</dd></div>
                <div><dt>Material</dt><dd>Metallic Silver · Cyan PBR · Deep Black</dd></div>
                <div><dt>Deliverables</dt><dd>GLB Master · GLB Emblem · Configurator GLB · WebP Preview</dd></div>
                <div><dt>Einsatz</dt><dd>Website 3D-Hero · AE Import · Motion Base</dd></div>
              </dl>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="brand-block-head" style={{ marginBottom: '1rem' }}>
            <div className="brand-block-title">
              <span className="brand-block-label">Motion Design</span>
              <div className="brand-tool-pills">
                <span className="brand-pill">After Effects</span>
                <span className="brand-pill">WebM · 1080p</span>
                <span className="brand-pill">ProRes Master</span>
              </div>
            </div>
            <p className="brand-block-desc">
              Vier Reveal-Families — jede mit eigenem Charakter und Einsatzzweck.
              AE nutzt die GLB-Geometrie als Compositing-Basis. Alle Exports als
              WebM 1080p für Web und ProRes 4444 Alpha als Master.
            </p>
          </div>
          <div className="reveal-grid">
            {motionReveals.map((item) => (
              <article key={item.name} className="reveal-card rv-card-full">
                <div className="rv-wrap">
                  <video
                    src={item.file}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={item.name}
                  />
                  <div className="rv-badges">
                    <span className="rv-tag">{item.tag}</span>
                    <span className="rv-dur">{item.duration}</span>
                  </div>
                </div>
                <div className="rv-info rv-info-full">
                  <h3>{item.name}</h3>
                  <p className="rv-use">{item.use}</p>
                  <p className="rv-desc">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
