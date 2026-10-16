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
  variante: z.enum(["polaroid", "plena", "arco", "tira", "circulo", "marco"]),
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

export const Portada: React.FC<z.infer<typeof portadaSchema>> = (p) => {
  const V = { polaroid: Polaroid, plena: Plena, arco: Arco, tira: Tira, circulo: Circulo, marco: Marco }[p.variante];
  return <V {...p} />;
};

type P = z.infer<typeof portadaSchema>;

const Firma: React.FC<{ color: string; top?: number }> = ({ color, top = 1570 }) => (
  <div style={{ position: "absolute", top, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
    <Sello tamano={76} />
    <span style={{ fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 52, color }}>una serie de Boina Orejeada</span>
  </div>
);

// Crema con la foto en forma de ventana de arco, título azul debajo.
const Arco: React.FC<P> = ({ titulo, nota }) => (
  <AbsoluteFill style={{ backgroundColor: brand.colors.crema }}>
    <div
      style={{
        position: "absolute",
        top: 290,
        left: 190,
        width: 700,
        height: 820,
        borderRadius: "350px 350px 0 0",
        overflow: "hidden",
        border: `14px solid ${brand.colors.azul}`,
      }}
    >
      <Img src={staticFile("portada/mates.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "76% 30%" }} />
    </div>
    <div style={{ position: "absolute", top: 1010, right: 120, transform: "rotate(-6deg)", fontFamily: fuenteManuscrita, fontSize: 70, color: brand.colors.marron, backgroundColor: brand.colors.claro, padding: "6px 26px", borderRadius: 10, boxShadow: "0 8px 20px rgba(28,26,23,0.25)" }}>
      {nota}
    </div>
    <div style={{ position: "absolute", top: 1150, width: "100%", textAlign: "center", fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 240, letterSpacing: -7, lineHeight: 0.9, color: brand.colors.azul }}>
      {titulo}
    </div>
    <div style={{ position: "absolute", top: 1385, width: "100%", textAlign: "center", fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 68, color: brand.colors.cuero }}>
      historias, leyendas y canciones
    </div>
    <div style={{ position: "absolute", top: 1530, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
      <Img src={staticFile(brand.logo.transparente)} style={{ width: 76, height: 76 }} />
      <span style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 44, color: brand.colors.azul }}>Boina Orejeada</span>
    </div>
  </AbsoluteFill>
);

// Azul con tres fotos del reel como tira, cada una con su etiqueta.
const Tira: React.FC<P> = ({ titulo, etiquetas, nota }) => {
  const fotos = [
    { src: "portada/camina.jpg", pos: "42% 40%", giro: -3, x: 90 },
    { src: "portada/mates.jpg", pos: "76% 35%", giro: 2.5, x: 330 },
    { src: "portada/raices-fondo.jpg", pos: "64% 45%", giro: -2, x: 120 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.azul }}>
      <div style={{ position: "absolute", top: 255, width: "100%", textAlign: "center", fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 200, letterSpacing: -5, lineHeight: 0.9, color: brand.colors.claro }}>
        {titulo}
      </div>
      {fotos.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 500 + i * 340,
            left: f.x,
            width: 640,
            height: 330,
            border: `12px solid ${brand.colors.claro}`,
            transform: `rotate(${f.giro}deg)`,
            boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}
        >
          <Img src={staticFile(f.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: f.pos }} />
        </div>
      ))}
      {etiquetas.map((e, i) => (
        <div key={i} style={{ position: "absolute", top: 560 + i * 340, ...(i % 2 === 0 ? { right: 60 } : { left: 50 }) }}>
          <Etiqueta texto={e} i={i} tamano={60} />
        </div>
      ))}
      <div style={{ position: "absolute", top: 1475, right: 70, transform: "rotate(-5deg)", fontFamily: fuenteManuscrita, fontSize: 66, color: brand.colors.cueroClaro }}>{nota}</div>
      <Firma color={brand.colors.cueroClaro} top={1600} />
    </AbsoluteFill>
  );
};

// Marrón tierra con el título repetido (calado y lleno) y la foto en un círculo.
const Circulo: React.FC<P> = ({ titulo, etiquetas, nota }) => {
  const linea = (lleno: boolean, top: number) => (
    <div
      style={{
        position: "absolute",
        top,
        width: "100%",
        textAlign: "center",
        fontFamily: fuenteTitulos,
        fontWeight: 700,
        fontSize: 250,
        letterSpacing: -6,
        lineHeight: 0.9,
        color: lleno ? brand.colors.crema : "transparent",
        WebkitTextStroke: lleno ? undefined : `3px ${brand.colors.cueroClaro}`,
      }}
    >
      {titulo}
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.marron }}>
      {linea(false, 300)}
      <div style={{ position: "absolute", top: 540, left: 220, width: 640, height: 640, borderRadius: "50%", overflow: "hidden", border: `14px solid ${brand.colors.crema}`, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
        <Img src={staticFile("portada/raices-fondo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 50%" }} />
      </div>
      {linea(true, 1170)}
      <div style={{ position: "absolute", top: 540, left: 60 }}><Etiqueta texto={etiquetas[0]} i={0} tamano={56} /></div>
      <div style={{ position: "absolute", top: 820, right: 40 }}><Etiqueta texto={etiquetas[1]} i={1} tamano={56} /></div>
      <div style={{ position: "absolute", top: 1060, left: 80 }}><Etiqueta texto={etiquetas[2]} i={2} tamano={56} /></div>
      <div style={{ position: "absolute", top: 1420, width: "100%", textAlign: "center", fontFamily: fuenteManuscrita, fontSize: 64, color: brand.colors.crema, transform: "rotate(-3deg)" }}>{nota}</div>
      <Firma color={brand.colors.cueroClaro} top={1600} />
    </AbsoluteFill>
  );
};

// Foto a sangre dentro de un marco claro grueso, título enorme abajo.
const Marco: React.FC<P> = ({ titulo, nota }) => (
  <AbsoluteFill style={{ backgroundColor: brand.colors.claro }}>
    <div style={{ position: "absolute", top: 250, left: 50, width: 980, height: 1420, overflow: "hidden", borderRadius: 28 }}>
      <Img src={staticFile("portada/mates.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "72% 40%" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${brand.colors.azul}00 50%, ${brand.colors.azul}E6 85%)` }} />
      <div style={{ position: "absolute", top: 40, left: 40, fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 44, letterSpacing: 4, color: brand.colors.azul, backgroundColor: brand.colors.claro, padding: "12px 26px", borderRadius: 999 }}>
        NUEVA SERIE
      </div>
      <div style={{ position: "absolute", bottom: 210, width: "100%", textAlign: "center", fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 240, letterSpacing: -7, lineHeight: 0.9, color: brand.colors.claro }}>
        {titulo}
      </div>
      <div style={{ position: "absolute", bottom: 130, width: "100%", textAlign: "center", fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 60, color: brand.colors.cueroClaro }}>
        historias, leyendas y canciones
      </div>
      <div style={{ position: "absolute", bottom: 40, right: 50, display: "flex", alignItems: "center", gap: 16 }}>
        <Sello tamano={70} />
        <span style={{ fontFamily: fuenteManuscrita, fontSize: 56, color: brand.colors.claro }}>{nota}</span>
      </div>
    </div>
  </AbsoluteFill>
);

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
