import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

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

export function HobbySection() {
  return (
    <>
      {/* ── HOBBY ────────────────────────────────────────── */}
      <section id="hobby" className="section hobby-section" aria-labelledby="hobby-h">
  <div className="section-inner">

    <Reveal className="sec-head">
      <div>
        <span className="sec-label">Hobby Lab</span>
        <span className="sec-num">— 06</span>
      </div>
      <h2 id="hobby-h">
        Dinge, die ich tue,<br /><em>weil ich es kann.</em>
      </h2>
    </Reveal>

    {/* ── Helium Mining ─────────────────────── */}
    <Reveal delay={0.04}>
      <div className="hobby-block">

        <div className="hobby-block-head">
          <div className="hobby-head-left">
            <div className="hobby-icon-wrap hb-helium">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h3 className="hobby-title">Helium Network Mining</h3>
              <div className="hobby-pills">
                <span className="hobby-pill hp-year">seit 2021</span>
                <span className="hobby-pill">bis zu 4 Hotspots</span>
                <span className="hobby-pill">PoC · HNT</span>
              </div>
            </div>
          </div>
          <p className="hobby-intro-text">
            Schon 2021 das dezentrale LoRaWAN-Funknetz von Helium entdeckt — zu einer Zeit,
            als die meisten noch fragten "Helium was?". Hotspots an vier verschiedenen
            Standorten aufgebaut. Jeder Standort strategisch gewählt: Höhe, Antennengewinn
            und freies Sichtfeld bestimmen die Coverage-Reichweite und damit den HNT-Ertrag.
          </p>
        </div>

        {/* Visuelle Setup-Darstellung: zwei animierte Karten */}
        <div className="helium-setups">

          {/* Karte 1: Outdoor / Dach Setup */}
          <div className="hsetup-card">
            <div className="hsetup-visual hsetup-outdoor">
              {/* Animierter Puls-Turm */}
              <div className="hs-tower">
                <div className="hs-mast" />
                <div className="hs-antenna" />
                <div className="hs-device" />
                <div className="hs-pulse hs-p1" />
                <div className="hs-pulse hs-p2" />
                <div className="hs-pulse hs-p3" />
              </div>
              {/* Hex Coverage Cells */}
              <div className="hs-coverage">
                <div className="hc-hex hc-c" />
                <div className="hc-hex hc-r1" />
                <div className="hc-hex hc-r2" />
                <div className="hc-hex hc-r3" />
                <div className="hc-hex hc-r4" />
                <div className="hc-hex hc-r5" />
                <div className="hc-hex hc-r6" />
              </div>
              <div className="hsetup-beam" />
            </div>
            <div className="hsetup-info">
              <span className="hsetup-type">Outdoor Setup</span>
              <h4>Dach · Outdoor-Mast</h4>
              <dl>
                <div><dt>Gerät</dt><dd>RAK Wireless v2</dd></div>
                <div><dt>Antenne</dt><dd>8 dBi Outdoor Fiberglass</dd></div>
                <div><dt>Montage</dt><dd>Dachmast · wetterfest</dd></div>
                <div><dt>Vorteil</dt><dd>Max. Sichtfeld, hoher Witness-Count</dd></div>
              </dl>
            </div>
          </div>

          {/* Karte 2: Indoor / Fenster Setup */}
          <div className="hsetup-card">
            <div className="hsetup-visual hsetup-indoor">
              {/* Fenster mit Miner */}
              <div className="hs-window">
                <div className="hs-window-frame">
                  <div className="hs-city-bg">
                    <div className="hc-building hcb-1" />
                    <div className="hc-building hcb-2" />
                    <div className="hc-building hcb-3" />
                    <div className="hc-building hcb-4" />
                  </div>
                </div>
                <div className="hs-windowsill">
                  <div className="hs-miner-box">
                    <div className="hs-led" />
                  </div>
                  <div className="hs-mini-antenna" />
                </div>
              </div>
              <div className="hs-signal-dots">
                <div className="hs-sdot sd1" />
                <div className="hs-sdot sd2" />
                <div className="hs-sdot sd3" />
              </div>
            </div>
            <div className="hsetup-info">
              <span className="hsetup-type">Indoor Setup</span>
              <h4>Fensterbank · Balkon</h4>
              <dl>
                <div><dt>Gerät</dt><dd>Bobcat 300</dd></div>
                <div><dt>Antenne</dt><dd>3 dBi Indoor / 5.8 dBi Balkon</dd></div>
                <div><dt>Vorteil</dt><dd>Kein Aufwand, läuft 24/7</dd></div>
                <div><dt>Limit</dt><dd>Weniger Coverage als Outdoor</dd></div>
              </dl>
            </div>
          </div>

        </div>

        {/* Stats + Tech Details */}
        <div className="helium-body">

          {/* Hexagon Network Visual */}
          <div className="helium-hex-map" aria-label="Helium Netzwerk Visualisierung">
            <div className="hex-grid">
              {[
                { id: 'h1', active: true,  label: 'Hotspot 1', sub: 'Indoor · 3 dBi',  rssi: '−92 dBm' },
                { id: 'h2', active: true,  label: 'Hotspot 2', sub: 'Dach · 5.8 dBi',  rssi: '−86 dBm' },
                { id: 'h3', active: false, label: 'Witness',   sub: 'Peer-Node',        rssi: '−98 dBm' },
                { id: 'h4', active: false, label: 'Witness',   sub: 'Peer-Node',        rssi: '−101 dBm' },
                { id: 'h5', active: true,  label: 'Hotspot 3', sub: 'Balkon · 3 dBi',  rssi: '−89 dBm' },
                { id: 'h6', active: false, label: 'Witness',   sub: 'Peer-Node',        rssi: '−95 dBm' },
                { id: 'h7', active: false, label: 'Witness',   sub: 'Peer-Node',        rssi: '−103 dBm' },
                { id: 'h8', active: true,  label: 'Hotspot 4', sub: 'Outdoor · 8 dBi', rssi: '−81 dBm' },
                { id: 'h9', active: false, label: 'Witness',   sub: 'Peer-Node',        rssi: '−106 dBm' },
              ].map((h) => (
                <div
                  key={h.id}
                  className={`hex-cell${h.active ? ' hex-mine' : ' hex-peer'}`}
                  title={`${h.label} — ${h.rssi}`}
                >
                  <div className="hex-inner">
                    <span className="hex-label">{h.label}</span>
                    <span className="hex-sub">{h.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hex-legend">
              <span><span className="hl-dot mine" /> Eigener Hotspot</span>
              <span><span className="hl-dot peer" /> Witness</span>
            </div>
          </div>

          {/* Stats Kacheln */}
          <div className="helium-stats">
            {[
              { value: '2021', label: 'Start', sub: 'Early Adopter' },
              { value: '4',    label: 'Hotspots', sub: 'max. gleichzeitig' },
              { value: 'PoC',  label: 'Proof of Coverage', sub: 'Consensus-Mechanismus' },
              { value: 'HNT',  label: 'Native Token', sub: 'Mining-Reward' },
            ].map((s) => (
              <div key={s.label} className="helium-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
                <small>{s.sub}</small>
              </div>
            ))}

            {/* Tech Details */}
            <div className="helium-tech-block">
              <p className="helium-tech-label">Hardware & Setup</p>
              <dl className="helium-tech-list">
                {[
                  ['Hotspot', 'RAK Wireless, Bobcat 300'],
                  ['Frequenz', '868 MHz (EU)'],
                  ['Antenne', '3–8 dBi je nach Standort'],
                  ['Montage', 'Innen · Balkon · Dach · Outdoor-Mast'],
                  ['Software', 'Helium App · Explorer · Seniorde'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </div>
        </div>

        {/* Humor-Footer */}
        <div className="helium-humor">
          <span className="helium-humor-icon">💡</span>
          <p>
            <strong>Disclaimer für Investoren:</strong> War mal ein potenziell lukratives Projekt —
            Early Adopter, gute Coverage, solide HNT-Rewards. Dann hat Helium die Tokenomics
            überarbeitet, der HNT-Preis hat sich... kreativ entwickelt, und der ROI hat sich
            verabschiedet wie ein Hotspot ohne Witness. Stand heute: technisch faszinierend,
            finanziell eher ein Lernprojekt. <em>10/10 würde wieder früh dabei sein.</em>
          </p>
        </div>

      </div>
    </Reveal>

    {/* ── PC Building ────────────────────────── */}
    <Reveal delay={0.06}>
      <div className="hobby-block">

        <div className="hobby-block-head">
          <div className="hobby-head-left">
            <div className="hobby-icon-wrap hb-pc">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div>
              <h3 className="hobby-title">PC Building</h3>
              <div className="hobby-pills">
                <span className="hobby-pill hp-green">Sweetspot Engineering</span>
                <span className="hobby-pill">Custom Builds</span>
                <span className="hobby-pill">Value over Hype</span>
              </div>
            </div>
          </div>
          <p className="hobby-intro-text">
            Kein blindes Spec-Sheet-Racing. Der Sweetspot liegt da, wo Preis-Leistung
            wirklich trifft — ohne Overhead für Komponenten, die im Alltag keinen
            Unterschied machen. Ich baue Systeme nach dem, was jemand wirklich braucht:
            individuell abgestimmt auf Use-Case, Budget und Langlebigkeit.
          </p>
        </div>

        {/* Sweetspot-Philosophie Visual + Tier-Grid */}
        <div className="pc-body">

          {/* Philosophie-Kachel */}
          <div className="pc-philosophy">
            <div className="pc-philosophy-core">
              <div className="sweetspot-dial">
                <div className="sd-ring sd-outer"><span>Overhead</span></div>
                <div className="sd-ring sd-mid"><span>Sweet<br/>spot</span></div>
                <div className="sd-ring sd-inner" />
              </div>
              <div className="sweetspot-axis">
                <div className="sa-bar">
                  <span className="sa-label">Leistung</span>
                  <div className="sa-track">
                    <div className="sa-fill" style={{ width: '72%' }} />
                    <span className="sa-marker">✓</span>
                  </div>
                </div>
                <div className="sa-bar">
                  <span className="sa-label">Kosten</span>
                  <div className="sa-track">
                    <div className="sa-fill sa-fill-cost" style={{ width: '52%' }} />
                    <span className="sa-marker">✓</span>
                  </div>
                </div>
                <div className="sa-bar">
                  <span className="sa-label">Zukunftssicher</span>
                  <div className="sa-track">
                    <div className="sa-fill sa-fill-future" style={{ width: '65%' }} />
                    <span className="sa-marker">✓</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="pc-philosophy-quote">
              "Was brauchst du wirklich — und was ist nur Marketing?"
            </p>
          </div>

          {/* Tier-Grid */}
          <div className="pc-tiers">
            {[
              {
                tier: 'Casual',
                sub: 'Alltagsmaschine',
                color: '#1B2432',
                accent: '#8A96A8',
                items: ['Ryzen 5 / Core i5', '16 GB DDR5', 'Integrierte GPU', 'NVMe 1 TB', 'Lüftergekühltes Midi'],
                note: 'Office, Browser, 4K-Video: vollständig ausreichend. GPU-Upgrade jederzeit möglich.',
              },
              {
                tier: 'Creator',
                sub: 'Sweetspot',
                color: '#0B111C',
                accent: '#00B7FF',
                items: ['Ryzen 7 / Core i7', '32 GB DDR5', 'RX 7700 / RTX 4060', 'NVMe 2 TB', 'Guter Airflow-Case'],
                note: 'Videoschnitt, Rendering, leichtes Gaming — hier liegt der echte Preis-Leistungs-Knick.',
              },
              {
                tier: 'Performance',
                sub: 'Wenn es Sinn macht',
                color: '#070B12',
                accent: '#7BE7FF',
                items: ['Ryzen 9 / Core i9', '64 GB DDR5', 'RX 7900 XTX / RTX 4080', 'NVMe 4 TB RAID', '360mm AiO'],
                note: 'Nur wenn der Use-Case es fordert — 3D, AI-Training, High-FPS Esports.',
              },
            ].map((t) => (
              <div key={t.tier} className="pc-tier-card" style={{ '--tier-accent': t.accent, background: t.color } as CSSProperties}>
                <div className="pc-tier-head">
                  <span className="pc-tier-name" style={{ color: t.accent }}>{t.tier}</span>
                  <span className="pc-tier-sub">{t.sub}</span>
                </div>
                <ul className="pc-tier-list">
                  {t.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="pc-tier-note">{t.note}</p>
              </div>
            ))}
          </div>

          {/* Entscheidungs-Matrix */}
          <div className="pc-matrix">
            <p className="pc-matrix-label">Was wirklich zählt — und was nicht</p>
            <div className="pc-matrix-grid">
              {[
                { icon: '✓', text: 'CPU-Generation > MHz-Zahlen', good: true },
                { icon: '✓', text: 'RAM-Takt ist messbar wichtig', good: true },
                { icon: '✓', text: 'NVMe Gen4 vs Gen5: kaum Unterschied im Alltag', good: true },
                { icon: '✓', text: 'GPU: real-world Benchmarks > Papier-TFLOPs', good: true },
                { icon: '✗', text: 'RGB erhöht nicht die FPS', good: false },
                { icon: '✗', text: '1000W PSU für 200W-System', good: false },
                { icon: '✗', text: 'Flagship-GPU für 1080p-Office', good: false },
                { icon: '✗', text: '64 GB RAM wenn 16 GB leer bleiben', good: false },
              ].map((m) => (
                <div key={m.text} className={`pc-matrix-item${m.good ? ' pmg' : ' pmb'}`}>
                  <span className="pc-matrix-icon">{m.icon}</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Reveal>

  </div>
      </section>
    </>
  )
}
