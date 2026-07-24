import { useState } from 'react'
import { projects, type Project } from '../../data/projects'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import { SectionTitle } from '../ui/SectionTitle'
import './showcase.css'

export function Showcase() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  return (
    <section id="selected-work" className="section showcase-section relaunch-showcase" aria-labelledby="showcase-heading">
      <div className="relaunch-shell">
        <div className="showcase-head relaunch-section-head">
          <div className="relaunch-kicker-row">
            <span className="relaunch-kicker">Selected Work</span>
            <span className="relaunch-index">— 02</span>
          </div>
          <SectionTitle id="showcase-heading" lines={[{ text: 'Drei Systeme.' }, { text: 'Echte Produkt-Tiefe.', em: true }]} />
          <p className="relaunch-lead">
            Keine Konzept-Screens, sondern Anwendungen mit echter Logik, belastbaren Entscheidungen und produktionsnaher Qualität — von Next.js bis WordPress, von RLS bis Three.js.
          </p>
        </div>

        <div className="showcase-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index + 1} onOpen={setActiveProject} />
          ))}
        </div>
      </div>

      {activeProject ? <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} /> : null}
    </section>
  )
}
