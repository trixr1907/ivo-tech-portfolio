import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <a className="not-found-brand" href="/" aria-label="ivo-tech Startseite">
        <img src="/brand/logos/ivo-tech-logo-master.svg" alt="ivo-tech" width={140} height={31} />
      </a>

      <section className="not-found-card" aria-labelledby="not-found-title">
        <p className="not-found-code">404 / Signal verloren</p>
        <h1 id="not-found-title">Diese Seite ist nicht im System.</h1>
        <p className="not-found-copy">
          Der aufgerufene Pfad existiert nicht oder wurde verschoben. Auf der Startseite findest du Projekte,
          technische Einblicke und Kontaktmöglichkeiten.
        </p>
        <nav className="not-found-actions" aria-label="Weiterführende Links">
          <a className="not-found-primary" href="/">Zur Startseite</a>
          <a href="/#selected-work">Zu den Projekten</a>
          <a href="/#kontakt">Kontakt</a>
        </nav>
      </section>
    </main>
  )
}
