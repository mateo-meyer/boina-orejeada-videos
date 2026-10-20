// Capítulo de la serie RAÍCES: tomas habladas en 9:16 con su audio,
// subtítulos por frases, datos destacados (año, lugar, nombres) y cierre de marca.
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteManuscrita, fuenteSegundaLinea, fuenteTitulos } from "../fonts";

const subtituloSchema = z.object({
  texto: z.string(),
  desde: z.number(),
  hasta: z.number(),
  // Palabras a resaltar en la etiqueta crema.
  resaltar: z.array(z.string()).optional(),
});

const datoSchema = z.object({
  desde: z.number(),
  hasta: z.number(),
  titulo: z.string(),
  bajada: z.string().optional(),
  // Alto en fracción del cuadro.
  y: z.number().optional(),
});

const colorMarca = z.enum(["azul", "claro", "crema", "marron", "cuero", "verde"]);
const pantallaSchema = z.object({
  desde: z.number(),
  hasta: z.number(),
  fondo: colorMarca,
  arriba: z.string().optional(), // línea manuscrita
  titulo: z.string(),
  abajo: z.string().optional(), // segunda línea
  imagen: z.string().optional(), // ruta en public/
  encuadre: z.string().optional(), // object-position de la foto, ej. "50% 20%"
  contar: z.array(z.number()).optional(), // [de, a]: el título es un número que cuenta
});
type Pantalla = z.infer<typeof pantallaSchema>;

const tomaSchema = z.object({
  archivo: z.string(),
  inicio: z.number(),
  fin: z.number(),
  // Zoom lento durante la toma (1 = nada).
  zoom: z.number().optional(),
  // Centro vertical del encuadre al hacer zoom (0–1).
  cy: z.number().optional(),
  // Centro de la cara (0–1): los zooms van hacia ahí.
  cx: z.number().optional(),
  subtitulos: z.array(subtituloSchema),
  datos: z.array(datoSchema).optional(),
  // Subtítulos palabra por palabra (si están, reemplazan a "subtitulos").
  palabras: z.array(z.object({ w: z.string(), a: z.number(), b: z.number(), fuerte: z.boolean().optional() })).optional(),
  // Momentos (en s desde el inicio de la toma) en que el encuadre salta a un primer plano y vuelve.
  saltos: z.array(z.number()).optional(),
  // Tramo en blanco y negro [desde, hasta].
  bn: z.array(z.number()).optional(),
  // Contador grande: cuenta de "desde" a "hasta" entre a y b.
  contador: z.object({ de: z.number(), a: z.number(), desde: z.number(), hasta: z.number(), bajada: z.string().optional() }).optional(),
  // Pantallas de color a pantalla completa (la voz sigue sonando debajo).
  pantallas: z.array(pantallaSchema).optional(),
  // Altura de los subtítulos (px desde arriba) si en esta toma la cara queda abajo.
  subY: z.number().optional(),
});

export const capituloSchema = z.object({
  serie: z.string(),
  capitulo: z.string(),
  titulo: z.string(),
  // Después de qué toma entra la placa de título (índice).
  placaDespuesDe: z.number(),
  duracionPlaca: z.number(),
  tomas: z.array(tomaSchema),
  pregunta: z.string(),
  duracionCierre: z.number(),
  // Título fijo arriba durante las tomas (como "historia #1").
  rotulo: z.string().optional(),
});

type Props = z.infer<typeof capituloSchema>;
type Toma = z.infer<typeof tomaSchema>;

const FPS = 30;
const TRANS = 8; // cuadros de fundido entre tomas
const f = (s: number) => Math.round(s * FPS);

const framesToma = (t: Toma) => Math.max(1, f(t.fin - t.inicio));

const linea = (p: Props) => {
  const items: { tipo: "toma" | "placa" | "cierre"; i?: number; dur: number }[] = [];
  p.tomas.forEach((t, i) => {
    items.push({ tipo: "toma", i, dur: framesToma(t) });
    if (i === p.placaDespuesDe) items.push({ tipo: "placa", dur: f(p.duracionPlaca) });
  });
  items.push({ tipo: "cierre", dur: f(p.duracionCierre) });
  let desde = 0;
  return items.map((it, k) => {
    const o = { ...it, desde };
    desde += it.dur - (k < items.length - 1 ? TRANS : 0);
    return o;
  });
};

export const calculateCapituloMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  const l = linea(props);
  const ult = l[l.length - 1];
  return { durationInFrames: ult.desde + ult.dur };
};

