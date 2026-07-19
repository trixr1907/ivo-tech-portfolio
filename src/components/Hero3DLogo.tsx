import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  RectAreaLight,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

type Hero3DLogoProps = {
  fallbackSrc?: string
  alt?: string
}

type FacetState = {
  mesh: Mesh
  materials: MeshStandardMaterial[]
  targetPosition: Vector3
  targetRotation: Vector3
  offset: Vector3
  rotationOffset: Vector3
  explodedOffset: Vector3
  explodedRotation: Vector3
  delay: number
}

const LOGO_GLB_URL = '/brand/3d/ivo-tech-logo-icon-3d-emblem.glb'
const ASSEMBLY_OFFSETS = [
  [-24, 14, -26],
  [-16, -18, -18],
  [-10, 22, 20],
  [18, 18, -24],
  [25, -13, 18],
  [12, -22, -16],
  [-21, -10, 22],
  [20, 9, 28],
  [28, -4, 34],
] as const
const FINAL_DEPTH_OFFSETS_SCENE = [-0.18, -0.12, 0.08, -0.06, 0.14, -0.1, 0.18, 0.22, 0.28] as const
const EXPLODED_OFFSETS = [
  [-0.72, 0.42, -0.9],
  [0.62, -0.5, -0.58],
  [-0.46, 0.68, 0.72],
  [0.76, 0.48, -0.74],
  [0.88, -0.4, 0.68],
  [0.4, -0.72, -0.52],
  [-0.78, -0.34, 0.7],
  [0.68, 0.28, 0.92],
  [-0.58, 0.04, 1.05],
] as const

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

function easeOutExpo(value: number) {
  return value === 1 ? 1 : 1 - 2 ** (-10 * value)
}

function smoothPulse(value: number) {
  if (value <= 0 || value >= 1) return 0
  return Math.sin(value * Math.PI) ** 2
}

function styleMaterial(material: MeshStandardMaterial) {
  const name = material.name.toLowerCase()

  if (name.includes('ice')) {
    material.color.set(0x7be7ff)
    material.emissive = new Color(0x46cdea)
    material.emissiveIntensity = 0.42
    material.metalness = 0
    material.roughness = 0.2
    material.envMapIntensity = 0.32
  } else if (name.includes('cyan') || name.includes('energy')) {
    material.color.set(0x00b7ff)
    material.emissive = new Color(0x007eb8)
    material.emissiveIntensity = 0.62
    material.metalness = 0
    material.roughness = 0.24
    material.envMapIntensity = 0.3
  } else if (name.includes('black') || name.includes('recess')) {
    material.color.set(0x111720)
    material.metalness = 0.96
    material.roughness = 0.42
    material.envMapIntensity = 0.22
  } else if (name.includes('dark') || name.includes('fold')) {
    material.color.set(0x596573)
    material.metalness = 0.94
    material.roughness = 0.38
    material.envMapIntensity = 0.48
  } else if (name.includes('bright')) {
    material.color.set(0xf2f7fb)
    material.metalness = 1
    material.roughness = 0.18
    material.envMapIntensity = 0.72
  } else if (name.includes('brushed') || name.includes('steel')) {
    material.color.set(0xbec8d3)
    material.metalness = 0.98
    material.roughness = 0.29
    material.envMapIntensity = 0.88
  } else {
    material.color.set(0xdce6f2)
    material.metalness = 1
    material.roughness = 0.21
    material.envMapIntensity = 0.96
  }

  if (material instanceof MeshPhysicalMaterial) {
    material.clearcoat = 0.06
    material.clearcoatRoughness = 0.38
    material.transmission = 0
  }

  material.transparent = true
  material.opacity = 0
  material.depthWrite = true
  material.needsUpdate = true
}

function prepareFacets(root: Group) {
  const facets: FacetState[] = []

  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return

    const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const materials = sourceMaterials.map((source) => {
      const material = source.clone() as MeshStandardMaterial
      styleMaterial(material)
      return material
    })
    mesh.material = Array.isArray(mesh.material) ? materials : materials[0]
    mesh.castShadow = false
    mesh.receiveShadow = false

    const index = facets.length
    const offsetValues = ASSEMBLY_OFFSETS[index % ASSEMBLY_OFFSETS.length]
    const direction = index % 2 === 0 ? 1 : -1
    facets.push({
      mesh,
      materials,
      targetPosition: mesh.position.clone(),
      targetRotation: new Vector3(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z),
      offset: new Vector3(...offsetValues),
      rotationOffset: new Vector3(0.08 * direction, -0.12 * direction, 0.1 * direction),
      explodedOffset: new Vector3(...EXPLODED_OFFSETS[index % EXPLODED_OFFSETS.length]),
      explodedRotation: new Vector3(0.045 * direction, -0.06 * direction, 0.055 * direction),
      delay: 0.18 + index * 0.065,
    })
  })

  return facets
}

