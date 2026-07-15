import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, EdgesGeometry,
  MeshStandardMaterial, MeshPhysicalMaterial, LineBasicMaterial,
  DirectionalLight, AmbientLight, RectAreaLight,
  Color, Vector2, Vector3, Box3, ExtrudeGeometry,
  MathUtils, BufferGeometry, PCFSoftShadowMap,
  ACESFilmicToneMapping, SRGBColorSpace, AdditiveBlending,
  Float32BufferAttribute, Points, PointsMaterial, LineSegments, PMREMGenerator
} from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

type Hero3DLogoProps = {
  fallbackSrc?: string
  alt?: string
}

const LOGO_SVG_URL = '/brand/logos/ivo-tech-logo-master.svg'

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

export default function Hero3DLogo({ fallbackSrc, alt = 'ivo-tech WebGL Logo' }: Hero3DLogoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [webglOk] = useState(supportsWebGL)
  const [webglFailed, setWebglFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const wrapper = wrapRef.current
    const canvas = canvasRef.current
    console.log('[Hero3DLogo] effect running', { hasWrapper: !!wrapper, hasCanvas: !!canvas, reducedMotion, webglOk, webglFailed })
    if (!wrapper || !canvas || reducedMotion || !webglOk || webglFailed) {
      console.log('[Hero3DLogo] EARLY RETURN - one of the guards failed')
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
        precision: 'highp'
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
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap

    // CRITICAL for SOTA metallic materials: they need an environment to reflect, otherwise they look like muddy plastic
    // Room Environment for soft subtle reflections on satin
    const pmremGenerator = new PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    const scene = new Scene()
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    const camera = new PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 15) // Move camera back so we don't clip the depth

    // Base Assembly Group
    const root = new Group()
    // Initial hero stance
    root.rotation.x = MathUtils.degToRad(-8)
    root.rotation.y = MathUtils.degToRad(-15)
    root.rotation.z = MathUtils.degToRad(1)
    scene.add(root)

    const logoGroup = new Group()
    root.add(logoGroup)

    // SOTA Lighting (Satin/Matte Setup)
    const ambient = new AmbientLight(0xffffff, 0.6) // Neutral soft ambient
    scene.add(ambient)

    // Soft Key Light from top-left (illuminates the front face gently)
    const keyLight = new DirectionalLight(0xffffff, 1.2)
    keyLight.position.set(-2, 5, 8)
    scene.add(keyLight)

    // Soft Cyan Fill Light from bottom-right to bring out the dark corners
    const fillLight = new DirectionalLight(0x00b7ff, 1.5)
    fillLight.position.set(4, -2, 4)
    scene.add(fillLight)

    // Intense Back/Rim Light - CRITICAL for separating from the background
    const backLight = new DirectionalLight(0x7be7ff, 4.0)
    backLight.position.set(5, 5, -10)
    scene.add(backLight)

    // Required for RectAreaLights
    RectAreaLightUniformsLib.init()

    // Neon Rim Tube from bottom left, creates long beautiful specular streaks on the edges
    const rimLight = new RectAreaLight(0x00b7ff, 12.0, 10, 2)
    rimLight.position.set(-3, -2, -2)
    rimLight.lookAt(0, 0, 0)
    scene.add(rimLight)

    const dust = createDustField()
    root.add(dust)

    // Loading & Parsing SVG
    const loader = new SVGLoader()
    console.log('[Hero3DLogo] Starting SVG load from', LOGO_SVG_URL)
    loader.load(LOGO_SVG_URL, (data) => {
      console.log('[Hero3DLogo] SVG loaded, paths:', data.paths.length)
      if (disposed) return

      data.paths.forEach((path, pathIndex) => {
        const hexColor = path.color.getHexString().toLowerCase()
        const isCyan = hexColor === '00b7ff' || hexColor === '7be7ff'
        const isDark = hexColor === '151b24' || hexColor === '1b222c' || hexColor === '0b111c'
        const isIcon = pathIndex < 9 // The Origami mark

        // SOTA Materials: Premium Matte/Satin Finish (avoiding blown out mirror reflections)
        let material
        if (isCyan) {
          // Emissive / Glowing Cyan
          material = new MeshStandardMaterial({
            color: new Color(0x7be7ff),
            emissive: new Color(0x00b7ff),
            emissiveIntensity: 1.2,
            roughness: 0.2,
            metalness: 0.1 // Less metallic so the neon cyan stays pure
          })
        } else if (isDark) {
          // Premium Dark Satin Obsidian
          material = new MeshPhysicalMaterial({
            color: new Color(0x0b131e), // Very dark blue/grey, not pure black
            roughness: 0.45, // Much rougher! This stops the mirror effect that causes the white blowout
            metalness: 0.7, // Solid metal core
            clearcoat: 0.0, // REMOVED the clearcoat which was acting as a pure mirror for the white key light
          })
        } else {
          // Bright / White elements
          material = new MeshPhysicalMaterial({
            color: new Color(0xd9e2ec), // Off-white/silver, not pure white
            roughness: 0.3,
            metalness: 0.6,
            clearcoat: 0.2,
          })
        }

        const shapes = SVGLoader.createShapes(path)
        shapes.forEach((shape) => {
          // Slimmer, cleaner extrusion (no bloated bevels)
          const geometry = new ExtrudeGeometry(shape, {
            depth: isIcon ? 14 : 6,
            bevelEnabled: true,
            bevelThickness: isIcon ? 1.5 : 0.5,
            bevelSize: isIcon ? 1.5 : 0.5,
            bevelSegments: 4,
            curveSegments: 12,
          })
          geometry.computeVertexNormals()

          const mesh = new Mesh(geometry, material)
          mesh.position.z = isIcon ? -13 : 0
          
          // Cast/Receive soft shadows
          mesh.castShadow = true
          mesh.receiveShadow = true
          
          logoGroup.add(mesh)

          // Add crisp glowing edges to the icon elements
          if (isIcon) {
            const edgeGeo = new EdgesGeometry(geometry, 20)
            const edgeMat = new LineBasicMaterial({
              color: isCyan ? 0x00b7ff : 0x7be7ff, // Much brighter neon cyan edges
              transparent: true,
              opacity: isCyan ? 1.0 : 0.6,
              blending: AdditiveBlending,
              depthWrite: false,
              linewidth: 2 // Has no effect in WebGL natively, but standard definition
            })
            const edges = new LineSegments(edgeGeo, edgeMat)
            edges.position.copy(mesh.position)
            logoGroup.add(edges)
          }
        })
      })

      // Center and scale
      const box = new Box3().setFromObject(logoGroup)
      const center = new Vector3()
      const size = new Vector3()
      box.getCenter(center)
      box.getSize(size)
      
      logoGroup.children.forEach(child => child.position.sub(center))
      // Fix SVG inversion FIRST
      logoGroup.rotation.x = Math.PI
      
      // Massive scale up to be sure we see it and it dominates the space
      const targetScale = 6.8 / Math.max(size.x, 1) 
      logoGroup.scale.setScalar(targetScale)
      
      setLoading(false)
      if (wrapper) wrapper.dataset.ready = 'true'
    }, undefined, (error) => {
      console.error("SVG Load Error:", error)
      setWebglFailed(true)
    })

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

  if (!webglOk || webglFailed) {
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
    </div>
  )
}
