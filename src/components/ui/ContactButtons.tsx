import { ArrowUpRight } from 'lucide-react'
import { MagButton } from './MagButton'

export function ContactButtons({
  onNavigate,
}: {
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, hash: string) => void
}) {
  return (
    <div className="hero-ctas-wrap">
      <MagButton className="btn-primary" href="#selected-work" onClick={(event) => onNavigate(event, '#selected-work')}>
        Projekte ansehen <ArrowUpRight size={16} />
      </MagButton>
      <div className="hero-secondary-actions">
        <MagButton className="btn-ghost" href="mailto:contact@ivo-tech.com">
          Kontakt
        </MagButton>
        <MagButton className="btn-ghost" href="/yves-simon-schenker-cv.pdf" download>
          Lebenslauf
        </MagButton>
      </div>
    </div>
  )
}
