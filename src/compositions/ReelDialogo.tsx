// Reel de "diálogo con uno mismo": cortes secos, placas de color que interrumpen,
// textos de una o dos palabras (flanqueando a la persona, al centro o abajo),
// punch-in en los "PARÁ", transición a marco claro y cierre de marca.
// Sin audio: la voz en off se graba aparte siguiendo los textos.
import { Fragment } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteManuscrita, fuenteSegundaLinea, fuenteTitulos } from "../fonts";

const parteSchema = z.object({
  texto: z.string(),
  // "fuerte" = palabra clave en negrita; "fina" = palabras de unión.
  peso: z.enum(["fuerte", "fina"]).optional(),
});

const textoSchema = z.object({
  // Segundos relativos al inicio del segmento.
  desde: z.number().min(0),
  hasta: z.number().positive(),
  // "flanco": la primera parte a la izquierda de la persona y el resto a la derecha.
  lugar: z.enum(["centro", "flanco", "abajo", "arriba"]),
  partes: z.array(parteSchema).min(1),
  // Prende y apaga cada 0,1 s (el "che" del arranque).
  parpadeo: z.boolean().optional(),
  // Alto del texto en "flanco"/"centro", en fracción del alto (0 = arriba).
  y: z.number().min(0).max(1).optional(),
  tamano: z.number().positive().optional(),
});

const segmentoSchema = z.object({
  tipo: z.enum(["video", "placa", "marco"]),
  duracion: z.number().positive(),
  // Video (tipo "video" y "marco")
  archivo: z.string().optional(),
  inicio: z.number().min(0).optional(),
  // Centro horizontal del recorte 9:16, en fracción del ancho del clip (0–1).
  cx: z.number().min(0).max(1).optional(),
  // Si está, el recorte se desplaza de cx a cxFin (para seguir a quien camina).
  cxFin: z.number().min(0).max(1).optional(),
  // Centro vertical del recorte cuando hay zoom (0–1).
  cy: z.number().min(0).max(1).optional(),
  zoom: z.number().min(1).optional(),
  // Zoom de golpe al 125 % ("PARÁ").
  punchIn: z.boolean().optional(),
  // Placa
  fondo: z.enum(["azul", "crema"]).optional(),
  // Nota a mano (máximo una en todo el video).
  notaAMano: z.string().optional(),
  textos: z.array(textoSchema).optional(),
});

export const reelDialogoSchema = z.object({
  segmentos: z.array(segmentoSchema),
  textoFinal: z.string(),
  duracionCierre: z.number().positive(),
});

type Props = z.infer<typeof reelDialogoSchema>;
type Segmento = z.infer<typeof segmentoSchema>;
type Texto = z.infer<typeof textoSchema>;

const ANCHO = 1080;
const ALTO = 1920;

const framesDe = (s: number, fps: number) => Math.max(1, Math.round(s * fps));

export const calculateReelDialogoMetadata: CalculateMetadataFunction<Props> = ({
  props,
}) => {
  const fps = 30;
  const total =
    props.segmentos.reduce((a, s) => a + framesDe(s.duracion, fps), 0) +
    framesDe(props.duracionCierre, fps);
  return { durationInFrames: total };
};

// Los clips son 16:9; se recorta una ventana 9:16 que se puede mover en x.
const VideoRecortado: React.FC<{ seg: Segmento; anchoClip?: number }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = framesDe(seg.duracion, fps);
  const cx = interpolate(frame, [0, dur - 1], [seg.cx ?? 0.5, seg.cxFin ?? seg.cx ?? 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const zoom = (seg.zoom ?? 1) * (seg.punchIn ? 1.25 : 1);
  // El clip se escala para que su alto llene el cuadro: 16:9 a 1920 de alto = 3413 de ancho.
  const altoClip = ALTO * zoom;
  const anchoClip = (altoClip * 16) / 9;
  const left = Math.min(0, Math.max(ANCHO - anchoClip, ANCHO / 2 - cx * anchoClip));
  const cy = seg.cy ?? 0.5;
  const top = Math.min(0, Math.max(ALTO - altoClip, ALTO / 2 - cy * altoClip));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: brand.colors.carbon }}>
      <OffthreadVideo
        src={staticFile(seg.archivo!)}
        trimBefore={Math.round((seg.inicio ?? 0) * fps)}
        muted
        style={{ position: "absolute", left, top, width: anchoClip, height: altoClip }}
      />
    </AbsoluteFill>
  );
};

const sombra = "0 0 28px rgba(28,26,23,0.75), 0 2px 6px rgba(28,26,23,0.6)";

const Palabra: React.FC<{ parte: z.infer<typeof parteSchema>; color: string; tamano: number; sobreVideo: boolean }> = ({
  parte,
  color,
  tamano,
  sobreVideo,
}) => (
  <span
    style={{
      fontFamily: fuenteTitulos,
      fontWeight: parte.peso === "fina" ? 400 : 700,
      fontSize: parte.peso === "fina" ? tamano * 0.82 : tamano,
      lineHeight: 0.95,
      letterSpacing: parte.peso === "fina" ? 0 : -1,
      color,
      textShadow: sobreVideo ? sombra : undefined,
      whiteSpace: "nowrap",
    }}
  >
    {parte.texto}
  </span>
);

