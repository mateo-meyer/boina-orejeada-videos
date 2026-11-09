// Video hablado a cámara (Día de la Tradición): tomas 9:16 con su audio,
// transiciones fluidas (whip pan y zoom-through), punch-ins suaves hacia la cara,
// subtítulos chicos debajo de la cara y zoom final al logo del termo.
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
  Easing,
} from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteInter, fuentePlayfair } from "../fonts";

const palabraSchema = z.object({ w: z.string(), a: z.number(), b: z.number(), clave: z.boolean().optional() });
const frase = z.array(palabraSchema);

const tomaSchema = z.object({
  archivo: z.string(),
  inicio: z.number(),
  fin: z.number(),
  // Centro de la cara (0–1): los zooms van hacia ahí.
  cx: z.number(),
  cy: z.number(),
  // Escala base y zoom lento hasta "zoom".
  base: z.number().optional(),
  zoom: z.number().optional(),
  // Punch-ins suaves (t en s del archivo original) que quedan hasta el final de la toma.
  punch: z.array(z.object({ t: z.number(), z: z.number() })).optional(),
  frases: z.array(frase),
  // Altura de los subtítulos (px desde arriba).
  subY: z.number().optional(),
  // Transición con la toma siguiente.
  salida: z.enum(["whipIzq", "whipDer", "zoom", "fundido"]).optional(),
  // Solo la última: cambia a una versión 4K (sin audio) desde "en" y hace zoom a un punto.
  final: z
    .object({
      archivo4k: z.string(),
      en: z.number(),
      congelado: z.string(),
      congelar: z.number(),
      zoomDesde: z.number(),
      px: z.number(),
      py: z.number(),
      escala: z.number(),
    })
    .optional(),
});

export const tradicionSchema = z.object({
  tomas: z.array(tomaSchema),
  etiqueta: z.string().optional(),
  cierreTitulo: z.string(),
  cierreBajada: z.string(),
  duracionCierre: z.number(),
  filtro: z.string(),
});

type Props = z.infer<typeof tradicionSchema>;
type Toma = z.infer<typeof tomaSchema>;

const FPS = 30;
const TR = 9; // cuadros de transición
const f = (s: number) => Math.round(s * FPS);
const durToma = (t: Toma) => f(t.fin - t.inicio) + (t.final ? f(t.final.congelar) : 0);

const linea = (p: Props) => {
  let desde = 0;
  const items = p.tomas.map((t) => {
    const o = { desde, dur: durToma(t) };
    desde += o.dur - TR;
    return o;
  });
  return { items, cierreDesde: desde };
};

export const calculateTradicionMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  const { cierreDesde } = linea(props);
  return { durationInFrames: cierreDesde + f(props.duracionCierre) };
};

const easeIn = Easing.bezier(0.55, 0, 0.9, 0.4);
const easeOut = Easing.bezier(0.1, 0.6, 0.45, 1);
const easeWhip = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Estilo de entrada/salida de un bloque según la transición.
const estiloTransicion = (frame: number, dur: number, entrada: Toma["salida"] | undefined, salida: Toma["salida"] | undefined) => {
  let tx = 0;
  let s = 1;
  let blur = 0;
  let op = 1;
  if (entrada && frame < TR) {
    const k = interpolate(frame, [0, TR], [1, 0], { ...cl, easing: easeOut });
    // Mismo recorrido continuo que la toma que sale, así no queda hueco entre las dos.
    const w = 1 - interpolate(frame, [0, TR], [0, 1], { ...cl, easing: easeWhip });
    if (entrada === "whipIzq") tx += 100 * w;
    if (entrada === "whipDer") tx -= 100 * w;
    if (entrada === "whipIzq" || entrada === "whipDer") blur = Math.max(blur, 64 * Math.sin((Math.PI * w) / 2));
    if (entrada === "zoom") {
      s *= 1 + 0.6 * k;
      op = interpolate(frame, [0, TR * 0.5], [0, 1], cl);
    }
    if (entrada === "fundido") op = 1 - k;
    blur = Math.max(blur, (entrada === "fundido" ? 0 : 36) * k);
  }
  if (salida && frame > dur - TR) {
    const k = interpolate(frame, [dur - TR, dur], [0, 1], { ...cl, easing: easeIn });
    const w = interpolate(frame, [dur - TR, dur], [0, 1], { ...cl, easing: easeWhip });
    if (salida === "whipIzq") tx -= 100 * w;
    if (salida === "whipDer") tx += 100 * w;
    if (salida === "whipIzq" || salida === "whipDer") blur = Math.max(blur, 64 * Math.sin(Math.PI * w / 2));
    if (salida === "zoom") s *= 1 + 1.4 * k;
    blur = Math.max(blur, (salida === "fundido" ? 0 : 36) * k);
  }
  return { tx, s, blur, op };
};

