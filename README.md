# ivo-tech Portfolio

**Live:** [https://ivo-tech.com](https://ivo-tech.com)

Personal portfolio and project showcase for Ivo — Full-Stack Developer mit Frontend-Fokus aus Mannheim.
Focused on production-ready web applications, interactive UI, 3D interfaces and practical developer tooling.

---

## Featured Projects

- **[GOALS Optimizer](https://goals.ivo-tech.com)** — Live Next.js optimizer with squad import, fit scores, formations and 408 tests
- **[Event Management Hub](https://eventhub.ivo-tech.com)** — Full-Stack platform with Supabase RLS, audit trail, DSGVO export and HCP compliance
- **[DLD 3D-Konfigurator](https://deinlieblingsdruck.de/3d-konfigurator/)** — Live WooCommerce plugin with Three.js STL viewer, pricing engine and admin panel

## Stack

- React 19
- TypeScript (strict)
- Vite 8
- Three.js
- Motion (Framer Motion)
- GSAP / Lenis
- Supabase
- Playwright Component Testing
- ESLint / Prettier
- Vercel

## Highlights

- Interactive project case studies with problem/solution/impact structure
- Three.js / motion-driven UI with custom orbit system and 3D hero
- Responsive mobile-first layout with accessible navigation
- Lazy-loaded heavy 3D sections via IntersectionObserver
- Self-hosted fonts — no Google Fonts, GDPR-safe
- Strict Content-Security-Policy configured in Vercel headers
- 0 lint errors, 0 npm audit vulnerabilities

## Development

Install dependencies:

```bash
npm install --include=dev
```

Start local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Run component tests:

```bash
npm run test
```

Run the production accessibility and Lighthouse QA gates after building:

```bash
npm run qa:a11y
npm run qa:lighthouse:mobile
npm run qa:lighthouse:desktop
```

Or build once and run all three gates serially:

```bash
npm run qa:quality
```

Pa11y requires zero WCAG2AA issues. Both Lighthouse modes require Performance >= 90 and Accessibility, Best Practices and SEO scores of 100. Reports stay local in `.lighthouseci/`. The QA commands reserve `127.0.0.1:4174` and fail before testing if that port is already occupied.

## Deployment

Production runs on Vercel. Releases are deployed manually after linting, component tests and the production build pass:

```bash
npm run lint
npm test
npm run build
npx vercel --prod --yes
```

## Project Structure

```text
src/
  components/      UI sections, reusable components, legal pages
  data/            project and home data
  hooks/           animation and interaction hooks
  lib/             integration helpers
public/
  brand/           logo, 3D and project assets
  fonts/           self-hosted fonts
```

## Links

- Website: https://ivo-tech.com
- GitHub profile: https://github.com/trixr1907
- Contact: contact@ivo-tech.com
