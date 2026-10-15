# Boina Orejeada — Videos automáticos con Remotion

Proyecto de [Remotion](https://www.remotion.dev) (videos hechos con React) para
editar y renderizar videos de Boina Orejeada de forma automática.

## Requisitos

- **Node.js 18 o superior** (recomendado 22).
- **Nada más.** Remotion trae su propio FFmpeg y descarga automáticamente
  "Chrome Headless Shell" la primera vez que renderizás (`npx remotion browser ensure`
  lo descarga por adelantado).
  - En Linux puede hacer falta instalar librerías del sistema para Chrome:
    `sudo apt install libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2`
  - Si ya tenés Chrome/Chromium y no querés descargar otro, indicá su ruta con
    la variable `REMOTION_BROWSER` al usar `npm run render`.

## Instalación

```bash
npm install
```

## Uso

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Abre **Remotion Studio** en el navegador para previsualizar y editar props en vivo. |
| `npm run render -- <Id> [props.json] [salida.mp4]` | Render automático (script `scripts/render.mjs`). |
| `npm run render:demo` | Renderiza el Reel de ejemplo con la CLI. |
| `npm run still` | Exporta un fotograma como PNG (portada / miniatura). |
| `npm run lint` | Chequeo de tipos con TypeScript. |
| `npm run upgrade` | Actualiza todos los paquetes de Remotion juntos. |

## Composiciones

### `ReelPromo` (1080×1920, 8 s)
Reel vertical con título, subtítulo y botón de llamado a la acción, animados.
No necesita archivos. Props: `titulo`, `subtitulo`, `llamadoAccion`.

```bash
npm run render -- ReelPromo
```

### `ClipEdit` (1080×1920, duración automática)
Edición automática de clips: los recorta, los une con transiciones de fundido,
agrega textos sobre cada toma, música de fondo (con fade out) y un cierre con
la marca. La duración total se calcula sola a partir de los clips.

1. Copiá tus videos a `public/clips/` y la música a `public/music/`.
2. Armá un JSON como [`props/ejemplo-clip-edit.json`](props/ejemplo-clip-edit.json):

```json
{
  "clips": [
    { "archivo": "clips/toma1.mp4", "inicio": 0, "fin": 3, "texto": "Mates y accesorios materos" },
    { "archivo": "clips/toma3.mp4", "texto": "Pedí por WhatsApp" }
  ],
  "musica": "music/fondo.mp3",
  "volumenMusica": 0.3,
  "duracionTransicion": 0.4,
  "textoFinal": "Boina Orejeada"
}
```

- `inicio` / `fin`: recorte en segundos (si falta `fin`, usa el clip hasta el final).
- `lineaFinal`: segunda línea del cierre (por defecto, el lema).
- `texto`: zócalo opcional sobre el clip. `silenciar: true` quita el audio original.
- `archivo` también acepta URLs `https://`.

3. Renderizá:

```bash
npm run render -- ClipEdit props/ejemplo-clip-edit.json out/reel.mp4
```

## Estructura

```
remotion.config.ts        Configuración de la CLI (h264, CRF 18, yuv420p)
src/index.ts              Punto de entrada
src/Root.tsx              Registro de composiciones
src/brand.ts              Colores, lema y logos de la marca (Ficha de marca, oct-2026)
src/fonts.ts              Tipografías de la marca (public/fonts)
public/logo/              Logos: original, transparente y sobre azul
src/compositions/         Composiciones de video
scripts/render.mjs        Render programático (para automatizar)
props/                    Props de ejemplo en JSON
public/clips, public/music  Material de entrada (no se versiona)
out/                      Videos renderizados (no se versiona)
```

## Skills para Claude

En `.claude/skills/` están las skills de edición. La principal es
**`editor-video`**: arma y renderiza videos con este proyecto respetando la
ficha de marca (`.claude/skills/editor-video/references/ficha-de-marca.md`).
Las demás son de terceros y la complementan (ver `.claude/skills/LEEME.md`).

## Licencia de Remotion

Remotion es gratis para personas y empresas de hasta 3 empleados. Empresas más
grandes necesitan una licencia: https://www.remotion.dev/license
