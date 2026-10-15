---
name: editor-video
description: Edita y renderiza videos de Boina Orejeada con el proyecto Remotion de este repo (Reels 9:16, promos, ediciones de clips con textos, música y cierre de marca). Usala siempre que el usuario pida editar, armar, cortar, montar, renderizar o mejorar un video, Reel, Short o historia de Boina Orejeada, o cuando traiga clips o música para convertir en un video. Es el punto de entrada: decide el flujo y deriva a las skills especializadas (remotion-*, motion design, cut-video, video-use).
---

# Editor de video — Boina Orejeada

Skill principal de edición. Trabaja **sobre el proyecto Remotion de este repo**
y usa las demás skills de `.claude/skills/` como apoyo (ver `LEEME.md`).

## 1. Qué hay en el proyecto

| Pieza | Para qué |
|---|---|
| `src/compositions/ClipEdit.tsx` (`ClipEdit`) | Une clips de `public/clips/`, los recorta, agrega textos, transiciones de fundido, música con fade out y cierre de marca. Duración automática. |
| `src/compositions/ReelPromo.tsx` (`ReelPromo`) | Reel de 8 s solo con textos animados (título, subtítulo, llamado a la acción). |
| `src/brand.ts` | Colores, lema y rutas de logo de la marca. **Única fuente de colores**: no escribas hex sueltos en las composiciones. |
| `src/fonts.ts` | Tipografías de la marca (`public/fonts`): `fuenteTitulos`, `fuenteSegundaLinea`, `fuenteManuscrita`. |
| `public/logo/` | Logos: original, transparente y sobre azul. |
| `scripts/render.mjs` | Render programático: `npm run render -- <Id> [props.json] [salida.mp4]`. |
| `props/*.json` | Props de cada video. Un JSON por pieza. |

Formato por defecto: 1080×1920, 30 fps, h264, CRF 18, yuv420p.

## 2. Flujo de trabajo

1. **Entender el pedido.** Objetivo (vender un producto, mostrar proceso,
   promo, novedad), red y formato (Reel/TikTok 9:16, feed 4:5, historia 9:16),
   duración buscada y llamado a la acción. Si falta algo clave, una sola pregunta.
2. **Revisar el material.** Para cada clip en `public/clips/`:
   `npx remotion ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of json <archivo>`.
   Anotá duración, orientación y fps. Si un clip es horizontal, avisá que se va a
   recortar al centro (o proponé otro encuadre).
3. **Plan de edición** (mostralo antes de renderizar si el pedido es abierto):
   lista de tomas con `inicio`/`fin`, texto de cada una, música y cierre.
   - Gancho en los primeros 1–2 s: la toma más fuerte va primero.
   - Tomas de 1,5–3,5 s para Reels; nada de más de 5 s sin cambio.
   - Textos cortos (máx. ~6 palabras), en español rioplatense, sin tapar el producto.
   - Total recomendado: 7–20 s para Reels de producto.
4. **Escribir el JSON** en `props/<nombre-del-video>.json` siguiendo el esquema
   de `ClipEdit` (`clips[].archivo|inicio|fin|texto|silenciar`, `musica`,
   `volumenMusica`, `duracionTransicion`, `textoFinal`, `lineaFinal` opcional).
5. **Verificar antes del render completo:** `npm run lint` y un fotograma de
   control con `npx remotion still ClipEdit out/control.png --props=props/<nombre>.json --frame=<n>`
   en el gancho, a mitad y en el cierre. Mirá las imágenes.
6. **Renderizar:** `npm run render -- ClipEdit props/<nombre>.json out/<nombre>.mp4`.
7. **Entregar:** ruta del MP4, duración final y lista de tomas usadas. Ofrecé
   portada con `remotion still`.

Si el pedido no entra en `ClipEdit`/`ReelPromo` (otro formato, animaciones
nuevas, subtítulos palabra por palabra), creá una composición nueva en
`src/compositions/`, registrala en `src/Root.tsx` con esquema zod, y usá `brand`
y las fuentes de `src/fonts.ts`. No rompas las props de las composiciones existentes.

## 3. A qué skill derivar

| Necesidad | Skill |
|---|---|
| Reglas y API de Remotion (siempre antes de escribir código Remotion) | `remotion-best-practices` (router), `remotion-markup`, `remotion-video` |
| Que se vea profesional y no genérico | `remotion-motion-graphics` |
| Subtítulos / captions | `remotion-captions` |
| Render, Studio, actualización | `remotion-render`, `remotion-studio`, `remotion-upgrade` |
| Timing, easing, que el movimiento no se vea rígido | `animation-principles` |
| Ritmo de corte, cortar al beat de la música | `beat-sync-editing` |
| Encuadre, zonas seguras 9:16, jerarquía | `shot-composition` |
| Dirección de arte y consistencia entre piezas | `motion-art-direction` |
| Paleta, degradados, color de la toma | `color-motion` |
| Animación del logo / cierre de marca | `logo-animation` |
| Fondos animados | `motion-background` |
| Clip largo hablado para limpiar silencios y muletillas | `/cut-video` (solo si el usuario la invoca) |
| Edición conversacional completa con transcripción | `/video-use` (solo si el usuario la invoca; necesita ElevenLabs) |
| Motion graphics en HTML (HyperFrames) | `motion-graphics` / `hyperframes` — **solo si el usuario pide HyperFrames explícitamente**; en este repo el framework por defecto es Remotion. |

## 4. Reglas de marca

Leé `references/ficha-de-marca.md` antes de escribir textos o diseñar placas.
Lo esencial:

- **Colores y fuentes solo desde `src/brand.ts` y `src/fonts.ts`.** Azul boina
  `#2D3050` como acento; fondos claro/crema; textos carbón. Sin degradés ni
  marcos de colores.
- Títulos en Instrument Sans Bold (interlineado 0,95), segunda línea en
  Instrument Serif Italic (azul o cuero claro), como máximo una nota a mano
  (Nothing You Could Do) por placa.
- Logo en la portada y en la última placa. Sobre fondo oscuro, siempre
  `logo-sobre-azul.png` (dentro del círculo claro). Nunca deformarlo,
  recolorearlo ni ponerle sombra.
- Lema: "Tradición que nos representa". Nunca el lema viejo.
- Textos en argentino natural, pocos emojis. **Prohibido:** la palabra "campo",
  precios (salvo combos), mensajes personales de Mateo a su mamá.
- **Música siempre de folklore.**
- El producto real manda: luz natural, fiel al color, no taparlo con textos ni
  efectos, no deformarlo ni cambiarle el color con la gradación.
- Estilo sobrio: fundidos o cortes secos; nada de glitch, neón, stickers,
  emojis en imagen, fotos de stock ni caras grandes en primer plano.
- Textos dentro de la zona segura de Reels: ~250 px arriba y ~350 px abajo
  en 1080×1920.
- Cierre de `ClipEdit`: azul liso + logo en círculo + `textoFinal` + lema
  (`lineaFinal` lo reemplaza).

## 5. Límites

- No subas ni publiques videos en redes sin que el usuario lo pida.
- Música: usá solo archivos que el usuario haya puesto en `public/music/` o que
  confirme que tiene derecho a usar.
- `public/clips`, `public/music` y `out/` no se versionan: no los commitees.
- No activar telemetría ni usar claves de terceros (ElevenLabs, HeyGen, Gemini)
  sin que el usuario las provea.
