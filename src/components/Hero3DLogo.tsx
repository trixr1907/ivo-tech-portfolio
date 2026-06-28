import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Points, Sprite,
  BufferGeometry, Float32BufferAttribute, SphereGeometry, CylinderGeometry,
  ExtrudeGeometry, TorusGeometry, EdgesGeometry,
  MeshStandardMaterial, MeshBasicMaterial, LineBasicMaterial,
  SpriteMaterial, PointsMaterial,
  DirectionalLight, PointLight, HemisphereLight,
  Color, Vector2, Vector3, Box3, CatmullRomCurve3,
  FogExp2, GridHelper, LineSegments, Clock, CanvasTexture,
  ACESFilmicToneMapping, SRGBColorSpace, AdditiveBlending, DoubleSide,
  MathUtils, Texture, Object3D, Material,
} from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

type Hero3DLogoProps = {
  fallbackSrc?: string
  alt?: string
}

type EnergyOrb = {
  mesh: Mesh<SphereGeometry, MeshBasicMaterial>
  phase: number
  offset: number
  scale: number
}

type LogoPulseMesh = Mesh<ExtrudeGeometry, MeshBasicMaterial> & {
  userData: {
    baseScale: number
    baseZ: number
    phase: number
    pathIndex: number
    shapeIndex: number
  }
}

type SvgPoint = readonly [number, number]

const FALLBACK_SRC = '/brand/logos/ivo-tech-logo-master.svg'
const LOGO_SVG_URL = '/brand/logos/ivo-tech-logo-master.svg'
const VB_W = 980
const VB_H = 220
const SCALE = 1 / 185
const CX = VB_W / 2
const CY = VB_H / 2
const MAX_PIXEL_RATIO = 1.5

function supportsWebGL() {
  if (typeof document === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

    if (!gl) return false

    const highFloat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)
    const supported = Boolean(highFloat && highFloat.precision > 0)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return supported
  } catch {
    return false
  }
}

function svgPoint([x, y]: SvgPoint): [number, number] {
  return [(x - CX) * SCALE, -(y - CY) * SCALE]
}

function svgVector(point: SvgPoint, z = 0) {
  const [x, y] = svgPoint(point)
  return new Vector3(x, y, z)
}

