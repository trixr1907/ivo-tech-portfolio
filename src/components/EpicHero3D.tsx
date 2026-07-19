import { Environment, Lightformer, Text3D, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  AdditiveBlending,
  Color,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RectAreaLight,
  Vector3,
} from 'three'

const LOGO_GLB_URL = '/brand/3d/ivo-tech-logo-icon-3d-master.glb'
const FONT_URL = '/fonts/helvetiker_bold.typeface.json'
const PARTICLE_COUNT = 72
const LOGO_SCENE_SCALE = 0.046

const EXPLODED_OFFSETS = [
  [-1.45, 0.9, -1.6],
  [1.25, -0.85, -1.2],
  [-1.0, 1.3, 1.1],
  [1.55, 1.0, -1.35],
  [1.7, -0.72, 1.25],
  [0.8, -1.35, -0.9],
  [-1.55, -0.78, 1.2],
] as const

const EXPLODED_ROTATIONS = [
  [0.18, -0.28, 0.2],
  [-0.22, 0.24, -0.16],
  [0.26, 0.18, -0.22],
  [-0.2, -0.26, 0.18],
  [0.16, 0.3, -0.2],
  [-0.24, 0.16, 0.22],
  [0.22, -0.2, -0.18],
] as const

type EpicHero3DProps = {
  fallbackSrc: string
  alt?: string
}

type FacetRig = {
  mesh: Mesh
  targetPosition: Vector3
  targetRotation: Vector3
  explodedOffset: Vector3
  explodedRotation: Vector3
  materials: MeshStandardMaterial[]
  baseRoughness: number[]
}

type LetterLayout = {
  glyph: string
  start: Vector3
  exploded: Vector3
  merge: Vector3
  rotation: Vector3
}

type ParticleLayout = {
  origin: Vector3
  exploded: Vector3
  scale: number
}

function seeded(index: number, channel: number) {
  const value = Math.sin(index * 91.17 + channel * 37.31) * 43758.5453
  return value - Math.floor(value)
}

function smoother(value: number, start: number, end: number) {
  return MathUtils.smoothstep(MathUtils.clamp(value, start, end), start, end)
}

function buildLetterLayout(): LetterLayout[] {
  const lines = ['ICH BAUE', 'WAS BLEIBT.']
  const result: LetterLayout[] = []
  let glyphIndex = 0

  lines.forEach((line, lineIndex) => {
    const visibleGlyphs = [...line].filter((glyph) => glyph !== ' ')
    let visibleIndex = 0

    for (const glyph of line) {
      if (glyph === ' ') continue
      const x = (visibleIndex - (visibleGlyphs.length - 1) * 0.5) * 0.58
      const y = lineIndex === 0 ? 2.05 : -2.05
      const direction = glyphIndex % 2 === 0 ? 1 : -1
      result.push({
        glyph,
        start: new Vector3(x, y, -0.32 + seeded(glyphIndex, 1) * 0.18),
        exploded: new Vector3(
          (seeded(glyphIndex, 2) - 0.5) * 8.6,
          (seeded(glyphIndex, 3) - 0.5) * 5.8,
          (seeded(glyphIndex, 4) - 0.5) * 4.2,
        ),
        merge: new Vector3(
          (seeded(glyphIndex, 5) - 0.5) * 1.3,
          (seeded(glyphIndex, 6) - 0.5) * 1.05,
          0.2 + seeded(glyphIndex, 7) * 0.7,
        ),
        rotation: new Vector3(
          (seeded(glyphIndex, 8) - 0.5) * 1.5,
          (seeded(glyphIndex, 9) - 0.5) * 1.8,
          direction * (0.45 + seeded(glyphIndex, 10) * 0.5),
        ),
      })
      visibleIndex += 1
      glyphIndex += 1
    }
  })

  return result
}

function buildParticleLayout(): ParticleLayout[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = seeded(index, 11) * Math.PI * 2
    const radius = 0.3 + seeded(index, 12) * 1.25
    const distance = 2.2 + seeded(index, 13) * 4.4
    return {
      origin: new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.65, (seeded(index, 14) - 0.5) * 0.5),
      exploded: new Vector3(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance * 0.72,
        (seeded(index, 15) - 0.5) * 5,
      ),
      scale: 0.018 + seeded(index, 16) * 0.04,
    }
  })
}

