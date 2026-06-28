export function LazySectionFallback({ label }: { label: string }) {
  return (
    <section className="section lazy-section-fallback" aria-label={`${label} lädt`}>
      <div className="section-inner">
        <div className="lazy-section-card">
          <span className="sec-label">{label}</span>
          <div className="lazy-section-line" />
        </div>
      </div>
    </section>
  )
}
