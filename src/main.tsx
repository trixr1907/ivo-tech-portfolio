import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ImpressumPage } from './components/legal/ImpressumPage.tsx'
import { DatenschutzPage } from './components/legal/DatenschutzPage.tsx'
import './components/legal/legal.css'

const path = window.location.pathname.replace(/\/$/, '')

let Root
if (path === '/impressum') {
  Root = ImpressumPage
} else if (path === '/datenschutz') {
  Root = DatenschutzPage
} else {
  Root = App
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
