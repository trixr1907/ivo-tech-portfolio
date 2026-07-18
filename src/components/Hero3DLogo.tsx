import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh,
  MeshPhysicalMaterial, MeshStandardMaterial,
  DirectionalLight, AmbientLight, HemisphereLight, RectAreaLight,
  Vector2, Vector3, Box3, Color, PMREMGenerator,
  MathUtils, BufferGeometry,
  ACESFilmicToneMapping, SRGBColorSpace, AdditiveBlending,
  Float32BufferAttribute, Points, PointsMaterial
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

type Hero3DLogoProps = {
  fallbackSrc?: string
  alt?: string
}

const LOGO_GLB_URL = '/brand/3d/ivo-tech-logo-icon-3d-master.glb'

function supportsWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

// Minimalistic ambient dust field to replace the heavy particle rings
function createDustField() {
  const geo = new BufferGeometry()
  const pos = []
  for (let i = 0; i < 80; i++) {
    pos.push(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4 - 2
    )
  }
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  const mat = new PointsMaterial({
    color: 0x7be7ff,
    size: 0.015,
    transparent: true,
    opacity: 0.4,
    blending: AdditiveBlending,
    depthWrite: false
  })
  return new Points(geo, mat)
}


/** Keep multi-material brand facets; only boost cyan + lift silver so the mark reads. */
function enhanceBrandMaterials(root: Group) {
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return

    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const raw of list) {
      if (!(raw instanceof MeshStandardMaterial || raw instanceof MeshPhysicalMaterial)) continue
      const mat = raw as MeshPhysicalMaterial
      const name = (mat.name || '').toLowerCase()

      if (
        name.includes('cyan') ||
        name.includes('ice') ||
        name.includes('energy') ||
        name.includes('glass')
      ) {
        // Brand core — emissive cyan so the right wing always reads
        mat.color.set(0x00b7ff)
        mat.emissive = new Color(0x00b7ff)
        mat.emissiveIntensity = 1.85
        mat.metalness = 0
        mat.roughness = 0.12
        mat.transparent = false
        mat.opacity = 1
        if ('clearcoat' in mat) mat.clearcoat = 0.15
        if ('transmission' in mat) mat.transmission = 0
        mat.envMapIntensity = 0.25
      } else if (name.includes('black') || name.includes('recess')) {
        // Deep folds — keep contrast, not pure void
        mat.color.set(0x121820)
        mat.metalness = 0.85
        mat.roughness = 0.42
        if ('clearcoat' in mat) mat.clearcoat = 0
        mat.envMapIntensity = 0.15
        mat.emissiveIntensity = 0
      } else if (name.includes('dark') || name.includes('fold') || name.includes('smoked')) {
        mat.color.set(0x4a5563)
        mat.metalness = 0.82
        mat.roughness = 0.34
        if ('clearcoat' in mat) mat.clearcoat = 0
        mat.envMapIntensity = 0.4
      } else {
        // Silver / chrome facets — need front light + soft env to read as metal
        mat.color.set(0xe8eef6)
        mat.metalness = 0.88
        mat.roughness = 0.28
        if ('clearcoat' in mat) mat.clearcoat = 0.08
        mat.envMapIntensity = 0.65
        mat.emissiveIntensity = 0
      }
      mat.needsUpdate = true
    }

    // Floating hero mark — shadows add cost without brand value
    mesh.castShadow = false
    mesh.receiveShadow = false
  })
}

