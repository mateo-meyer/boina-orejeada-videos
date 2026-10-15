// Configuración de la CLI de Remotion (studio, render, still).
// Docs: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
// Calidad alta para redes (menor = mejor calidad, 18 es casi sin pérdida).
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
// Usa todos los núcleos menos uno para renderizar más rápido.
Config.setConcurrency(null);