const Subtitulo: React.FC<{ palabras: z.infer<typeof frase>; desde: number; y: number }> = ({ palabras, desde, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = desde + frame / fps; // segundos del archivo
  const pop = spring({ frame, fps, config: { damping: 16, stiffness: 240 }, durationInFrames: 7 });
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 820,
          padding: "12px 24px 14px",
          borderRadius: 14,
          backgroundColor: "rgba(45,48,80,0.88)",
          boxShadow: "0 6px 18px rgba(28,26,23,0.28)",
          textAlign: "center",
          lineHeight: 1.15,
          opacity: pop,
          transform: `translateY(${(1 - pop) * 14}px)`,
        }}
      >
        {palabras.map((p, i) => {
          const dicha = t >= p.a - 0.04;
          const k = interpolate(t, [p.a - 0.04, p.a + 0.1], [0, 1], cl);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: i < palabras.length - 1 ? "0.28em" : 0,
                fontFamily: p.clave ? fuentePlayfair : fuenteInter,
                fontStyle: p.clave ? "italic" : "normal",
                fontWeight: p.clave ? 700 : 600,
                fontSize: p.clave ? 50 : 44,
                color: p.clave ? brand.colors.cueroClaro : brand.colors.claro,
                opacity: dicha ? 0.35 + 0.65 * k : 0.35,
                transform: `translateY(${(1 - k) * 4}px)`,
              }}
            >
              {p.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Etiqueta: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const a = spring({ frame: frame - 4, fps, config: { damping: 16 } });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", opacity: a * out }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: fuenteInter,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: brand.colors.azul,
          backgroundColor: brand.colors.crema,
          padding: "10px 24px",
          borderRadius: 999,
          transform: `translateY(${(1 - a) * -16}px)`,
        }}
      >
        {texto}
      </span>
    </div>
  );
};

