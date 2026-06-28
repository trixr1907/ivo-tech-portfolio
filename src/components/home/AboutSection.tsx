import { Reveal } from '../ui/Reveal'
import { AboutPortrait } from './AboutPortrait'
import { craftPrinciples, timeline } from '../../data/homeData'
import { useGsapReveal } from '../../hooks/useGsapReveal'

export function AboutSection() {
  useGsapReveal("#about")
  return (
    <section id="about" className="section about-section" aria-labelledby="about-h">
      <div className="section-inner about-section-inner">

        <Reveal className="sec-head about-sec-head">
          <div>
            <span className="sec-label">Über mich</span>
            <span className="sec-num">— 01</span>
          </div>
          <p className="about-sec-tagline">
            Praktisch gelernt. Produktnah gebaut. Mit echtem Output.
          </p>
        </Reveal>

        <div className="about-split">
          <div className="about-text-col">
            <Reveal>
              <h2 id="about-h" className="about-headline">
                Neue Probleme.
                <br />
                Klare erste Schritte.
                <br />
                <em>Echter Output.</em>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="about-copy">
                <p>
                  Ich bin Ivo, Full-Stack Developer aus Mannheim. Ich entwickle Webapplikationen, 3D-Interfaces
                  und produktnahe Workflows mit Fokus auf Architektur, Bedienbarkeit und Live-Betrieb.
                </p>
                <p>
                  Ich komme schnell in neue Themen rein, finde erste tragfähige Schritte und arbeite mich mit
                  viel Ehrgeiz durch die Details. Was hier liegt, sind keine Übungen fürs Portfolio, sondern
                  Projekte mit echten Entscheidungen, echten Kanten und echtem Output.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="about-stats" aria-label="Kurzprofil">
                {[
                  { label: 'Location', val: 'Mannheim' },
                  { label: 'Focus', val: 'Web · AI · Motion' },
                  { label: 'Signal', val: 'Cyan' },
                  { label: 'Status', val: 'Aktiv' },
                ].map((s) => (
                  <div key={s.label} className="stat-box">
                    <span className="stat-label">{s.label}</span>
                    <span className="stat-val">{s.val}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="about-portrait-col">
            <Reveal delay={0.06}>
              <AboutPortrait />
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.2}>
          <div className="craft-strip">
            {craftPrinciples.map(({ icon: Icon, label, text }) => (
              <article key={label} className="craft-pill">
                <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <strong>{label}</strong>
                  <span>{text}</span>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="timeline-strip about-timeline" aria-label="Arbeitsweise">
            {timeline.map((step) => (
              <article key={step.year} className="timeline-step">
                <span>{step.year}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  )
}
