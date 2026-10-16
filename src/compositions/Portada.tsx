// Portada del Reel para el feed: 1080x1920, con todo lo importante dentro
// del recorte 3:4 central (y 240–1680) que muestra la grilla de Instagram.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteManuscrita, fuenteSegundaLinea, fuenteTitulos } from "../fonts";

export const portadaSchema = z.object({
  fondo: z.string(),
  // Encuadre de la foto (object-position), por ejemplo "62% 60%".
  encuadre: z.string(),
  titulo: z.string(),
  etiquetas: z.array(z.string()),
  nota: z.string(),
  // "polaroid": fondo azul con la foto enmarcada; "plena": foto a sangre con el título abajo.
  variante: z.enum(["polaroid", "plena"]),
});

const Etiqueta: React.FC<{ texto: string; i: number; tamano: number }> = ({ texto, i, tamano }) => {
  const crema = i % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: fuenteTitulos,
        fontWeight: 700,
        fontSize: tamano,
        lineHeight: 0.95,
        color: crema ? brand.colors.azul : brand.colors.claro,
        backgroundColor: crema ? brand.colors.crema : brand.colors.marron,
        padding: `${tamano * 0.16}px ${tamano * 0.3}px ${tamano * 0.22}px`,
        borderRadius: tamano * 0.12,
        boxShadow: "0 8px 22px rgba(28,26,23,0.35)",
        transform: `rotate(${[-4, 3, -2][i % 3]}deg)`,
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </span>
  );
};

const Sello: React.FC<{ tamano: number }> = ({ tamano }) => (
  <Img src={staticFile(brand.logo.sobreAzul)} style={{ width: tamano, height: tamano }} />
);

export const Portada: React.FC<z.infer<typeof portadaSchema>> = (p) =>
  p.variante === "polaroid" ? <Polaroid {...p} /> : <Plena {...p} />;

const Polaroid: React.FC<z.infer<typeof portadaSchema>> = ({ fondo, encuadre, titulo, etiquetas, nota }) => (
  <AbsoluteFill style={{ backgroundColor: brand.colors.azul }}>
    <div
      style={{
        position: "absolute",
        top: 270,
        width: "100%",
        textAlign: "center",
        fontFamily: fuenteTitulos,
        fontWeight: 700,
        fontSize: 230,
        letterSpacing: -6,
        lineHeight: 0.9,
        color: brand.colors.claro,
      }}
    >
      {titulo}
    </div>
    <div
      style={{
        position: "absolute",
        top: 540,
        left: 150,
        width: 780,
        padding: "26px 26px 120px",
        backgroundColor: brand.colors.claro,
        transform: "rotate(-3deg)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <Img src={staticFile(fondo)} style={{ width: 728, height: 780, objectFit: "cover", objectPosition: encuadre, display: "block" }} />
      <div
        style={{
          position: "absolute",
          bottom: 22,
          width: 728,
          textAlign: "center",
          fontFamily: fuenteManuscrita,
          fontSize: 64,
          color: brand.colors.azul,
        }}
      >
        {nota}
      </div>
    </div>
    <div style={{ position: "absolute", top: 640, left: 70 }}>
      <Etiqueta texto={etiquetas[0]} i={0} tamano={66} />
    </div>
    <div style={{ position: "absolute", top: 1010, right: 60 }}>
      <Etiqueta texto={etiquetas[1]} i={1} tamano={66} />
    </div>
    <div style={{ position: "absolute", top: 1200, left: 60 }}>
      <Etiqueta texto={etiquetas[2]} i={2} tamano={66} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1560,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Sello tamano={80} />
      <span style={{ fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 56, color: brand.colors.cueroClaro }}>
        una serie de Boina Orejeada
      </span>
    </div>
  </AbsoluteFill>
);

const Plena: React.FC<z.infer<typeof portadaSchema>> = ({ fondo, encuadre, titulo, etiquetas, nota }) => (
  <AbsoluteFill style={{ backgroundColor: brand.colors.azul }}>
    <Img src={staticFile(fondo)} style={{ width: 1080, height: 1920, objectFit: "cover", objectPosition: encuadre }} />
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${brand.colors.azul}00 35%, ${brand.colors.azul}CC 62%, ${brand.colors.azul} 80%)`,
      }}
    />
    <div style={{ position: "absolute", top: 300, left: 70, display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
      {etiquetas.map((e, i) => (
        <Etiqueta key={i} texto={e} i={i} tamano={60} />
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        top: 1170,
        width: "100%",
        textAlign: "center",
        fontFamily: fuenteTitulos,
        fontWeight: 700,
        fontSize: 250,
        letterSpacing: -7,
        lineHeight: 0.9,
        color: brand.colors.claro,
      }}
    >
      {titulo}
    </div>
    <div
      style={{
        position: "absolute",
        top: 1420,
        width: "100%",
        textAlign: "center",
        fontFamily: fuenteManuscrita,
        fontSize: 72,
        color: brand.colors.cueroClaro,
        transform: "rotate(-3deg)",
      }}
    >
      {nota}
    </div>
    <div style={{ position: "absolute", top: 1560, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Sello tamano={76} />
      <span style={{ fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 52, color: brand.colors.claro }}>
        una serie de Boina Orejeada
      </span>
    </div>
  </AbsoluteFill>
);
