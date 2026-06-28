import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '../ui/Reveal'
import type { LabItem } from '../../data/homeData'

export function LabCard({ item, index }: { item: LabItem; index: number }) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  return (
    <Reveal delay={index * 0.07}>
      <article
        className={`lab-card ${hovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`${item.title}: ${item.text}`}
      >
        <div className="lc-aura" aria-hidden="true" />
        <div className="lc-num">{item.num}</div>
        <div className="lc-icon">
          <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="lc-tag">{item.tag}</div>
        <h3 className="lc-title">{item.title}</h3>
        <p className="lc-kicker">{item.kicker}</p>
        <p className="lc-text">{item.text}</p>
        <div className="lc-arrow">
          <ArrowUpRight size={16} aria-hidden="true" />
        </div>
        <motion.div
          className="lc-shine"
          animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: '100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </article>
    </Reveal>
  )
}
