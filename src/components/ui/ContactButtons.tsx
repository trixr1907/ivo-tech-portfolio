import { useState, useCallback } from 'react'
import { ArrowUpRight, Copy, Check } from 'lucide-react'
import { MagButton } from './MagButton'

export function ContactButtons({
  onNavigate,
}: {
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, hash: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('contact@ivo-tech.com')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Konnte E-Mail nicht kopieren:', err)
    }
  }, [])

  return (
    <div className="hero-ctas-wrap">
      <MagButton
        className="btn-primary"
        href="#selected-work"
        onClick={(event) => onNavigate(event, '#selected-work')}
      >
        Projekte ansehen <ArrowUpRight size={16} />
      </MagButton>
      
      <div className="contact-group">
        <MagButton className="btn-ghost" href="mailto:contact@ivo-tech.com">
          Kontakt aufnehmen
        </MagButton>
        <button
          className="btn-copy"
          onClick={copyEmail}
          aria-label="E-Mail kopieren"
          title="E-Mail kopieren"
        >
          {copied ? <Check size={16} className="text-green" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}
