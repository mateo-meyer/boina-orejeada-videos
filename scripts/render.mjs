#!/usr/bin/env node
// Render automático desde la terminal o desde otros scripts.
// Uso:
//   npm run render -- <ComposicionId> [props.json] [salida.mp4]
// Ejemplos:
//   npm run render -- ReelPromo
//   npm run render -- ClipEdit props/ejemplo-clip-edit.json out/reel.mp4
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const [compositionId = "ReelPromo", propsFile, outArg] = process.argv.slice(2);
const inputProps = propsFile
  ? JSON.parse(fs.readFileSync(path.resolve(propsFile), "utf8"))
  : {};
const outputLocation = path.resolve(outArg ?? `out/${compositionId}.mp4`);

// Si hay un Chrome/Chromium instalado, se puede indicar con REMOTION_BROWSER.
// Si no, Remotion descarga su propio "Chrome Headless Shell" la primera vez.
const browserExecutable = process.env.REMOTION_BROWSER || null;

console.log(`Empaquetando proyecto...`);
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  publicDir: path.resolve("public"),
});

const composition = await selectComposition({
  serveUrl,
  id: compositionId,
  inputProps,
  browserExecutable,
});

console.log(
  `Renderizando ${compositionId} (${composition.width}x${composition.height}, ` +
    `${(composition.durationInFrames / composition.fps).toFixed(1)}s) -> ${outputLocation}`,
);

let ultimo = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 18,
  outputLocation,
  inputProps,
  browserExecutable,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct % 10 === 0 && pct !== ultimo) {
      ultimo = pct;
      console.log(`  ${pct}%`);
    }
  },
});

console.log(`Listo: ${outputLocation}`);