const LETTER_LAYOUT = buildLetterLayout()
const PARTICLE_LAYOUT = buildParticleLayout()

function cloneLogoScene(source: Group) {
  const model = source.clone(true)
  const facets: FacetRig[] = []

  model.traverse((object) => {
    if (!(object instanceof Mesh)) return
    const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
    const materials = sourceMaterials.map((sourceMaterial) => {
      const material = sourceMaterial.clone() as MeshStandardMaterial
      const name = material.name.toLowerCase()

      if (name.includes('cyan') || name.includes('energy')) {
        material.color.set(0x00b7ff)
        material.emissive = new Color(0x008dca)
        material.emissiveIntensity = 0.9
        material.metalness = 0.08
        material.roughness = 0.2
      } else if (name.includes('ice')) {
        material.color.set(0x9eeeff)
        material.emissive = new Color(0x35bde8)
        material.emissiveIntensity = 0.56
        material.metalness = 0.12
        material.roughness = 0.16
      } else if (name.includes('black') || name.includes('recess')) {
        material.color.set(0x263747)
        material.emissive.set(0x08131c)
        material.emissiveIntensity = 0.42
        material.metalness = 0.52
        material.roughness = 0.34
      } else if (name.includes('dark') || name.includes('fold')) {
        material.color.set(0x607589)
        material.emissive.set(0x101d29)
        material.emissiveIntensity = 0.34
        material.metalness = 0.62
        material.roughness = 0.3
      } else if (name.includes('bright')) {
        material.color.set(0xf2f8fc)
        material.emissive.set(0x1b2a36)
        material.emissiveIntensity = 0.2
        material.metalness = 0.64
        material.roughness = 0.2
      } else if (name.includes('brushed') || name.includes('steel')) {
        material.color.set(0xbac7d2)
        material.emissive.set(0x14222e)
        material.emissiveIntensity = 0.24
        material.metalness = 0.64
        material.roughness = 0.25
      } else {
        material.color.set(0xd9e5ef)
        material.emissive.set(0x172733)
        material.emissiveIntensity = 0.22
        material.metalness = 0.64
        material.roughness = 0.22
      }

      material.envMapIntensity = 1.08
      material.needsUpdate = true
      return material
    })

    object.material = Array.isArray(object.material) ? materials : materials[0]
    const index = facets.length
    facets.push({
      mesh: object,
      targetPosition: object.position.clone(),
      targetRotation: new Vector3(object.rotation.x, object.rotation.y, object.rotation.z),
      explodedOffset: new Vector3(...EXPLODED_OFFSETS[index % EXPLODED_OFFSETS.length]),
      explodedRotation: new Vector3(...EXPLODED_ROTATIONS[index % EXPLODED_ROTATIONS.length]),
      materials,
      baseRoughness: materials.map((material) => material.roughness),
    })
  })

  return { model, facets }
}

