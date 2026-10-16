// Portada del Reel para el feed: 1080x1920, con todo lo importante dentro
// del recorte 3:4 central (y 240–1680) que muestra la grilla de Instagram.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteSegundaLinea, fuenteTitulos } from "../fonts";

export const portadaSchema = z.object({
  fondo: z.string(),
  // Centro horizontal de la persona en la foto (0–1).
  cx: z.number(),
  titulo: z.string(),
  bajada: z.string(),
  pie: z.string(),
});

export const Portada: React.FC<z.infer<typeof portadaSchema>> = ({ fondo, cx, titulo, bajada, pie }) => {
  const alto = 1920;
  const ancho = (alto * 16) / 9;
  const left = Math.min(0, Math.max(1080 - ancho, 540 - cx * ancho));
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.claro }}>
      <Img src={staticFile(fondo)} style={{ position: "absolute", height: alto, width: ancho, left, top: 0 }} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${brand.colors.claro}F0 0%, ${brand.colors.claro}B0 30%, ${brand.colors.claro}00 50%)`,
        }}
      />
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 210, letterSpacing: -4, lineHeight: 0.95, color: brand.colors.azul }}>
          {titulo}
        </div>
        <div style={{ fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 74, color: brand.colors.cuero, marginTop: 18 }}>
          {bajada}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1540,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 22,
          backgroundColor: brand.colors.azul,
          padding: "18px 40px 18px 18px",
          borderRadius: 999,
          boxShadow: "0 8px 24px rgba(28,26,23,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        <Img src={staticFile(brand.logo.sobreAzul)} style={{ width: 96, height: 96 }} />
        <div style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 52, color: brand.colors.claro }}>{pie}</div>
      </div>
    </AbsoluteFill>
  );
};
