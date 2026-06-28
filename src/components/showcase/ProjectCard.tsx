import type { Project } from '../../data/projects'

type ProjectCardProps = {
  project: Project
  onOpen: (project: Project) => void
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const visibleTags = project.tags.slice(0, 7)
  const isLabPrototype = project.status === 'lab-prototype'

  return (
    <article className="project-card">
      <button
        type="button"
        className="project-card__button"
        onClick={() => onOpen(project)}
      >
        <span className="project-card__media">
          <img src={project.cover} alt={`${project.title} — Vorschau`} loading="lazy" decoding="async" />
          <span className={`project-card__status ${isLabPrototype ? 'project-card__status--lab' : ''}`}>
            {isLabPrototype ? 'Lab Prototype' : 'Case Study'}
          </span>
        </span>
        <span className="project-card__body">
          <span className="project-card__eyebrow">Selected Work</span>
          <span className="project-card__title">{project.title}</span>
          <span className="project-card__tagline">{project.tagline}</span>
          <span className="project-card__tags" aria-label="Technologien">
            {visibleTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>
          <span className="project-card__cta" aria-hidden="true">
            Case öffnen <span>↗</span>
          </span>
        </span>
      </button>
    </article>
  )
}