function CinematicScene({ onReady }: { onReady: () => void }) {
  const gltf = useGLTF(LOGO_GLB_URL)
  const sceneRootRef = useRef<Group>(null)
  const logoRef = useRef<Group>(null)
  const letterRefs = useRef<Array<Mesh | null>>([])
  const particleRef = useRef<InstancedMesh>(null)
  const sweepRef = useRef<RectAreaLight>(null)
  const progressTarget = useRef(0)
  const progressCurrent = useRef(0)
  const dummy = useMemo(() => new Object3D(), [])
  const { model, facets } = useMemo(() => cloneLogoScene(gltf.scene), [gltf.scene])
  useEffect(() => {
    const host = sceneRootRef.current?.parent?.parent
    const canvas = host?.parent as HTMLElement | null
    const hero = canvas?.closest<HTMLElement>('.hero') ?? document.querySelector<HTMLElement>('.hero')
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail
      if (Number.isFinite(detail)) progressTarget.current = MathUtils.clamp(detail, 0, 1)
    }
    hero?.addEventListener('hero-sequence-progress', onProgress)
    return () => hero?.removeEventListener('hero-sequence-progress', onProgress)
  }, [])

  useLayoutEffect(() => {
    onReady()
    return () => {
      for (const facet of facets) facet.materials.forEach((material) => material.dispose())
    }
  }, [facets, onReady])

  useFrame((state, delta) => {
    const root = sceneRootRef.current
    const logo = logoRef.current
    if (!root || !logo) return

    progressCurrent.current = MathUtils.damp(progressCurrent.current, progressTarget.current, 10, Math.min(delta, 0.05))
    const progress = progressCurrent.current
    const disassemble = smoother(progress, 0.25, 0.5)
    const reassemble = smoother(progress, 0.5, 0.85)
    const explosion = disassemble * (1 - reassemble)
    const finale = smoother(progress, 0.85, 1)
    const phraseReveal = smoother(progress, 0.25, 0.32)
    const mergeFade = 1 - smoother(progress, 0.76, 0.9)
    const elapsed = state.clock.elapsedTime

    facets.forEach((facet, index) => {
      facet.mesh.position.copy(facet.targetPosition).addScaledVector(facet.explodedOffset, explosion / LOGO_SCENE_SCALE)
      facet.mesh.rotation.set(
        facet.targetRotation.x + facet.explodedRotation.x * explosion,
        facet.targetRotation.y + facet.explodedRotation.y * explosion,
        facet.targetRotation.z + facet.explodedRotation.z * explosion,
      )
      facet.materials.forEach((material, materialIndex) => {
        material.roughness = MathUtils.lerp(facet.baseRoughness[materialIndex], Math.max(0.1, facet.baseRoughness[materialIndex] * 0.62), reassemble)
        material.envMapIntensity = MathUtils.lerp(1.08, 1.34, reassemble)
      })
      facet.mesh.position.z += (Math.sin(index * 1.7 + elapsed * 0.45) * 0.018 * (1 - explosion)) / LOGO_SCENE_SCALE
    })

    letterRefs.current.forEach((mesh, index) => {
      if (!mesh) return
      const layout = LETTER_LAYOUT[index]
      mesh.position.copy(layout.start).lerp(layout.exploded, disassemble).lerp(layout.merge, reassemble)
      mesh.rotation.set(
        layout.rotation.x * explosion,
        layout.rotation.y * explosion,
        layout.rotation.z * explosion,
      )
      const mergeScale = MathUtils.lerp(1, 0.12, reassemble)
      mesh.scale.setScalar((0.82 + phraseReveal * 0.18) * mergeScale)
    })
    letterRefs.current.forEach((mesh) => {
      if (!mesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => {
        if (material instanceof MeshStandardMaterial) material.opacity = phraseReveal * mergeFade
      })
    })

    const particles = particleRef.current
    if (particles) {
      PARTICLE_LAYOUT.forEach((particle, index) => {
        dummy.position.copy(particle.origin).lerp(particle.exploded, explosion)
        dummy.rotation.set(index * 0.37 + elapsed * 0.08, index * 0.21, index * 0.13)
        const particleVisibility = Math.sin(explosion * Math.PI)
        dummy.scale.setScalar(particle.scale * particleVisibility)
        dummy.updateMatrix()
        particles.setMatrixAt(index, dummy.matrix)
      })
      particles.instanceMatrix.needsUpdate = true
    }

    const pointerInfluence = finale
    const targetRootX = -state.pointer.y * 0.045 * pointerInfluence - 0.1 + progress * 0.12
    const targetRootY = state.pointer.x * 0.075 * pointerInfluence - 0.34 + progress * 0.42
    root.rotation.x = MathUtils.damp(root.rotation.x, targetRootX, 7, delta)
    root.rotation.y = MathUtils.damp(root.rotation.y, targetRootY, 7, delta)
    root.rotation.z = Math.sin(elapsed * 0.28) * 0.012 * (1 - explosion)
    root.position.y = Math.sin(elapsed * 0.48) * 0.045 * (1 - explosion) - progress * 0.08

    logo.scale.setScalar(LOGO_SCENE_SCALE * (1 + reassemble * 0.055 + finale * 0.025))
    state.camera.position.x = MathUtils.damp(state.camera.position.x, progress * 0.42 + state.pointer.x * 0.1 * finale, 6, delta)
    state.camera.position.y = MathUtils.damp(state.camera.position.y, -progress * 0.16 - state.pointer.y * 0.06 * finale, 6, delta)
    state.camera.position.z = MathUtils.damp(state.camera.position.z, 9.6 - reassemble * 0.7 + finale * 0.28, 6, delta)
    state.camera.lookAt(0, -progress * 0.06, 0)

    if (sweepRef.current) {
      const sweep = smoother(progress, 0.58, 0.82)
      sweepRef.current.position.x = MathUtils.lerp(-6.5, 6.5, sweep)
      sweepRef.current.position.y = 1.1 - sweep * 0.75
      sweepRef.current.intensity = Math.sin(sweep * Math.PI) * 5.2
      sweepRef.current.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      <ambientLight intensity={0.34} color="#31475c" />
      <hemisphereLight args={['#e1f4ff', '#07101a', 0.72]} />
      <directionalLight position={[-4.5, 5.2, 8]} color="#e8f5ff" intensity={2.35} />
      <directionalLight position={[5.5, 2.5, -6]} color="#7bdfff" intensity={1.65} />
      <pointLight position={[1.2, -0.1, 2.1]} color="#00b7ff" intensity={1.05} distance={7.5} decay={2} />
      <rectAreaLight ref={sweepRef} position={[-6.5, 1.1, 5.2]} color="#f0f9ff" width={0.65} height={6} intensity={0} />

      <Environment resolution={128} environmentIntensity={0.5}>
        <Lightformer form="rect" intensity={2.4} color="#d8efff" position={[-4, 4, 5]} scale={[4, 1, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#00b7ff" position={[4, 1, -4]} rotation={[0, Math.PI, 0]} scale={[3, 1, 1]} />
        <Lightformer form="ring" intensity={0.75} color="#7be7ff" position={[0, -4, 2]} scale={3.5} />
      </Environment>

      <group ref={sceneRootRef} rotation={[-0.1, -0.34, 0]}>
        <group ref={logoRef} scale={LOGO_SCENE_SCALE}>
          <primitive object={model} dispose={null} />
        </group>

        <group aria-hidden="true">
          {LETTER_LAYOUT.map((letter, index) => (
            <Text3D
              key={`${letter.glyph}-${index}`}
              ref={(mesh) => {
                letterRefs.current[index] = mesh
              }}
              font={FONT_URL}
              position={letter.start}
              size={0.42}
              height={0.11}
              curveSegments={5}
              bevelEnabled
              bevelSize={0.018}
              bevelThickness={0.025}
              bevelSegments={2}
            >
              {letter.glyph}
              <meshStandardMaterial
                color="#dce6f2"
                emissive="#07141d"
                emissiveIntensity={0.18}
                metalness={0.92}
                roughness={0.28}
                transparent
                opacity={0}
              />
            </Text3D>
          ))}
        </group>

        <instancedMesh ref={particleRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
          <tetrahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#7be7ff" transparent opacity={0.78} blending={AdditiveBlending} depthWrite={false} />
        </instancedMesh>
      </group>

    </>
  )
}

function useCompactFallback() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 960px)')
    const update = () => setCompact(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return compact
}

export default function EpicHero3D({ fallbackSrc, alt = 'ivo-tech Logo als cineatische 3D-Skulptur' }: EpicHero3DProps) {
  const reducedMotion = useReducedMotion()
  const compact = useCompactFallback()
  const [ready, setReady] = useState(false)
  const onReady = useMemo(() => () => setReady(true), [])

  if (compact || reducedMotion) {
    return (
      <div className="epic-hero-3d epic-hero-3d--fallback" role="img" aria-label={alt} data-mode="fallback">
        <img className="hv-emblem hero-3d-fallback-image" width={246} height={149} src={fallbackSrc} alt="" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="epic-hero-3d" role="img" aria-label={alt} data-ready={ready ? 'true' : 'false'} data-mode="webgl">
      {!ready ? <img className="hv-emblem hero-3d-fallback-image" width={246} height={149} src={fallbackSrc} alt="" aria-hidden="true" /> : null}
      <span className="hero-3d-contact-shadow" aria-hidden="true" />
      <Canvas
        className="hero-3d-canvas"
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 9.6], fov: 42, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMappingExposure = 1.02
        }}
      >
        <CinematicScene onReady={onReady} />
      </Canvas>
    </div>
  )
}

useGLTF.preload(LOGO_GLB_URL)