// Fundido de entrada y salida de cada bloque, con un empujón de escala.
const Transicion: React.FC<{ dur: number; children: React.ReactNode; primero: boolean }> = ({ dur, children, primero }) => {
  const frame = useCurrentFrame();
  const entra = primero ? 1 : interpolate(frame, [0, TRANS / 2], [0, 1], { extrapolateRight: "clamp" });
  const escala = primero ? 1 : interpolate(frame, [0, TRANS], [1.35, 1], { extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const blur = primero ? 0 : interpolate(frame, [0, TRANS], [18, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: entra, transform: `scale(${escala})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
};

const Subtitulo: React.FC<{ s: z.infer<typeof subtituloSchema> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 220 }, durationInFrames: 8 });
  const resaltar = (s.resaltar ?? []).map((w) => w.toLowerCase());
  const palabras = s.texto.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        top: 1300,
        left: 70,
        right: 70,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "14px 14px",
        transform: `scale(${0.9 + 0.1 * pop})`,
        opacity: pop,
      }}
    >
      {palabras.map((p, i) => {
        const fuerte = resaltar.includes(p.toLowerCase().replace(/[.,¿?¡!:]/g, ""));
        return (
          <span
            key={i}
            style={{
              fontFamily: fuenteTitulos,
              fontWeight: 700,
              fontSize: 68,
              lineHeight: 1,
              padding: "10px 18px 14px",
              borderRadius: 10,
              color: fuerte ? brand.colors.azul : brand.colors.claro,
              backgroundColor: fuerte ? brand.colors.crema : brand.colors.azul,
              boxShadow: "0 6px 16px rgba(28,26,23,0.3)",
              transform: fuerte ? "rotate(-2deg)" : undefined,
            }}
          >
            {p}
          </span>
        );
      })}
    </div>
  );
};

export const Dato: React.FC<{ d: z.infer<typeof datoSchema> }> = ({ d }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  return (
    <div
      style={{
        position: "absolute",
        top: (d.y ?? 0.2) * 1920,
        left: 80,
        transform: `rotate(-3deg) translateX(${(1 - pop) * -80}px)`,
        opacity: pop,
        backgroundColor: brand.colors.claro,
        padding: "22px 36px 26px",
        borderRadius: 14,
        boxShadow: "0 12px 30px rgba(28,26,23,0.35)",
        maxWidth: 900,
      }}
    >
      <div style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 96, lineHeight: 0.95, letterSpacing: -2, color: brand.colors.azul }}>
        {d.titulo}
      </div>
      {d.bajada ? (
        <div style={{ fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 52, color: brand.colors.cuero, marginTop: 6 }}>{d.bajada}</div>
      ) : null}
    </div>
  );
};

// Palabra actual, grande y al pecho. Las fuertes van en cursiva serif.
// Palabra actual en etiqueta de color, como los textos del teaser RAÍCES
// (fuerte: azul con letra clara; clave: crema con letra azul, más grande).
const PalabraViva: React.FC<{ w: string; fuerte: boolean; y?: number }> = ({ w, fuerte, y = 1440 }) => {
  const frame = useCurrentFrame();
  const entrada = interpolate(frame, [0, 4], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fontSize = fuerte ? 96 : 78;
  return (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center" }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: fuenteTitulos,
          fontWeight: 700,
          fontSize,
          lineHeight: 0.95,
          letterSpacing: -1,
          whiteSpace: "nowrap",
          color: fuerte ? brand.colors.azul : brand.colors.claro,
          backgroundColor: fuerte ? brand.colors.crema : brand.colors.azul,
          padding: `${fontSize * 0.14}px ${fontSize * 0.26}px ${fontSize * 0.2}px`,
          borderRadius: fontSize * 0.12,
          boxShadow: "0 6px 18px rgba(28,26,23,0.35)",
          transform: `rotate(${fuerte ? -1.5 : 1.5}deg) scale(${entrada})`,
        }}
      >
        {w}
      </span>
    </div>
  );
};

const Contador: React.FC<{ c: NonNullable<Toma["contador"]> }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.max(1, f(c.hasta - c.desde));
  const t = interpolate(frame, [0, dur * 0.6], [0, 1], { extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const n = Math.round(c.de + (c.a - c.de) * t);
  const pop = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", transform: `scale(${0.6 + 0.4 * pop})` }}>
      <div style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 230, letterSpacing: -6, color: brand.colors.claro, textShadow: "0 0 40px rgba(28,26,23,0.6)" }}>{n}</div>
      {c.bajada ? (
        <div style={{ display: "inline-block", fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 56, color: brand.colors.azul, backgroundColor: brand.colors.crema, padding: "8px 26px", borderRadius: 10, transform: "rotate(-2deg)" }}>{c.bajada}</div>
      ) : null}
    </div>
  );
};

const tinta = (fondo: Pantalla["fondo"]) =>
  fondo === "claro" || fondo === "crema"
    ? { titulo: brand.colors.azul, acento: brand.colors.cuero, linea: brand.colors.marron }
    : { titulo: brand.colors.claro, acento: brand.colors.cueroClaro, linea: brand.colors.crema };

// Pantalla de color de la marca que tapa el video un momento (la voz sigue).
const PantallaColor: React.FC<{ p: Pantalla }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.max(1, f(p.hasta - p.desde));
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  // Entra como una cortina desde abajo y sale hacia arriba.
  const entra = interpolate(frame, [0, 7], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const sale = interpolate(frame, [dur - 6, dur], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x });
  const t = tinta(p.fondo);
  const pop = (d: number) => spring({ frame: frame - d, fps, config: { damping: 14, stiffness: 160 } });
  const n = p.contar
    ? Math.round(p.contar[0] + (p.contar[1] - p.contar[0]) * interpolate(frame, [4, dur * 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }))
    : null;
  const kb = interpolate(frame, [0, dur], [1.08, 1]);
  return (
    <AbsoluteFill style={{ clipPath: `inset(${sale}% 0 ${entra}% 0)`, backgroundColor: brand.colors[p.fondo] }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "250px 90px 350px", gap: 34 }}>
        {p.imagen ? (
          <div style={{ width: 680, height: 600, backgroundColor: brand.colors.claro, padding: 16, boxShadow: "0 24px 60px rgba(28,26,23,0.35)", transform: `rotate(-2.5deg) scale(${0.85 + 0.15 * pop(2)})`, opacity: pop(2) }}>
            <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
              <Img src={staticFile(p.imagen)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.encuadre ?? "50% 50%", transform: `scale(${kb})` }} />
            </div>
          </div>
        ) : null}
        {p.arriba ? (
          <div style={{ fontFamily: fuenteManuscrita, fontSize: 64, color: t.acento, transform: `rotate(-3deg) translateY(${(1 - pop(4)) * 30}px)`, opacity: pop(4), textAlign: "center" }}>{p.arriba}</div>
        ) : null}
        <div
          style={{
            fontFamily: fuenteTitulos,
            fontWeight: 700,
            fontSize: n !== null ? 280 : p.titulo.length > 14 ? 104 : 130,
            letterSpacing: n !== null ? -8 : -2,
            lineHeight: 1,
            textAlign: "center",
            color: t.titulo,
            transform: `scale(${0.8 + 0.2 * pop(6)})`,
            opacity: pop(6),
          }}
        >
          {n !== null ? n : p.titulo}
        </div>
        <div style={{ width: 160 * pop(9), height: 4, backgroundColor: t.linea, opacity: 0.6 }} />
        {p.abajo ? (
          <div style={{ fontFamily: fuenteTitulos, fontWeight: 600, fontSize: 50, letterSpacing: 1, color: t.titulo, opacity: pop(10) * 0.9, textAlign: "center" }}>{p.abajo}</div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TomaVideo: React.FC<{ t: Toma; rotulo?: string }> = ({ t, rotulo }) => {
  const frame = useCurrentFrame();
  const dur = framesToma(t);
  const lento = interpolate(frame, [0, dur], [1, t.zoom ?? 1.06]);
  const saltos = (t.saltos ?? []).map(f);
  const cerca = saltos.filter((x) => frame >= x).length % 2 === 1;
  const z = lento * (cerca ? 1.28 : 1);
  const bn = t.bn && frame >= f(t.bn[0]) && frame < f(t.bn[1]);
  const enPantalla = (t.pantallas ?? []).some((p) => frame >= f(p.desde) && frame < f(p.hasta));
  const palabra = enPantalla ? undefined : (t.palabras ?? []).find((p, i, arr) => frame >= f(p.a) && frame < f(arr[i + 1] ? Math.min(arr[i + 1].a, p.b + 0.6) : p.b + 0.4));
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.carbon }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${(t.cx ?? 0.5) * 100}% ${(t.cy ?? 0.4) * 100}%`, filter: bn ? "grayscale(1) contrast(1.1)" : undefined }}>
        <OffthreadVideo src={staticFile(t.archivo)} trimBefore={f(t.inicio)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {rotulo ? (
        <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center", fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 58, letterSpacing: 2, color: brand.colors.claro, textShadow: "0 0 16px rgba(45,48,80,0.9), 0 0 4px rgba(45,48,80,0.9)" }}>
          {rotulo}
        </div>
      ) : null}
      {t.palabras
        ? palabra ? <Sequence from={f(palabra.a)} layout="none" key={palabra.a}><PalabraViva w={palabra.w} fuerte={!!palabra.fuerte} y={t.subY} /></Sequence> : null
        : t.subtitulos.map((s, i) => (
            <Sequence key={i} from={f(s.desde)} durationInFrames={Math.max(1, f(s.hasta - s.desde))} layout="none">
              <Subtitulo s={s} />
            </Sequence>
          ))}
      {(t.datos ?? []).map((d, i) => (
        <Sequence key={"d" + i} from={f(d.desde)} durationInFrames={Math.max(1, f(d.hasta - d.desde))} layout="none">
          <Dato d={d} />
        </Sequence>
      ))}
      {(t.pantallas ?? []).map((p, i) => (
        <Sequence key={"p" + i} from={f(p.desde)} durationInFrames={Math.max(1, f(p.hasta - p.desde))} layout="none">
          <PantallaColor p={p} />
        </Sequence>
      ))}
      {t.contador ? (
        <Sequence from={f(t.contador.desde)} durationInFrames={Math.max(1, f(t.contador.hasta - t.contador.desde))} layout="none">
          <Contador c={t.contador} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const Placa: React.FC<{ serie: string; capitulo: string; titulo: string }> = ({ serie, capitulo, titulo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 14 } });
  const b = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.azul, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 44, letterSpacing: 10, color: brand.colors.cueroClaro, opacity: a }}>
        {serie} · {capitulo}
      </div>
      <div
        style={{
          fontFamily: fuenteTitulos,
          fontWeight: 700,
          fontSize: 150,
          letterSpacing: -4,
          lineHeight: 0.95,
          color: brand.colors.claro,
          marginTop: 24,
          transform: `translateY(${(1 - b) * 40}px)`,
          opacity: b,
        }}
      >
        {titulo}
      </div>
    </AbsoluteFill>
  );
};

export const Cierre: React.FC<{ pregunta: string }> = ({ pregunta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.azul, justifyContent: "center", alignItems: "center", gap: 26, textAlign: "center" }}>
      <div style={{ fontFamily: fuenteManuscrita, fontSize: 70, color: brand.colors.cueroClaro, transform: "rotate(-3deg)", padding: "0 80px" }}>{pregunta}</div>
      <Img src={staticFile(brand.logo.sobreAzul)} style={{ width: 380, marginTop: 30, transform: `scale(${0.85 + 0.15 * a})` }} />
      <div style={{ fontFamily: fuenteTitulos, fontWeight: 700, fontSize: 96, lineHeight: 0.95, color: brand.colors.claro }}>Boina Orejeada</div>
      <div style={{ fontFamily: fuenteSegundaLinea, fontStyle: "italic", fontSize: 58, color: brand.colors.cueroClaro }}>{brand.lema}</div>
    </AbsoluteFill>
  );
};