const CapaTexto: React.FC<{ t: Texto; color: string; sobreVideo: boolean }> = ({ t, color, sobreVideo }) => {
  const frame = useCurrentFrame();
  if (t.parpadeo && Math.floor(frame / 3) % 2 === 1) {
    return null;
  }
  const tamano = t.tamano ?? (t.lugar === "centro" ? 150 : t.lugar === "flanco" ? 78 : 84);
  const y = t.y ?? (t.lugar === "flanco" ? 0.47 : 0.5);

  if (t.lugar === "flanco") {
    const [izq, ...der] = t.partes;
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", top: y * ALTO, right: ANCHO / 2 + 125, transform: "translateY(-50%)" }}>
          <Palabra parte={izq} color={color} tamano={tamano} sobreVideo={sobreVideo} />
        </div>
        <div
          style={{
            position: "absolute",
            top: y * ALTO,
            left: ANCHO / 2 + 125,
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {der.map((p, i) => (
            <Palabra key={i} parte={p} color={color} tamano={tamano} sobreVideo={sobreVideo} />
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  const top = t.lugar === "arriba" ? 330 : t.lugar === "abajo" ? 1420 : y * ALTO;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top,
          left: 70,
          right: 70,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          flexWrap: "wrap",
          columnGap: t.lugar === "abajo" ? 36 : 28,
          rowGap: 10,
          textAlign: "center",
        }}
      >
        {t.partes.map((p, i) => (
          <Palabra key={i} parte={p} color={color} tamano={tamano} sobreVideo={sobreVideo} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Textos: React.FC<{ seg: Segmento; color: string; sobreVideo: boolean }> = ({ seg, color, sobreVideo }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {(seg.textos ?? []).map((t, i) => (
        <Sequence key={i} from={framesDe(t.desde, fps)} durationInFrames={framesDe(t.hasta - t.desde, fps)} layout="none">
          <CapaTexto t={t} color={color} sobreVideo={sobreVideo} />
        </Sequence>
      ))}
    </>
  );
};

// Zoom-out: el plano siguiente aparece chico dentro de un marco claro.
const Marco: React.FC<{ seg: Segmento }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = framesDe(seg.duracion, fps);
  const escala = interpolate(frame, [0, dur], [1, 0.72], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.claro }}>
      <AbsoluteFill style={{ transform: `scale(${escala})`, overflow: "hidden", borderRadius: 6 }}>
        <VideoRecortado seg={seg} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Placa: React.FC<{ seg: Segmento }> = ({ seg }) => {
  const azul = seg.fondo !== "crema";
  return (
    <AbsoluteFill style={{ backgroundColor: azul ? brand.colors.azul : brand.colors.crema }}>
      <Textos seg={seg} color={azul ? brand.colors.claro : brand.colors.azul} sobreVideo={false} />
    </AbsoluteFill>
  );
};

const NotaAMano: React.FC<{ texto: string }> = ({ texto }) => (
  <div
    style={{
      position: "absolute",
      top: 640,
      left: ANCHO / 2 + 30,
      transform: "rotate(-8deg)",
      fontFamily: fuenteManuscrita,
      fontSize: 110,
      color: brand.colors.claro,
      textShadow: sombra,
    }}
  >
    {texto}
  </div>
);

const Cierre: React.FC<{ textoFinal: string }> = ({ textoFinal }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.azul,
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <div style={{ opacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Img src={staticFile(brand.logo.sobreAzul)} style={{ width: 560 }} />
        <div style={{ color: brand.colors.claro, fontSize: 104, fontWeight: 700, lineHeight: 0.95, fontFamily: fuenteTitulos }}>
          {textoFinal}
        </div>
        <div style={{ color: brand.colors.cueroClaro, fontSize: 62, fontStyle: "italic", fontFamily: fuenteSegundaLinea }}>
          {brand.lema}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelDialogo: React.FC<Props> = ({ segmentos, textoFinal, duracionCierre }) => {
  const { fps } = useVideoConfig();
  let desde = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.carbon }}>
      {segmentos.map((seg, i) => {
        const dur = framesDe(seg.duracion, fps);
        const inicio = desde;
        desde += dur;
        return (
          <Sequence key={i} from={inicio} durationInFrames={dur}>
            {seg.tipo === "placa" ? (
              <Placa seg={seg} />
            ) : seg.tipo === "marco" ? (
              <Marco seg={seg} />
            ) : (
              <Fragment>
                <VideoRecortado seg={seg} />
                {seg.notaAMano ? <NotaAMano texto={seg.notaAMano} /> : null}
                <Textos seg={seg} color={brand.colors.claro} sobreVideo />
              </Fragment>
            )}
          </Sequence>
        );
      })}
      <Sequence from={desde} durationInFrames={framesDe(duracionCierre, fps)}>
        <Cierre textoFinal={textoFinal} />
      </Sequence>
    </AbsoluteFill>
  );
};
