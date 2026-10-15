// Tipografías locales (en public/fonts). Para sumar las fuentes oficiales de la
// marca, copiá el archivo a public/fonts y agregá otra llamada a loadFont.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fuenteTitulos = "Playfair Display";

loadFont({
  family: fuenteTitulos,
  url: staticFile("fonts/PlayfairDisplay-Bold.woff2"),
  weight: "700",
});
