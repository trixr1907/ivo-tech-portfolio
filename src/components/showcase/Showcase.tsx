import { useState } from 'react'
import { projects, type Project } from '../../data/projects'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import './showcase.css'

export function Showcase() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  return (
    <section id="selected-work" className="section showcase-section" aria-labelledby="showcase-h">
      <div className="section-inner">
        <div className="showcase-head">
          <div>
            <span className="sec-label">Selected Work</span>
            <span className="sec-num">— 03</span>
          </div>
          <h2 id="showcase-h">Projekte mit echter Produkt-Tiefe.</h2>
          <p>
            Zwei Projekte mit echter Produkt-Tiefe: ein Full-Stack Event-Hub mit Supabase-RLS und
            ein 3D-Druck-Konfigurator mit Docker-Slicer-Integration und Live-Preislogik.
          </p>
        </div>

        <div className="showcase-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setActiveProject} />
          ))}
        </div>
      </div>

      {activeProject ? <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} /> : null}
    </section>
  )
}
