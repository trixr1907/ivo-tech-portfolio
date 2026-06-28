export function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items]

  return (
    <div className="marquee-wrapper" aria-hidden="true">
      <div className={`marquee-track${reverse ? ' reverse' : ''}`}>
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="mq-sep" aria-hidden="true">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