export const Capitulo: React.FC<Props> = (p) => {
  const l = linea(p);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.carbon }}>
      {l.map((it, k) => (
        <Sequence key={k} from={it.desde} durationInFrames={it.dur}>
          <Transicion dur={it.dur} primero={k === 0}>
            {it.tipo === "toma" ? (
              <TomaVideo t={p.tomas[it.i!]} rotulo={it.i! > p.placaDespuesDe ? p.rotulo : undefined} />
            ) : it.tipo === "placa" ? (
              <Placa serie={p.serie} capitulo={p.capitulo} titulo={p.titulo} />
            ) : (
              <Cierre pregunta={p.pregunta} />
            )}
          </Transicion>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Tarjeta de dato sola, sobre fondo transparente, para usar en otro editor.
export const tarjetaSchema = z.object({ titulo: z.string(), bajada: z.string().optional() });
export const TarjetaDato: React.FC<z.infer<typeof tarjetaSchema>> = ({ titulo, bajada }) => (
  <AbsoluteFill>
    <Dato d={{ desde: 0, hasta: 3, titulo, bajada, y: 0.16 }} />
  </AbsoluteFill>
);
export const PlacaSola: React.FC<{ serie: string; capitulo: string; titulo: string }> = (p) => <Placa {...p} />;
export const CierreSolo: React.FC<{ pregunta: string }> = (p) => <Cierre {...p} />;
