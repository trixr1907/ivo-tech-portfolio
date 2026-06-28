# ivo-tech Portfolio

Personal portfolio and project showcase for Ivo — focused on production-minded web applications, interactive UI, 3D interfaces and practical developer tooling.

Live: https://ivo-tech.com

## Stack

- React 19
- TypeScript
- Vite 8
- Three.js
- Motion
- GSAP / Lenis
- Playwright Component Testing
- ESLint / Prettier
- Vercel

## Highlights

- Interactive portfolio with project case studies
- Three.js / motion-driven UI sections
- Responsive layout and mobile navigation
- Lazy-loaded heavy 3D sections
- Accessibility and SEO focused structure
- Production deployment on Vercel

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

Production deployment runs through Vercel.

```bash
npm run build
npx vercel --prod
```

## Project Structure

```text
src/
  components/      UI sections and reusable components
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
