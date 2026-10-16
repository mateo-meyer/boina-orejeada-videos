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

const tomaSchema = z.object({
  archivo: z.string(),
  inicio: z.number(),
  fin: z.number(),
  // Zoom lento durante la toma (1 = nada).
  zoom: z.number().optional(),
  // Centro vertical del encuadre al hacer zoom (0–1).
  cy: z.number().optional(),
  subtitulos: z.array(subtituloSchema),
  datos: z.array(datoSchema).optional(),
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
  const entra = primero ? 1 : interpolate(frame, [0, TRANS], [0, 1], { extrapolateRight: "clamp" });
  const escala = primero ? 1 : interpolate(frame, [0, TRANS + 4], [1.06, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: entra, transform: `scale(${escala})` }}>{children}</AbsoluteFill>;
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

const Dato: React.FC<{ d: z.infer<typeof datoSchema> }> = ({ d }) => {
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

const TomaVideo: React.FC<{ t: Toma }> = ({ t }) => {
  const frame = useCurrentFrame();
  const dur = framesToma(t);
  const z = interpolate(frame, [0, dur], [1, t.zoom ?? 1.06]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.carbon }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `50% ${(t.cy ?? 0.4) * 100}%` }}>
        <OffthreadVideo src={staticFile(t.archivo)} trimBefore={f(t.inicio)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {t.subtitulos.map((s, i) => (
        <Sequence key={i} from={f(s.desde)} durationInFrames={Math.max(1, f(s.hasta - s.desde))} layout="none">
          <Subtitulo s={s} />
        </Sequence>
      ))}
      {(t.datos ?? []).map((d, i) => (
        <Sequence key={"d" + i} from={f(d.desde)} durationInFrames={Math.max(1, f(d.hasta - d.desde))} layout="none">
          <Dato d={d} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Placa: React.FC<{ serie: string; capitulo: string; titulo: string }> = ({ serie, capitulo, titulo }) => {
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

const Cierre: React.FC<{ pregunta: string }> = ({ pregunta }) => {
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
              <TomaVideo t={p.tomas[it.i!]} />
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
