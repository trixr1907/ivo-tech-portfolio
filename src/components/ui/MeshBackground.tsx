import { useRef, useEffect } from 'react'
import { useReducedMotion } from 'motion/react'

const HERO_3D_FALLBACK_SRC = '/brand/logos/ivo-tech-logo-master.svg'

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const orbs = [
      { ox: 0.72, oy: 0.08, r: 0.38, c: '#00B7FF', a: 0.12 },
      { ox: 0.08, oy: 0.26, r: 0.32, c: '#7BE7FF', a: 0.07 },
      { ox: 0.5, oy: 0.88, r: 0.28, c: '#006DCC', a: 0.09 },
    ]

    const draw = () => {
      t += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      orbs.forEach((o, i) => {
        const px = (o.ox + Math.sin(t + i * 1.4) * 0.06 + mx * 0.04) * canvas.width
        const py = (o.oy + Math.cos(t * 0.7 + i) * 0.05 + my * 0.03) * canvas.height
        const r = o.r * Math.min(canvas.width, canvas.height)
        const g = ctx.createRadialGradient(px, py, 0, px, py, r)
        const hex = o.c
        g.addColorStop(
          0,
          hex +
            Math.round(o.a * 255)
              .toString(16)
              .padStart(2, '0'),
        )
        g.addColorStop(1, hex + '00')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      // Mouse halo
      const mx2 = mx * canvas.width
      const my2 = my * canvas.height
      const halo = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, 280)
      halo.addColorStop(0, 'rgba(0,183,255,0.07)')
      halo.addColorStop(1, 'rgba(0,183,255,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className="mesh-canvas" aria-hidden="true" />
}

export { HERO_3D_FALLBACK_SRC }