export default function Hero3DLogo({ fallbackSrc, alt = 'ivo-tech WebGL Logo' }: Hero3DLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [webglOk] = useState(supportsWebGL)
  const [webglFailed, setWebglFailed] = useState(false)
  const [showDragHint, setShowDragHint] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const wrapper = wrapRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas || reducedMotion || !webglOk || webglFailed) {
      return undefined
    }

    let frameId = 0
    let disposed = false

    // SOTA Renderer Setup
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'highp',
        preserveDrawingBuffer: true,
      })
    } catch (e) {
      console.error("WebGL Setup Failed:", e)
      queueMicrotask(() => {
        if (wrapRef.current === wrapper) setWebglFailed(true)
      })
      return undefined
    }

    // Bump pixel ratio up to 2 for crispness, but cap it so 4K monitors don't melt
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.32
    renderer.shadowMap.enabled = false

    const scene = new Scene()
    const camera = new PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 15) // Move camera back so we don't clip the depth

    // Base Assembly Group
    const root = new Group()
    // Initial hero stance
    root.rotation.x = MathUtils.degToRad(-6)
    root.rotation.y = MathUtils.degToRad(-22)  // cyan right-wing toward camera
    root.rotation.z = MathUtils.degToRad(2)
    scene.add(root)

    const logoGroup = new Group()
    root.add(logoGroup)

    // Soft studio env — chrome facets need reflections; keep intensity low (no white-out)
    const pmrem = new PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    // r163+: scales all material env reflections without white-out
    if ('environmentIntensity' in scene) {
      ;(scene as Scene & { environmentIntensity: number }).environmentIntensity = 0.28
    }
    pmrem.dispose()

    // Readable brand lighting: front key + soft fill + cyan rim (not pure stealth blackout)
    const ambient = new AmbientLight(0x2a3a50, 0.75)
    scene.add(ambient)

    const hemi = new HemisphereLight(0xa8d8ff, 0x101820, 0.85)
    scene.add(hemi)

    // Front key — silver facets must catch light or brand dies
    const keyLight = new DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(-3.2, 4.2, 9.5)
    scene.add(keyLight)

    // Soft fill from right (cyan wing side)
    const fillLight = new DirectionalLight(0x7be7ff, 0.55)
    fillLight.position.set(5.5, 1.5, 6)
    scene.add(fillLight)

    // Cyan rim from back-right — silhouette without crushing front faces
    const backLight = new DirectionalLight(0x00b7ff, 2.1)
    backLight.position.set(4.5, 3.5, -9)
    scene.add(backLight)

    RectAreaLightUniformsLib.init()
    const rimLight = new RectAreaLight(0x00b7ff, 5.5, 9, 2.2)
    rimLight.position.set(-2.5, -1.5, -3)
    rimLight.lookAt(0, 0, 0)
    scene.add(rimLight)

    const dust = createDustField()
    root.add(dust)

    const loader = new GLTFLoader()
    loader.load(LOGO_GLB_URL, (gltf) => {
      if (disposed) return
      const model = gltf.scene
      // CRITICAL: keep multi-material brand facets (silver left / cyan right)
      enhanceBrandMaterials(model)
      const matNames: string[] = []
      model.traverse((o) => {
        const m = o as Mesh
        if (!m.isMesh) return
        const mats = Array.isArray(m.material) ? m.material : [m.material]
        for (const mat of mats) {
          if (mat && 'name' in mat) matNames.push(String((mat as { name?: string }).name || '(unnamed)'))
        }
      })
      wrapper.dataset.mats = matNames.join('|')
      logoGroup.add(model)
      const box = new Box3().setFromObject(model)
      const center = new Vector3()
      const size = new Vector3()
      box.getCenter(center); box.getSize(size)
      model.position.sub(center)
      // Slightly larger so mark dominates hero stage
      logoGroup.scale.setScalar(7.4 / Math.max(size.x, size.y, size.z, 1))
      setLoading(false)
      // One-shot interaction hint; auto-hide if unused
      const hintTimer = window.setTimeout(() => {
        if (wrapRef.current === wrapper) setShowDragHint(false)
      }, 4200)
      ;(wrapper as HTMLElement & { __hintTimer?: number }).__hintTimer = hintTimer; wrapper.dataset.ready = 'true'
    }, undefined, () => setWebglFailed(true))

    // SOTA Interactive Drag & Inertia (Spring Physics Feel)
    let isDragging = false
    const targetRotation = new Vector2(root.rotation.y, root.rotation.x)
    const currentRotation = new Vector2(root.rotation.y, root.rotation.x)
    
    // Inertia variables
    const pointerDelta = new Vector2()
    const lastPointer = new Vector2()

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      lastPointer.set(e.clientX, e.clientY)
      pointerDelta.set(0, 0)
      wrapper.setPointerCapture(e.pointerId)
      wrapper.style.cursor = 'grabbing'
      setShowDragHint(false)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - lastPointer.x
      const dy = e.clientY - lastPointer.y
      
      pointerDelta.set(dx, dy)
      targetRotation.x += dx * 0.008
      targetRotation.y += dy * 0.008
      
      // Clamp vertical rotation so it doesn't flip upside down
      targetRotation.y = MathUtils.clamp(targetRotation.y, -0.6, 0.4)
      
      lastPointer.set(e.clientX, e.clientY)
    }

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false
      wrapper.releasePointerCapture(e.pointerId)
      wrapper.style.cursor = 'grab'
      
      // Apply remaining inertia to target
      targetRotation.x += pointerDelta.x * 0.05
      targetRotation.y += pointerDelta.y * 0.05
    }

    wrapper.style.cursor = 'grab'
    wrapper.addEventListener('pointerdown', onPointerDown)
    wrapper.addEventListener('pointermove', onPointerMove)
    wrapper.addEventListener('pointerup', onPointerUp)
    wrapper.addEventListener('pointerleave', onPointerUp)

    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      camera.aspect = rect.width / rect.height
      camera.updateProjectionMatrix()
      renderer.setSize(rect.width, rect.height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(wrapper)
    resize()

    const animate = () => {
      frameId = requestAnimationFrame(animate)

      // Smooth Spring interpolation (lerp)
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08

      root.rotation.y = currentRotation.x
      root.rotation.x = currentRotation.y

      // Very subtle idle floating when not dragging
      if (!isDragging) {
        const time = performance.now() * 0.001
        targetRotation.x += Math.sin(time * 0.5) * 0.0003
        targetRotation.y += Math.cos(time * 0.4) * 0.0002
      }

      // Rotate dust slowly
      dust.rotation.y += 0.001
      dust.rotation.x += 0.0005

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      const ht = (wrapper as HTMLElement & { __hintTimer?: number }).__hintTimer
      if (ht) window.clearTimeout(ht)
      observer.disconnect()
      wrapper.removeEventListener('pointerdown', onPointerDown)
      wrapper.removeEventListener('pointermove', onPointerMove)
      wrapper.removeEventListener('pointerup', onPointerUp)
      wrapper.removeEventListener('pointerleave', onPointerUp)

      // Brutal memory leak prevention (dispose everything)
      scene.traverse((obj) => {
        const mesh = obj as Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose())
          } else {
            mesh.material.dispose()
          }
        }
      })
      renderer.dispose()
    }
  }, [reducedMotion, webglOk, webglFailed])

  if (!webglOk || webglFailed || reducedMotion) {
    return <img className="hv-emblem hero-3d-fallback-image" src={fallbackSrc} alt={alt} />
  }

  return (
    <div ref={wrapRef} className="hero-3d-logo" role="img" aria-label={alt} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className={`hero-3d-canvas ${loading ? 'loading' : 'ready'}`}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        aria-hidden="true"
      />
      {!loading && showDragHint ? (
        <span className="hero-3d-drag-hint" aria-hidden="true">
          Ziehen
        </span>
      ) : null}
    </div>
  )
}
