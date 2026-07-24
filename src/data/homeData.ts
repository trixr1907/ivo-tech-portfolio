import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Cpu,
  Home,
  Terminal,
} from 'lucide-react'

export interface LabItem {
  icon: LucideIcon
  num: string
  title: string
  kicker: string
  text: string
  tag: string
}

export const labItems: LabItem[] = [
  {
    icon: Bot,
    num: '01',
    title: 'Automation & lokale Modelle',
    kicker: 'Local tooling · Routing · Workflows',
    text: 'Automations-Setups, lokale Modelle und Tooling — Technik praktisch im Alltag nutzbar machen.',
    tag: 'Lab',
  },
  {
    icon: Home,
    num: '02',
    title: 'Homelab & Smart Home',
    kicker: 'Proxmox · Home Assistant · Docker',
    text: 'Eigenbetriebene Infrastruktur für Automatisierung, Monitoring und lokale Dienste.',
    tag: 'Lab',
  },
  {
    icon: Cpu,
    num: '03',
    title: '3D & Motion Craft',
    kicker: 'Logo · WebGL · Reveal Intros',
    text: 'Das ivo-tech Brand-System: Logo-Design, 3D-Assets, Motion-Reveals und Web-Visuals.',
    tag: 'Visual',
  },
  {
    icon: Terminal,
    num: '04',
    title: 'Websites & Tools',
    kicker: 'React · TypeScript · UI Craft',
    text: 'Kleine Werkzeuge, Websites und Prototypen, die konkrete Abläufe vereinfachen oder Produktideen überprüfbar machen.',
    tag: 'Dev',
  },
]
