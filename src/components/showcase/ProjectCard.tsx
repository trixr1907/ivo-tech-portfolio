import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../data/projects'

type ProjectCardProps = {
  project: Project
  index: number
  onOpen: (project: Project) => void
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const visibleTags = project.tags.slice(0, 4)
  const isPrimary = project.id === 'goals-optimizer'

  return (
    <article
      id={`project-${project.id}`}
      className={`project-card relaunch-project-card${isPrimary ? ' relaunch-project-card--primary' : ''}`}
    >
      <button type="button" className="project-card__button" onClick={() => onOpen(project)}>
        <span className="project-card__media">
          <img
            src={project.cover}
            alt={`${project.title} — Produktansicht`}
            width={1440}
            height={project.id === 'dld-3d-configurator' ? 2337 : project.id === 'event-hub' ? 577 : 900}
            sizes="(max-width: 760px) 100vw, 50vw"
            loading="eager"
            fetchPriority={index === 1 ? 'high' : 'auto'}
            decoding="async"
          />
          <span className="project-card__index">0{index}</span>
          <span className="project-card__status">{isPrimary ? 'Primärer Case' : 'Case Study'}</span>
        </span>
        <span className="project-card__body">
          <span className="project-card__eyebrow">{project.facts[2]?.value ?? 'Selected Work'}</span>
          <span className="project-card__title">{project.title}</span>
          <span className="project-card__problem">{project.problem}</span>
          <span className="project-card__facts" aria-label="Projektkurzprofil">
            {project.facts.slice(0, 2).map((fact) => (
              <span key={fact.label}><strong>{fact.label}</strong>{fact.value}</span>
            ))}
          </span>
          <span className="project-card__tags" aria-label="Technologien">
            {visibleTags.map((tag) => <span key={tag}>{tag}</span>)}
          </span>
          <span className="project-card__cta">Case öffnen <ArrowUpRight size={15} aria-hidden="true" /></span>
        </span>
      </button>
    </article>
  )
}