const TomaVideo: React.FC<{ t: Toma; dur: number; entrada?: Toma["salida"]; filtro: string; ultima: boolean }> = ({ t, dur, entrada, filtro, ultima }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tSeg = t.inicio + frame / fps;
  const finVideo = f(t.fin - t.inicio);

  // Zoom lento + punch-ins suaves hacia la cara.
  const lento = interpolate(frame, [0, finVideo], [t.base ?? 1, t.zoom ?? (t.base ?? 1) * 1.05], cl);
  const punch = (t.punch ?? []).reduce((acc, p) => acc * (1 + (p.z - 1) * spring({ frame: frame - f(p.t - t.inicio), fps, config: { damping: 20, stiffness: 90 } })), 1);
  let escala = lento * punch;
  let tx = 0;
  let ty = 0;

  // Zoom final al logo: con origen centrado, pasa de "fijo en la cara" a "logo al centro".
  if (t.final) {
    const k = interpolate(frame, [f(t.final.zoomDesde - t.inicio), dur], [0, 1], { ...cl, easing: Easing.bezier(0.45, 0, 0.25, 1) });
    escala = escala * (1 + (t.final.escala - 1) * k);
    const caraX = (t.cx - 0.5) * (1 - escala);
    const caraY = (t.cy - 0.5) * (1 - escala);
    const logoX = -(t.final.px - 0.5) * escala;
    const logoY = -(t.final.py - 0.5) * escala;
    tx = (caraX * (1 - k) + logoX * k) * 100;
    ty = (caraY * (1 - k) + logoY * k) * 100;
  }

  const tr = estiloTransicion(frame, dur, entrada, ultima ? undefined : t.salida);
  const vol = interpolate(frame, [0, 4, finVideo - 6, finVideo], [0, 1, 1, 0], cl);

  // Frase activa.
  const fr = t.frases.findIndex((ph, i) => {
    const sig = t.frases[i + 1];
    const fin = sig ? sig[0].a - 0.02 : ph[ph.length - 1].b + 0.35;
    return tSeg >= ph[0].a - 0.05 && tSeg < fin;
  });
  const enZoomFinal = t.final ? tSeg > t.final.zoomDesde + 0.6 : false;

  const transformVideo = t.final
    ? `translate(${tx}%, ${ty}%) scale(${escala})`
    : `scale(${escala})`;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateX(${tr.tx}%) scale(${tr.s})`,
          filter: tr.blur > 0.5 ? `blur(${tr.blur}px)` : undefined,
          opacity: tr.op,
        }}
      >
        <AbsoluteFill style={{ transform: transformVideo, transformOrigin: t.final ? "50% 50%" : `${t.cx * 100}% ${t.cy * 100}%`, filter: filtro }}>
          <Sequence durationInFrames={finVideo} layout="none">
            <OffthreadVideo src={staticFile(t.archivo)} trimBefore={f(t.inicio)} volume={vol} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
          {t.final ? (
            <>
              <Sequence from={f(t.final.en - t.inicio)} durationInFrames={finVideo - f(t.final.en - t.inicio)} layout="none">
                <AbsoluteFill>
                  <OffthreadVideo src={staticFile(t.final.archivo4k)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </AbsoluteFill>
              </Sequence>
              <Sequence from={finVideo} layout="none">
                <AbsoluteFill>
                  <Img src={staticFile(t.final.congelado)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </AbsoluteFill>
              </Sequence>
            </>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
      {fr >= 0 && !enZoomFinal && !(t.salida && !ultima && frame > dur - TR + 2) ? (
        <Sequence from={Math.max(0, f(t.frases[fr][0].a - 0.05 - t.inicio))} layout="none" key={fr}>
          <Subtitulo palabras={t.frases[fr]} desde={Math.max(t.inicio, t.frases[fr][0].a - 0.05)} y={t.subY ?? 1320} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const Cierre: React.FC<{ titulo: string; bajada: string }> = ({ titulo, bajada }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = interpolate(frame, [0, TR], [0, 1], cl);
  const a = spring({ frame: frame - 4, fps, config: { damping: 15 } });
  const b = spring({ frame: frame - 10, fps, config: { damping: 15 } });
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.azul, opacity: entra, justifyContent: "center", alignItems: "center", textAlign: "center", gap: 30 }}>
      <Img src={staticFile(brand.logo.sobreAzul)} style={{ width: 460, transform: `scale(${1.25 - 0.25 * a})`, opacity: a }} />
      <div style={{ fontFamily: fuentePlayfair, fontWeight: 700, fontSize: 92, lineHeight: 1.02, color: brand.colors.claro, padding: "0 80px", transform: `translateY(${(1 - b) * 30}px)`, opacity: b }}>
        {titulo}
      </div>
      <div style={{ width: 140 * b, height: 3, backgroundColor: brand.colors.cueroClaro, opacity: 0.8 }} />
      <div style={{ fontFamily: fuenteInter, fontWeight: 600, fontSize: 34, letterSpacing: 6, textTransform: "uppercase", color: brand.colors.cueroClaro, opacity: b }}>{bajada}</div>
    </AbsoluteFill>
  );
};

export const Tradicion: React.FC<Props> = (p) => {
  const { items, cierreDesde } = linea(p);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.carbon }}>
      {items.map((it, k) => (
        <Sequence key={k} from={it.desde} durationInFrames={it.dur}>
          <TomaVideo t={p.tomas[k]} dur={it.dur} entrada={k > 0 ? p.tomas[k - 1].salida : undefined} filtro={p.filtro} ultima={k === items.length - 1} />
        </Sequence>
      ))}
      {p.etiqueta ? (
        <Sequence from={0} durationInFrames={items[0].dur - TR}>
          <Etiqueta texto={p.etiqueta} />
        </Sequence>
      ) : null}
      <Sequence from={cierreDesde}>
        <Cierre titulo={p.cierreTitulo} bajada={p.cierreBajada} />
      </Sequence>
    </AbsoluteFill>
  );
};
