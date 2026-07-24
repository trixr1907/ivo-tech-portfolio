// Privacy policy page — mandatory for German websites with contact forms/analytics
export function DatenschutzPage() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <a href="/" className="legal-back">← Zurück zur Startseite</a>

        <h1>Datenschutzerklärung</h1>

        <section>
          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
            Yves Simon Schenker<br />
            Lange Rötterstraße 56<br />
            68167 Mannheim, Deutschland<br />
            E-Mail: <a href="mailto:contact@ivo-tech.com">contact@ivo-tech.com</a>
          </p>
        </section>

        <section>
          <h2>2. Erhobene Daten beim Besuch dieser Website</h2>
          <p>
            Beim Aufrufen dieser Website werden durch den Browser automatisch Informationen an den Server
            übermittelt (sog. Server-Log-Dateien). Dazu zählen: IP-Adresse, Datum und Uhrzeit des Abrufs,
            aufgerufene URL, Browsertyp, Betriebssystem und Referrer-URL. Diese Daten werden von Vercel
            (Hosting-Anbieter) technisch verarbeitet und sind für den Betrieb der Website notwendig.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung
            der Website).
          </p>
        </section>

        <section>
          <h2>3. Hosting</h2>
          <p>
            Diese Website wird bei Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA,
            gehostet. Es wurde ein Auftragsverarbeitungsvertrag (DPA) mit Vercel abgeschlossen.
            Weitere Informationen finden Sie in der{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
              Datenschutzerklärung von Vercel
            </a>.
          </p>
        </section>

        <section>
          <h2>4. Kontakt per E-Mail</h2>
          <p>
            Wenn Sie mir per E-Mail schreiben, werden Ihre Angaben zwecks Bearbeitung der Anfrage und für den
            Fall von Anschlussfragen bei mir gespeichert. Diese Daten werden nicht ohne Ihre Einwilligung
            weitergegeben. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </section>

        <section>
          <h2>5. Keine Cookies, kein Tracking</h2>
          <p>
            Diese Website verwendet keine Tracking-Cookies, keine Analytics-Dienste (Google Analytics o.ä.)
            und keine Social-Media-Plugins. Es werden keine personenbezogenen Daten für Werbezwecke
            verarbeitet.
          </p>
        </section>

        <section>
          <h2>6. Schriftarten</h2>
          <p>
            Diese Website verwendet selbst gehostete Schriftarten (Syne). Es findet kein Laden von
            Google Fonts oder anderen externen Schriftdiensten statt.
          </p>
        </section>

        <section>
          <h2>7. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung
            (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO) und Datenübertragbarkeit
            (Art. 20 DSGVO). Zur Ausübung dieser Rechte wenden Sie sich an:{' '}
            <a href="mailto:contact@ivo-tech.com">contact@ivo-tech.com</a>
          </p>
          <p>
            Außerdem haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Zuständig ist
            der Landesbeauftragte für den Datenschutz Baden-Württemberg.
          </p>
        </section>
      </div>
    </div>
  )
}