export default function Hero3DLogo({ fallbackSrc, alt = 'ivo-tech 3D Logo' }: Hero3DLogoProps) {
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
    let visible = true
    let modelReadyAt = 0
    let scrollCurrent = 0
    let scrollTarget = 0
    let facets: FacetState[] = []
    let renderer: WebGLRenderer

    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        precision: 'highp',
      })
    } catch {
      queueMicrotask(() => {
        if (wrapRef.current === wrapper) setWebglFailed(true)
      })
      return undefined
    }

    const isCompact = window.matchMedia('(max-width: 767px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.35 : 1.75))
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.04
    renderer.shadowMap.enabled = false
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 9.6)

    const root = new Group()
    root.rotation.set(MathUtils.degToRad(-8), MathUtils.degToRad(-20), MathUtils.degToRad(1.5))
    scene.add(root)

    const logoGroup = new Group()
    root.add(logoGroup)

    const pmrem = new PMREMGenerator(renderer)
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = environment
    if ('environmentIntensity' in scene) {
      ;(scene as Scene & { environmentIntensity: number }).environmentIntensity = 0.46
    }
    pmrem.dispose()

    scene.add(new AmbientLight(0x182432, 0.13))
    scene.add(new HemisphereLight(0xc8e6f5, 0x030507, 0.23))

    const keyLight = new DirectionalLight(0xd9edff, 1.35)
    keyLight.position.set(-4.5, 5.2, 8.4)
    scene.add(keyLight)

    const edgeLight = new DirectionalLight(0x8adfff, 2.2)
    edgeLight.position.set(5.5, 2.4, -6.8)
    scene.add(edgeLight)

    const cyanCoreLight = new PointLight(0x00b7ff, 0.78, 7.5, 2)
    cyanCoreLight.position.set(1.2, -0.1, 2.2)
    scene.add(cyanCoreLight)

    RectAreaLightUniformsLib.init()
    const lightSweep = new RectAreaLight(0xf0f9ff, 0, 0.72, 6.2)
    lightSweep.position.set(-7, 1.1, 5.4)
    lightSweep.lookAt(0, 0, 0)
    scene.add(lightSweep)

    new GLTFLoader().load(
      LOGO_GLB_URL,
      (gltf) => {
        if (disposed) return
        const model = gltf.scene
        facets = prepareFacets(model)

        const box = new Box3().setFromObject(model)
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        model.position.sub(center)
        const sceneScale = 7.05 / Math.max(size.x, size.y, 1)
        logoGroup.scale.setScalar(sceneScale)
        logoGroup.add(model)

        for (const [index, facet] of facets.entries()) {
          facet.targetPosition.z += FINAL_DEPTH_OFFSETS_SCENE[index] / sceneScale
          facet.mesh.position.copy(facet.targetPosition).add(facet.offset)
          facet.mesh.rotation.set(
            facet.targetRotation.x + facet.rotationOffset.x,
            facet.targetRotation.y + facet.rotationOffset.y,
            facet.targetRotation.z + facet.rotationOffset.z,
          )
        }

        modelReadyAt = performance.now()
        wrapper.dataset.ready = 'true'
        wrapper.dataset.asset = 'emblem-9-facet'
        setLoading(false)
      },
      undefined,
      () => {
        if (!disposed) setWebglFailed(true)
      },
    )

    const hero = wrapper.closest<HTMLElement>('.hero')
    const onSequenceProgress = (event: Event) => {
      const value = (event as CustomEvent<number>).detail
      if (typeof value === 'number' && Number.isFinite(value)) {
        scrollTarget = MathUtils.clamp(value, 0, 1)
      }
    }
    hero?.addEventListener('hero-sequence-progress', onSequenceProgress)

    const pointerTarget = new Vector2()
    const pointerCurrent = new Vector2()
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer) return
      const rect = wrapper.getBoundingClientRect()
      pointerTarget.set(
        MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1),
        MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1),
      )
    }
    const onPointerLeave = () => pointerTarget.set(0, 0)
    const onContextLost = (event: Event) => {
      event.preventDefault()
      if (!disposed) setWebglFailed(true)
    }
    const onVisibilityChange = () => {
      visible = document.visibilityState === 'visible' && wrapper.getBoundingClientRect().bottom > 0
    }

    wrapper.addEventListener('pointermove', onPointerMove, { passive: true })
    wrapper.addEventListener('pointerleave', onPointerLeave, { passive: true })
    canvas.addEventListener('webglcontextlost', onContextLost)
    document.addEventListener('visibilitychange', onVisibilityChange)

    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      camera.aspect = rect.width / rect.height
      camera.updateProjectionMatrix()
      renderer.setSize(rect.width, rect.height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(wrapper)
    resize()

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && document.visibilityState === 'visible'
      },
      { rootMargin: '12%' },
    )
    visibilityObserver.observe(wrapper)

    const startedAt = performance.now()
    let previousFrameAt = startedAt
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      if (!visible) return

      const now = performance.now()
      const deltaTime = Math.min((now - previousFrameAt) * 0.001, 0.05)
      previousFrameAt = now
      const time = (now - startedAt) * 0.001
      const assemblyTime = modelReadyAt ? (now - modelReadyAt) * 0.001 : 0
      const scrollResponse = scrollTarget < scrollCurrent ? 18 : 11
      scrollCurrent = MathUtils.damp(scrollCurrent, scrollTarget, scrollResponse, deltaTime)
      const scrollProgress = MathUtils.clamp(scrollCurrent, 0, 1)
      const disassemble = MathUtils.smoothstep(scrollProgress, 0.12, 0.42)
      const reassemble = MathUtils.smoothstep(scrollProgress, 0.58, 0.9)
      const explodedProgress = disassemble * (1 - reassemble)
      pointerCurrent.lerp(pointerTarget, 0.04)

      for (const facet of facets) {
        const linearProgress = MathUtils.clamp((assemblyTime - facet.delay) / 0.82, 0, 1)
        const progress = easeOutExpo(linearProgress)
        facet.mesh.position.copy(facet.targetPosition).addScaledVector(facet.offset, 1 - progress)
        facet.mesh.position.addScaledVector(facet.explodedOffset, explodedProgress)
        facet.mesh.rotation.set(
          facet.targetRotation.x +
            facet.rotationOffset.x * (1 - progress) +
            facet.explodedRotation.x * explodedProgress,
          facet.targetRotation.y +
            facet.rotationOffset.y * (1 - progress) +
            facet.explodedRotation.y * explodedProgress,
          facet.targetRotation.z +
            facet.rotationOffset.z * (1 - progress) +
            facet.explodedRotation.z * explodedProgress,
        )
        for (const material of facet.materials) material.opacity = progress
      }

      const settled = MathUtils.clamp((assemblyTime - 1.15) / 0.8, 0, 1)
      root.rotation.x = MathUtils.degToRad(-8) - pointerCurrent.y * 0.052 + scrollProgress * 0.08
      root.rotation.y =
        MathUtils.degToRad(-20) + pointerCurrent.x * 0.087 + Math.sin(time * 0.33) * 0.025 + scrollProgress * 0.38
      root.rotation.z = MathUtils.degToRad(1.5) + Math.sin(time * 0.27) * 0.012 - scrollProgress * 0.06
      root.position.y = Math.sin(time * 0.52) * 0.045 * settled - scrollProgress * 0.18
      root.position.x = Math.sin(scrollProgress * Math.PI) * 0.12
      root.scale.setScalar(0.965 + settled * 0.035 - scrollProgress * 0.025)

      camera.position.x = pointerCurrent.x * 0.15 + scrollProgress * 0.34
      camera.position.y = -pointerCurrent.y * 0.1 - scrollProgress * 0.12
      camera.position.z = 9.6 + scrollProgress * 0.62
      camera.lookAt(0, -scrollProgress * 0.06, 0)

      const sweepPhase = ((time - 0.35) % 8.8) / 8.8
      const sweepProgress = MathUtils.clamp((sweepPhase - 0.04) / 0.28, 0, 1)
      lightSweep.position.x = MathUtils.lerp(-7, 7, easeOutExpo(sweepProgress))
      lightSweep.position.y = 1.2 - sweepProgress * 0.65
      lightSweep.intensity = (1.5 + 2.3 * smoothPulse(scrollProgress)) * (0.3 + 0.7 * settled)
      lightSweep.position.z = 5.4 + scrollProgress * 1.2
      lightSweep.lookAt(0, 0, 0)
      cyanCoreLight.intensity = 0.72 + Math.sin(time * 0.7) * 0.08

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      hero?.removeEventListener('hero-sequence-progress', onSequenceProgress)
      wrapper.removeEventListener('pointermove', onPointerMove)
      wrapper.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      document.removeEventListener('visibilitychange', onVisibilityChange)

      scene.traverse((object) => {
        const mesh = object as Mesh
        mesh.geometry?.dispose()
        if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose())
        else mesh.material?.dispose()
      })
      environment.dispose()
      renderer.dispose()
    }
  }, [reducedMotion, webglOk, webglFailed])

  if (!webglOk || webglFailed || reducedMotion) {
    return <img className="hv-emblem hero-3d-fallback-image" src={fallbackSrc} alt={alt} />
  }

  return (
    <div
      ref={wrapRef}
      className="hero-3d-logo"
      role="img"
      aria-label={alt}
      data-ready="false"
      data-asset="emblem-9-facet"
      data-mode="webgl"
    >
      {loading ? (
        <img className="hv-emblem hero-3d-fallback-image" src={fallbackSrc} alt="" aria-hidden="true" />
      ) : null}
      <span className="hero-3d-contact-shadow" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero-3d-canvas" aria-hidden="true" />
    </div>
  )
}
