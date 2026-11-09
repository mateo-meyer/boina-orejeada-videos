// Tipografías de la marca (en public/fonts, gratis en Google Fonts, licencia OFL).
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Títulos: Instrument Sans Bold, interlineado ajustado (0.95).
export const fuenteTitulos = "Instrument Sans";
// Segunda línea del título, en azul o cuero claro.
export const fuenteSegundaLinea = "Instrument Serif";
// Una sola nota "a mano" por placa, como máximo.
export const fuenteManuscrita = "Nothing You Could Do";

loadFont({
  family: fuenteTitulos,
  url: staticFile("fonts/InstrumentSans.ttf"),
  weight: "400 700",
});

loadFont({
  family: fuenteSegundaLinea,
  url: staticFile("fonts/InstrumentSerif-Italic.ttf"),
  style: "italic",
  weight: "400",
});

loadFont({
  family: fuenteManuscrita,
  url: staticFile("fonts/NothingYouCouldDo.ttf"),
  weight: "400",
});

// Prompt maestro de edición: Playfair Display (títulos y palabras destacadas) + Inter (subtítulos).
export const fuentePlayfair = "Playfair Display";
export const fuenteInter = "Inter";

loadFont({ family: fuentePlayfair, url: staticFile("fonts/PlayfairDisplay-Bold.ttf"), weight: "700" });
loadFont({ family: fuentePlayfair, url: staticFile("fonts/PlayfairDisplay-SemiBoldItalic.ttf"), style: "italic", weight: "700" });
loadFont({ family: fuenteInter, url: staticFile("fonts/Inter-SemiBold.otf"), weight: "600" });
loadFont({ family: fuenteInter, url: staticFile("fonts/Inter-Bold.otf"), weight: "700" });
