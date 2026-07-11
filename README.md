# ivo-tech Portfolio

**Live:** [https://ivo-tech.com](https://ivo-tech.com)

Personal portfolio and project showcase for Ivo — Full-Stack Engineer from Mannheim.
Focused on production-ready web applications, interactive UI, 3D interfaces and practical developer tooling.

---

## Featured Projects

- **[Event Management Hub](https://eventhub.ivo-tech.com)** — Full-Stack platform with Supabase RLS, Audit Trail, DSGVO export, HCP compliance
- **[DLD 3D-Konfigurator](https://deinlieblingsdruck.de/3d-konfigurator/)** — Live WooCommerce plugin with Three.js STL viewer, pricing engine, admin panel

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

## Deployment

Production deployment runs through Vercel (connected to this repo).
Manual deploy:

```bash
npm run build
npx vercel --prod
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
