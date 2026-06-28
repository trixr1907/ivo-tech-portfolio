import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Cpu,
  Home,
  Terminal,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  Network,
  Layers,
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
    text: 'Infrastruktur, Automationen, Dashboards — nicht als Business, sondern weil es Spaß macht.',
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
    text: 'Kleine Tools, Websites, Interfaces und Prototypen — um etwas zu lernen oder eine Idee sichtbar zu machen.',
    tag: 'Dev',
  },
]

export const craftPrinciples = [
  { icon: Sparkles, label: 'Craft', text: 'Interfaces mit eigener Atmosphäre statt generischer Template-Optik.' },
  { icon: ShieldCheck, label: 'Systems', text: 'Setups, die nachvollziehbar, wartbar und real nutzbar bleiben.' },
  { icon: Zap, label: 'Motion', text: 'Motion als Feedback und Storytelling — nicht als Dekoration.' },
]

export const signalCards = [
  {
    icon: Activity,
    label: 'Live tinkering',
    value: 'Tool workflows',
    text: 'Lokale Modelle, Automation und Tooling als reales Arbeitssetup — nicht Demo-Folie.',
  },
  {
    icon: Network,
    label: 'Infrastructure',
    value: 'Homelab layer',
    text: 'Proxmox, Home Assistant, Docker und Monitoring als privates Nervensystem.',
  },
  {
    icon: Layers,
    label: 'Identity',
    value: 'Brand system',
    text: 'Logo, 3D, Motion, Social und Web aus einem konsistenten visuellen Kern.',
  },
]

export const timeline = [
  {
    year: '01',
    title: 'Experiment',
    text: 'Ideen schnell sichtbar machen: kleine Tools, Interfaces, Automationen und Brand-Assets.',
  },
  {
    year: '02',
    title: 'System',
    text: 'Wenn etwas funktioniert, wird es strukturiert: Tokens, Komponenten, Routing, Tests.',
  },
  {
    year: '03',
    title: 'Polish',
    text: 'Die letzte Schicht entscheidet: Motion, Rhythmus, Kontrast, Details, Performance.',
  },
]

export const marqueeTop = [
  'Automation',
  'Homelab',
  'Smart Home',
  'React',
  'TypeScript',
  'Motion Design',
  'Three.js',
  'WebGL',
  'Local LLMs',
  'Docker',
  'Proxmox',
]

export const marqueeBottom = [
  'ivo-tech',
  'Mannheim',
  'Brand System',
  'Precision Design',
  'Hobby Lab',
  'Cyan Signal',
  'Electric Blue',
  'Dark-First',
]
