export type Project = {
  id: string
  title: string
  tagline: string
  problem: string
  cover: string
  tags: string[]
  status?: 'live' | 'lab-prototype'
  overview: {
    built: string
    challenge: string
    role: string
  }
  highlights: string[]
  screenshots: Array<{
    src: string
    caption: string
  }>
  signals?: Array<{
    label: string
    value: string
    text: string
  }>
  architecture?: string[]
  fileStates?: Array<{
    format: string
    mode: string
    text: string
  }>
  trustChecks?: string[]
  impact?: Array<{
    value: string
    label: string
  }>
  result?: string
  links: {
    demo?: string
    repo?: string
  }
}

const eventHubImages = {
  cover: '/brand/projects/event-hub-cover.webp',
  agenda: '/brand/projects/event-hub-1.webp',
  compliance: '/brand/projects/event-hub-2.webp',
  registration: '/brand/projects/event-hub-3.webp',
}

const dldImages = {
  cover: '/brand/projects/dld-cover.webp',
  calculated: '/brand/projects/dld-dev-portfolio.webp',
  mobile: '/brand/projects/dld-mobile.webp',
}

export const projects: Project[] = [
  {
    id: 'event-hub',
    title: 'Event Management Hub',
    tagline:
      'Eine sichere Full-Stack-Plattform für professionelle Eventplanung mit Gästemanagement, Budget, Agenda, Ticketing, Reporting, DSGVO-Export und HCP-Compliance. Gebaut mit React, TypeScript und Supabase — inklusive RLS, Audit-Trail, Edge Functions und produktionsnaher Dashboard-UX.',
    problem:
      'Komplexe Events erzeugen verteilte Daten, manuelle Nachverfolgung und Compliance-Risiken. Der Event Hub ersetzt Excel-/Mail-Chaos durch eine zentrale, sichere und auditierbare Arbeitsplattform.',
    cover: eventHubImages.cover,
    tags: [
      'React',
      'TypeScript',
      'Vite',
      'Supabase',
      'PostgreSQL',
      'Row Level Security',
      'Supabase Auth',
      'Edge Functions',
      'Realtime-ready',
      'TanStack Query',
      'React Router',
      'Tailwind CSS',
      'shadcn/ui',
      'Radix UI',
      'Recharts',
      'React Hook Form',
      'Zod',
      'Vitest',
      'Playwright',
      'DSGVO',
      'Audit Logging',
      'CSV/ICS/PDF Export',
    ],
    overview: {
      built:
        'Ein vollwertiger Event-Management-Hub für professionelle Veranstaltungen: Eventplanung, Gästemanagement, Budgetkontrolle, Agenda, Aufgaben, Dienstleister, Ticketing, E-Mail-Kommunikation, Reporting, Analytics, DSGVO-Export und HCP-Compliance in einer zentralen Web-App. Gebaut als modernes Supabase-gestütztes Full-Stack-Produkt mit sicherer Rollenlogik, RLS, Audit-Trail, Echtzeit-fähiger Datenbasis und produktionsnaher Admin-/Operator-UX.',
      challenge:
        'Event-Teams arbeiten oft mit verstreuten Excel-Listen, E-Mail-Verläufen, manuellen Statusabfragen und unklaren Verantwortlichkeiten. Das erzeugt Fehler, doppelte Datenpflege, fehlende Compliance-Nachweise und schlechte Übersicht bei komplexen Events. Der Hub bündelt diese Prozesse in einer strukturierten Plattform: aktuelle Daten, klare Rollen, nachvollziehbare Änderungen, exportfähige Reports und sichere öffentliche Anmeldung ohne direkten Datenbankzugriff.',
      role:
        'Konzeption, Architektur und Umsetzung als Full-Stack-Engineer. Beiträge: Datenmodell und Supabase-Architektur, RLS-/Security-Konzept, React-/TypeScript-Frontend, CRUD-Module für Events/Gäste/Budget/Aufgaben/Locations/Dienstleister/Agenda/Ticketing, DSGVO-/Audit-/Compliance-Funktionen, HCP-Spend-Tracking und Transparenzreporting, Edge-Function-Logik für E-Mail-/Registrierungsflows, Tests, E2E-Gates, Export-Verifikation und Demo-Daten-Pipeline, UI/UX-System mit dunklem Premium-Dashboard-Look.',
    },
    highlights: [
      'Compliance-first Architektur: RLS, Rollenrechte, Audit-Trail, DSGVO-Auskunft, Soft-Delete-Logik und HCP-Transparenzreporting sind nicht nachträglich angeklebt, sondern Teil des Kernsystems.',
      'Operatives Event-Dashboard statt reiner CRUD-App: Dashboard, KPIs, Aufgaben, Budgetwarnungen, Agenda, Gästestatus, Ticketing und Dienstleistersteuerung greifen ineinander. Das System zeigt nicht nur Daten, sondern steuert echte Event-Arbeit.',
      'Produktionsnahe Export- und Reporting-Qualität: CSV mit BOM/Semikolon/Umlauten, ICS nach Kalenderstandard, druckfähige Reports, PDF-/Print-Fallbacks und Download-Tests. Fokus auf echte Nutzbarkeit, nicht Demo-Fassade.',
    ],
    screenshots: [
      { src: eventHubImages.cover, caption: 'Zentrales Dashboard mit KPIs, Aufgabenstatus und Event-Aktivität' },
      { src: eventHubImages.agenda, caption: 'Agenda- und Timeline-Planung für komplexe Veranstaltungsabläufe' },
      { src: eventHubImages.compliance, caption: 'HCP-Spend-Tracking mit Cap-Überwachung und Transparenzreporting' },
      { src: eventHubImages.registration, caption: 'Öffentliche Registrierung mit sicherer Supabase-RLS-Architektur' },
    ],
    links: {
      demo: 'https://eventhub.ivo-tech.com',
      repo: '',
    },
  },
  {
    id: 'dld-3d-configurator',
    title: 'DLD 3D-Konfigurator',
    tagline:
      'Live bei deinlieblingsdruck.de: ein WooCommerce-Konfigurator für 3D-Druck mit Datei-Upload, 3D-Vorschau, Material- und Farbauswahl, Preisberechnung, Warenkorb-Anbindung und eigenem WordPress-Adminbereich.',
    problem:
      '3D-Druck lässt sich online nur schwer sauber verkaufen: Dateien müssen geprüft, Maße erkannt, Material und Farbe gewählt, Preise nachvollziehbar berechnet und Sonderanfertigungen rechtlich abgesichert werden. Zusätzlich braucht der Betreiber ein Admin-Panel, um Preise, Druckerprofile, Farben und Engine-Verbindungen ohne Code-Änderung zu steuern.',
    cover: dldImages.cover,
    status: 'live' as const,
    tags: [
      'Live WooCommerce',
      'WordPress Plugin',
      'Admin Panel',
      'Three.js',
      'STL/3MF Preview',
      'Material & Color UX',
      'Printer Profiles',
      'Pricing Engine',
      'Engine API Debug',
      'Legal Checkout',
      'Playwright E2E',
    ],
    overview: {
      built:
        'Ein WordPress-/WooCommerce-Plugin mit öffentlichem Konfigurator und separatem Adminbereich. Kunden laden STL- oder 3MF-Dateien hoch, prüfen das Modell im Three.js-Canvas, wählen Material, Qualität, Farbe und Stückzahl und übernehmen das Ergebnis in den Warenkorb. Im Backend verwaltet der Betreiber Preise, Farbsortimente, Upload-Grenzen, Engine-Modus, API-Zugang und Druckerprofile.',
      challenge:
        'Frontend und Betriebsebene mussten zusammenpassen. Die Kundenseite braucht wenige, klare Entscheidungen. Das Admin-Panel muss dagegen viele Stellschrauben abbilden: Materialfaktoren, Maschinenstundensatz, Startgebühr, Farbgruppen, Steueranzeige, Bauraumgrenzen, Profil-Badges und Engine-Diagnose. Beides darf sich nicht widersprechen.',
      role:
        'Konzeption und Umsetzung des Plugins: Konfigurator-UI, Three.js-Viewer, Preislogik, WooCommerce-Übergabe, WordPress-Adminseiten für Einstellungen, Druckerprofile und Debugging sowie Tests gegen die laufende WordPress-Instanz.',
    },
    highlights: [
      'Kundenseite: Upload, Vorschau, Auswahl und Checkout bleiben kompakt genug, um ohne CAD-Wissen bedienbar zu sein.',
      'Adminbereich: Preise, Farben, Upload-Regeln, Engine-API und Druckerprofile lassen sich in WordPress pflegen, statt hart im Code zu stehen.',
      'Betriebssicherheit: Debug-Seite, API-Test, Profil-Badges und deaktivierter Warenkorb-Button machen technische Zustände sichtbar, bevor eine Bestellung entsteht.',
    ],
    screenshots: [
      { src: dldImages.cover, caption: 'Live-Konfigurator: Upload, Materialauswahl, Farbwähler und Preisbereich' },
      { src: dldImages.calculated, caption: 'Berechneter Zustand mit 3D-Vorschau, Modellwerten und Warenkorb-Übergabe' },
      { src: dldImages.mobile, caption: 'Mobile Ansicht mit reduziertem Layout für den Bestellprozess' },
    ],
    signals: [
      { label: 'Frontend', value: 'STL · 3MF', text: 'Die öffentliche Seite konzentriert sich auf Upload, Vorschau und wenige verständliche Kaufentscheidungen.' },
      { label: 'Admin', value: 'Preise · Profile', text: 'WordPress steuert Materialfaktoren, Farben, Druckerprofile, Upload-Limits und Engine-Modus.' },
      { label: 'Diagnose', value: 'API · Debug', text: 'Debug-Seite und Verbindungstest zeigen, ob Engine, Auth und WordPress-HTTP sauber zusammenspielen.' },
    ],
    architecture: [
      'Frontend: Upload-Zone, Three.js-Canvas, Modell-Toolbar, Material-/Farbwahl, Menge und Preisbereich',
      'WordPress Admin: Einstellungsseite für Preise, Steueranzeige, Upload-Limits, Farben, Engine-Modus und API-Zugang',
      'Druckerprofile: aktive Profile, Standarddrucker, Bauraum, Materialfreigaben, Badges und Anzeigenamen',
      'WooCommerce: Warenkorb-Metadaten, rechtliche Bestätigung und Bestellübergabe',
      'QA: Playwright-Prüfung für Upload, Preiszustand, Legal-Checkboxen, mobile Ansicht und Checkout-Verhalten',
    ],
    fileStates: [
      { format: 'Kunde', mode: 'Konfigurator', text: 'Datei hochladen, Modell prüfen, Material und Farbe wählen, Preis sehen und Bestellung starten.' },
      { format: 'Betreiber', mode: 'Admin Panel', text: 'Preise, Farben, Druckerprofile und Engine-Zugang zentral in WordPress pflegen.' },
      { format: 'Support', mode: 'Debug', text: 'API-Verbindung, Antwortzeit, Engine-Modus und HTTP-Status direkt im Plugin prüfen.' },
    ],
    trustChecks: [
      'Datei ist hochgeladen und auswertbar',
      'Preisbereich zeigt einen gültigen Zustand',
      'Rechtliche Bestätigungen sind gesetzt',
      'Druckerprofil und Engine-Konfiguration sind im Admin nachvollziehbar',
    ],
    impact: [
      { value: '3 Adminseiten', label: 'Einstellungen, Druckerprofile, Debug' },
      { value: 'Ohne Code', label: 'Preise, Farben und Profile in WordPress steuerbar' },
      { value: 'Live', label: 'Produktiv erreichbar auf deinlieblingsdruck.de' },
    ],
    result:
      'Der Konfigurator macht 3D-Druck bestellbar, ohne den Betrieb zu verstecken: Kunden bekommen eine klare Upload- und Kaufstrecke, Betreiber behalten Preise, Profile, Farben und Engine-Status im WordPress-Admin unter Kontrolle.',
    links: { demo: 'https://deinlieblingsdruck.de/3d-konfigurator/' },
  },
]
