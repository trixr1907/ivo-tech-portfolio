// Legal notice page — mandatory for German websites (§ 5 DDG)
export function ImpressumPage() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <a href="/" className="legal-back">← Zurück zur Startseite</a>

        <h1>Impressum</h1>
        <p className="legal-subtitle">Angaben gemäß § 5 DDG</p>

        <section>
          <h2>Verantwortlicher</h2>
          <p>
            Yves Simon Schenker<br />
            Lange Rötterstraße 56<br />
            68167 Mannheim, Deutschland<br />
            E-Mail: <a href="mailto:contact@ivo-tech.com">contact@ivo-tech.com</a>
          </p>
        </section>

        <section>
          <h2>Inhalt</h2>
          <p>
            Diese Website ist ein persönliches Portfolio zur Präsentation eigener Projekte und Fähigkeiten.
            Es werden keine Waren oder Dienstleistungen angeboten.
          </p>
        </section>

        <section>
          <h2>Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf dieser Website nach den
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
            zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
        </section>

        <section>
          <h2>Haftung für Links</h2>
          <p>
            Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
          </p>
        </section>

        <section>
          <h2>Urheberrecht</h2>
          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
            Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung,
            Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors.
          </p>
        </section>
      </div>
    </div>
  )
}
