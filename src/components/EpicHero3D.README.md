# EpicHero3D

`EpicHero3D.tsx` ist die scroll-getriebene Desktop-Szene des Startseiten-Heros. Die Komponente wird in `App.tsx` per `React.lazy` erst nach dem LCP und erst beim Eintritt der WebGL-Bühne in den Viewport geladen. Unter 961 px sowie bei `prefers-reduced-motion` bleibt das statische, kanonische Logo aktiv.

## Phasen

- `0.00–0.25` — Hero-Hold: Das Master-GLB bleibt vollständig und bewegt sich nur minimal.
- `0.25–0.50` — Disassemble: Die Headline-Glyphen erscheinen als einzelne extrudierte Meshes; Logo-Facetten und Debris lösen sich deterministisch voneinander.
- `0.50–0.85` — Formation: Glyphen und Facetten konvergieren, die Kamera fährt heran, Metall wird reflektiver und der Light Sweep läuft über die Form.
- `0.85–1.00` — Finale: Das Logo steht wieder vollständig; erst jetzt wird die dezente Pointer-Parallaxe zugeschaltet.

Die normalisierte Zeit kommt ausschließlich aus `useGsapPinHero.ts`. Der Hook pinnt den Hero für zusätzliche `320vh` (Gesamterlebnis ca. `420vh`) und publiziert den Wert als `hero-sequence-progress`-Event. Dadurch verursacht Scrollen keine React-Rerenders und Vorwärts-/Rückwärts-Scrollen bleibt deterministisch.

## Tuning

- Phasengrenzen: `smoother(...)`-Aufrufe in `CinematicScene`.
- Facettenflug: `EXPLODED_OFFSETS` und `EXPLODED_ROTATIONS`.
- Buchstabenflug: `buildLetterLayout()`. Die Zufallswerte sind absichtlich deterministisch, damit Scroll-Scrubbing exakt reversibel bleibt.
- Look: GLB-Material-Mapping in `cloneLogoScene()` und direktes Studio-Licht im JSX. Auf einen `EffectComposer` wird bewusst verzichtet, weil dessen transparenter Farbpass das Master-GLB im Zielrenderer nahezu vollständig abdunkelte.
- Scroll-Länge: `SCROLL_DISTANCE_VH` in `useGsapPinHero.ts`.

## Asset-Option für Blender

Das Master-GLB enthält sieben benannte Material-Primitives, aber nur ein gemeinsames Mesh. Daher bewegt sich das Logo in der aktuellen Geschichte als zusammenhängender Körper; Buchstaben und Debris erzeugen die räumliche Explosion. Wenn die sieben Logo-Bereiche später unabhängig auseinanderfliegen oder Buchstaben in geometrisch passende Segmente morphen sollen, müssen sie in Blender als separate, benannte Meshes exportiert werden. Ein echtes Mesh-Morphing aus beliebigen Textglyphen lässt sich im Browser nicht sauber vortäuschen.
