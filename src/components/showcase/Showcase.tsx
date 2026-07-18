import { useState } from 'react'
import { projects, type Project } from '../../data/projects'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import { SectionTitle } from '../ui/SectionTitle'
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
          <SectionTitle id="showcase-h" lines={[{ text: 'Projekte mit echter Produkt-Tiefe.' }]} />
          <p>
            Drei Cases mit echter Produkt-Tiefe: GOALS Optimizer (Live Squad/Fit/Formation),
            Event Hub mit Supabase-RLS und DLD 3D-Konfigurator mit Docker-Slicer und Live-Preislogik.
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