function makeParticleField() {
  const particleGeometry = new BufferGeometry()
  const positions: number[] = []

  for (let index = 0; index < 170; index += 1) {
    const angle = index * 2.399963229728653
    const radius = 1.4 + (index % 29) * 0.072
    const band = (index % 13) - 6

    positions.push(
      Math.cos(angle) * radius,
      band * 0.076 + Math.sin(index * 0.37) * 0.14,
      -1.3 + Math.sin(angle * 0.7) * 0.72,
    )
  }

  particleGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

  return new Points(
    particleGeometry,
    new PointsMaterial({
      color: 0x7be7ff,
      size: 0.014,
      transparent: true,
      opacity: 0.34,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
}

function makeGlowSprite(color: number, scale: number, opacity: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 4, 128, 128, 128)
    gradient.addColorStop(0, `rgba(${(color >> 16) & 255},${(color >> 8) & 255},${color & 255},${opacity})`)
    gradient.addColorStop(0.38, `rgba(${(color >> 16) & 255},${(color >> 8) & 255},${color & 255},${opacity * 0.24})`)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  const material = new SpriteMaterial({
    map: texture,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  })
  const sprite = new Sprite(material)
  sprite.scale.set(scale, scale, 1)
  return sprite
}

function FallbackLogo({ src, alt }: { src: string; alt: string }) {
  return <img className="hv-emblem hero-3d-fallback-image" src={src} alt={alt} decoding="async" fetchPriority="high" />
}

export default function Hero3DLogo({ fallbackSrc = FALLBACK_SRC, alt = 'ivo-tech WebGL Logo' }: Hero3DLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [webglOk] = useState(supportsWebGL)
  const [webglFailed, setWebglFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const wrapper = wrapRef.current
    const canvas = canvasRef.current

    if (!wrapper || !canvas || reducedMotion || !webglOk || webglFailed) return undefined

    let frameId = 0
    let disposed = false

    const pointerTarget = new Vector2(0, 0)
    const pointerCurrent = new Vector2(0, 0)
    const dragRotation = new Vector2(0, 0)
    const dragTarget = new Vector2(0, 0)
    let dragging = false
    let lastPointerX = 0
    let lastPointerY = 0

    let scrollTarget = window.scrollY
    let scrollCurrent = window.scrollY
    const vh = window.innerHeight

    const scene = new Scene()
    scene.fog = new FogExp2(0x05070b, 0.028)

    const camera = new PerspectiveCamera(30, 1, 0.1, 80)
    camera.position.set(0, 0.1, 7.8)

    let renderer: WebGLRenderer

    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      wrapper.dataset.webglFallback = 'true'
      queueMicrotask(() => {
        if (wrapRef.current === wrapper) setWebglFailed(true)
      })
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.34

    const root = new Group()
    root.rotation.x = MathUtils.degToRad(-6)
    root.rotation.y = MathUtils.degToRad(-12)
    root.rotation.z = MathUtils.degToRad(0.4)
    scene.add(root)

    const logoGroup = new Group()
    logoGroup.position.set(0, 0.04, 0.12)
    logoGroup.scale.setScalar(0.78)
    root.add(logoGroup)

    const glow = makeGlowSprite(0x00b7ff, 5.9, 0.72)
    glow.position.set(-1.95, -0.04, -0.58)
    root.add(glow)

    const rearGlow = makeGlowSprite(0x7be7ff, 3.7, 0.32)
    rearGlow.position.set(0.85, -0.02, -0.72)
    root.add(rearGlow)

    const loader = new SVGLoader()
    const logoMaterials: MeshStandardMaterial[] = []
    const cyanPulseMeshes: LogoPulseMesh[] = []
    const edgeLines: LineSegments<EdgesGeometry, LineBasicMaterial>[] = []

    const materialForColor = (styleColor: string) => {
      const normalized = styleColor.toLowerCase()
      const isCyan = normalized.includes('00b7ff') || normalized.includes('7be7ff')
      const isDark = normalized.includes('151b24') || normalized.includes('1b222c')
      const isBright = normalized.includes('e8edf3') || normalized.includes('eef3f8') || normalized.includes('dce6f2')
      const material = new MeshStandardMaterial({
        color: new Color(styleColor || '#dce6f2'),
        emissive: isCyan ? new Color(styleColor) : new Color(0x000000),
        emissiveIntensity: isCyan ? 1.75 : 0,
        metalness: isDark ? 0.88 : isBright ? 0.62 : 0.78,
        roughness: isDark ? 0.3 : isBright ? 0.12 : 0.16,
        side: DoubleSide,
      })
      logoMaterials.push(material)
      return material
    }

    loader.load(
      LOGO_SVG_URL,
      (data) => {
        if (disposed) return

        data.paths.forEach((path, pathIndex) => {
          const material = materialForColor(path.color.getStyle())
          const shapes = SVGLoader.createShapes(path)
          shapes.forEach((shape, shapeIndex) => {
            const isIcon = pathIndex < 9
            const isCyanPath =
              path.color.getHexString().toLowerCase() === '00b7ff' ||
              path.color.getHexString().toLowerCase() === '7be7ff'
            const isBrightPath = ['e8edf3', 'eef3f8', 'dce6f2', 'c8d0da'].includes(
              path.color.getHexString().toLowerCase(),
            )
            const geometry = new ExtrudeGeometry(shape, {
              depth: isIcon ? 18 : 8,
              bevelEnabled: true,
              bevelThickness: isIcon ? 3.1 : 1.45,
              bevelSize: isIcon ? 2.6 : 0.9,
              bevelSegments: 3,
              curveSegments: 10,
            })
            geometry.computeVertexNormals()
            const mesh = new Mesh(geometry, material)
            mesh.position.z = isIcon ? -13 : 0
            mesh.userData = { pathIndex, shapeIndex }
            logoGroup.add(mesh)

            if (isIcon || isBrightPath || isCyanPath) {
              const edgeGeometry = new EdgesGeometry(geometry, isIcon ? 18 : 26)
              const edgeMaterial = new LineBasicMaterial({
                color: isCyanPath ? 0x7be7ff : 0xffffff,
                transparent: true,
                opacity: isCyanPath ? 0.42 : 0.12,
                blending: AdditiveBlending,
                depthWrite: false,
              })
              const edges = new LineSegments(edgeGeometry, edgeMaterial)
              edges.position.copy(mesh.position)
              edgeLines.push(edges)
              logoGroup.add(edges)
            }

            if (isCyanPath || (isBrightPath && isIcon)) {
              const pulseGeometry = geometry.clone()
              const pulseMaterial = new MeshBasicMaterial({
                color: isCyanPath ? 0x7be7ff : 0xeef8ff,
                transparent: true,
                opacity: isCyanPath ? 0.24 : 0.115,
                blending: AdditiveBlending,
                depthWrite: false,
                side: DoubleSide,
              })
              const pulseMesh = new Mesh(pulseGeometry, pulseMaterial) as LogoPulseMesh
              pulseMesh.position.copy(mesh.position)
              pulseMesh.position.z += isIcon ? 2.2 : 1.1
              pulseMesh.userData = {
                baseScale: 1,
                baseZ: pulseMesh.position.z,
                phase: pathIndex * 0.72 + shapeIndex * 0.31,
                pathIndex,
                shapeIndex,
              }
              cyanPulseMeshes.push(pulseMesh)
              logoGroup.add(pulseMesh)
            }
          })
        })

        const box = new Box3().setFromObject(logoGroup)
        const center = new Vector3()
        const size = new Vector3()
        box.getCenter(center)
        box.getSize(size)
        logoGroup.children.forEach((child) => child.position.sub(center))
        logoGroup.scale.setScalar(2.72 / Math.max(size.x, 1))
        logoGroup.rotation.x = Math.PI
        logoGroup.position.set(-0.06, 0, 0.06)

        setLoading(false)
        wrapper.dataset.ready = 'true'
      },
      undefined,
      (err) => {
        console.error('Error loading svg logo:', err)
        if (!disposed) setWebglFailed(true)
      },
    )

    const energyPath: readonly SvgPoint[] = [
      [112, 44],
      [184, 128],
      [294, 64],
      [544, 108],
      [735, 94],
      [930, 126],
    ]
    const coreCurve = new CatmullRomCurve3(
      energyPath.map((point) => svgVector(point, 0.76)),
      false,
      'centripetal',
      0.28,
    )

    const sweepMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      blending: AdditiveBlending,
      depthWrite: false,
    })
    const sweepGlowMaterial = new MeshBasicMaterial({
      color: 0x00b7ff,
      transparent: true,
      opacity: 0.2,
      blending: AdditiveBlending,
      depthWrite: false,
    })
    const sweepBeam = new Mesh(new CylinderGeometry(0.01, 0.034, 1, 16, 1, true), sweepMaterial)
    const sweepHead = new Mesh(
      new SphereGeometry(0.062, 22, 14),
      new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.96,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    const sweepHalo = new Mesh(new SphereGeometry(0.18, 24, 14), sweepGlowMaterial)
    logoGroup.add(sweepBeam, sweepHead, sweepHalo)
    const sweepAxis = new Vector3(0, 1, 0)

    const energyOrbs: EnergyOrb[] = Array.from({ length: 10 }, (_, index) => {
      const material = new MeshBasicMaterial({
        color: index === 0 ? 0xffffff : 0x7be7ff,
        transparent: true,
        opacity: 1 - index * 0.075,
        blending: AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new Mesh(new SphereGeometry(0.052, 18, 12), material)
      logoGroup.add(mesh)
      return { mesh, phase: index * 0.026, offset: index * 0.018, scale: 1 - index * 0.052 }
    })

    const grid = new GridHelper(5.2, 24, 0x00b7ff, 0x153040)
    grid.position.y = -1.42
    grid.position.z = -0.9
    grid.rotation.x = MathUtils.degToRad(90)
    const gridMaterial = grid.material as Material
    gridMaterial.transparent = true
    gridMaterial.opacity = 0.08
    root.add(grid)

    const ringMaterial = new MeshBasicMaterial({
      color: 0x00b7ff,
      transparent: true,
      opacity: 0.18,
      blending: AdditiveBlending,
      depthWrite: false,
    })
    const ring = new Mesh(new TorusGeometry(2.5, 0.005, 8, 120), ringMaterial)
    ring.position.set(0.02, -0.04, -0.95)
    const ring2 = new Mesh(
      new TorusGeometry(1.92, 0.004, 8, 100),
      new MeshBasicMaterial({
        color: 0x7be7ff,
        transparent: true,
        opacity: 0.11,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    ring2.position.set(-0.05, -0.02, -1.05)
    root.add(ring, ring2)

    const particles = makeParticleField()
    scene.add(particles)

    scene.add(new HemisphereLight(0xbbe8ff, 0x020408, 1.2))

    const keyLight = new DirectionalLight(0xffffff, 2.7)
    keyLight.position.set(-3.8, 4.4, 6.4)
    scene.add(keyLight)

    const rim = new DirectionalLight(0x66d8ff, 3.4)
    rim.position.set(4.8, 1.6, 3.6)
    scene.add(rim)

    const blue = new PointLight(0x00b7ff, 8.4, 7.0, 1.72)
    blue.position.set(-1.8, 0.16, 1.25)
    scene.add(blue)

    const coreLight = new PointLight(0x7be7ff, 6.2, 5.0, 1.7)
    coreLight.position.set(0.72, 0.18, 1.1)
    root.add(coreLight)

    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const onScroll = () => {
      scrollTarget = window.scrollY
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect()
      pointerTarget.x = MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1)
      pointerTarget.y = MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1)

      if (!dragging) return
      const dx = event.clientX - lastPointerX
      const dy = event.clientY - lastPointerY
      dragTarget.x += dy * 0.006
      dragTarget.y += dx * 0.008
      dragTarget.x = MathUtils.clamp(dragTarget.x, -0.65, 0.65)
      lastPointerX = event.clientX
      lastPointerY = event.clientY
    }

    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      wrapper.setPointerCapture(event.pointerId)
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      wrapper.dataset.dragging = 'true'
    }

    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      wrapper.releasePointerCapture(event.pointerId)
      wrapper.removeAttribute('data-dragging')
    }

    const onPointerLeave = () => {
      pointerTarget.set(0, 0)
      dragging = false
      wrapper.removeAttribute('data-dragging')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    wrapper.addEventListener('pointermove', onPointerMove, { passive: true })
    wrapper.addEventListener('pointerdown', onPointerDown)
    wrapper.addEventListener('pointerup', onPointerUp)
    wrapper.addEventListener('pointerleave', onPointerLeave)

    const observer = new ResizeObserver(resize)
    observer.observe(wrapper)
    resize()

    const clock = new Clock()
    const sweepPoint = new Vector3()
    const sweepTangent = new Vector3()
    const runnerPoint = new Vector3()

    const animate = () => {
      if (disposed) return

      const time = clock.getElapsedTime()
      pointerCurrent.lerp(pointerTarget, 0.075)
      dragRotation.lerp(dragTarget, 0.09)

      scrollCurrent += (scrollTarget - scrollCurrent) * 0.05
      const scrollProgress = Math.min(scrollCurrent / (vh * 1.5), 1.0)

      root.rotation.y =
        MathUtils.degToRad(-10) +
        Math.sin(time * 0.35) * 0.045 +
        pointerCurrent.x * 0.13 +
        dragRotation.y +
        scrollProgress * Math.PI * 0.38
      root.rotation.x =
        MathUtils.degToRad(-6) +
        Math.sin(time * 0.27) * 0.02 -
        pointerCurrent.y * 0.078 +
        dragRotation.x +
        scrollProgress * 0.14
      root.rotation.z = MathUtils.degToRad(0.4) + pointerCurrent.x * 0.016

      camera.position.z = 7.8 + scrollProgress * 1.25
      camera.position.y = 0.1 - scrollProgress * 0.26

      logoGroup.position.y = Math.sin(time * 0.72) * 0.024
      logoGroup.position.z = 0.06 + Math.sin(time * 0.48) * 0.018

      particles.rotation.y = time * 0.026
      particles.rotation.x = Math.sin(time * 0.17) * 0.075
      ring.rotation.z = time * 0.15
      ring2.rotation.z = -time * 0.105

      blue.intensity = 8.1 + Math.sin(time * 1.55) * 0.95
      coreLight.intensity = 5.8 + Math.sin(time * 2.35) * 1.15
      glow.material.opacity = 0.68 + Math.sin(time * 1.35) * 0.1
      rearGlow.material.opacity = 0.3 + Math.sin(time * 1.7) * 0.055

      logoMaterials.forEach((material) => {
        if (material.emissiveIntensity > 0) {
          material.emissiveIntensity = 1.2 + Math.sin(time * 1.8) * 0.24 + scrollProgress * 0.62
        }
      })

      cyanPulseMeshes.forEach((mesh, index) => {
        const pulse = 0.5 + Math.sin(time * 2.6 + mesh.userData.phase) * 0.5
        const scale = 1 + pulse * (mesh.userData.pathIndex < 9 ? 0.012 : 0.006)
        mesh.scale.setScalar(scale)
        mesh.position.z = mesh.userData.baseZ + Math.sin(time * 1.9 + index * 0.37) * 0.018
        mesh.material.opacity =
          (mesh.userData.pathIndex < 9 ? 0.09 : 0.14) + pulse * (mesh.userData.pathIndex < 9 ? 0.14 : 0.18)
      })

      edgeLines.forEach((line, index) => {
        line.material.opacity = (index % 3 === 0 ? 0.16 : 0.09) + Math.sin(time * 1.7 + index * 0.21) * 0.035
      })

      const sweepProgress = (time * 0.3) % 1
      coreCurve.getTangentAt(sweepProgress, sweepTangent).normalize()
      coreCurve.getPointAt(sweepProgress, sweepPoint)
      sweepBeam.position.copy(sweepPoint).addScaledVector(sweepTangent, -0.17)
      sweepBeam.quaternion.setFromUnitVectors(sweepAxis, sweepTangent)
      sweepBeam.scale.set(1, 0.42, 1)
      sweepHead.position.copy(sweepPoint).addScaledVector(sweepTangent, 0.06)
      sweepHalo.position.copy(sweepHead.position)

      sweepMaterial.opacity = 0.64 + Math.sin(time * 10.5) * 0.16
      sweepGlowMaterial.opacity = 0.15 + Math.sin(time * 7.5) * 0.05

      energyOrbs.forEach((orb, index) => {
        const progress = (time * 0.26 + orb.phase) % 1
        coreCurve.getPointAt((progress + orb.offset) % 1, runnerPoint)
        orb.mesh.position.copy(runnerPoint)
        const pulse = 0.75 + Math.sin(time * 6.4 - index * 0.62) * 0.25
        const scale = orb.scale * pulse * (index === 0 ? 1.38 : 1)
        orb.mesh.scale.setScalar(scale)
        orb.mesh.material.opacity = Math.max(0.08, (1 - index * 0.085) * (0.7 + pulse * 0.35))
      })

      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }

    animate()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      wrapper.removeEventListener('pointermove', onPointerMove)
      wrapper.removeEventListener('pointerdown', onPointerDown)
      wrapper.removeEventListener('pointerup', onPointerUp)
      wrapper.removeEventListener('pointerleave', onPointerLeave)
      wrapper.removeAttribute('data-ready')
      wrapper.removeAttribute('data-webgl-fallback')
      wrapper.removeAttribute('data-dragging')

      scene.traverse((object) => {
        const disposable = object as Object3D & {
          geometry?: BufferGeometry
          material?: Material | Material[]
        }

        disposable.geometry?.dispose()
        if (disposable.material) {
          const materials = Array.isArray(disposable.material) ? disposable.material : [disposable.material]
          materials.forEach((material) => {
            if ('map' in material && material.map instanceof Texture) material.map.dispose()
            material.dispose()
          })
        }
      })

      renderer.dispose()
      renderer.forceContextLoss()
    }
  }, [reducedMotion, webglOk, webglFailed])

  if (reducedMotion || !webglOk || webglFailed) {
    return <FallbackLogo src={fallbackSrc} alt={alt} />
  }

  return (
    <div className="hero-3d-logo" ref={wrapRef} role="img" aria-label={alt}>
      {loading && <FallbackLogo src={fallbackSrc} alt={alt} />}
      <canvas className="hero-3d-canvas" ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
