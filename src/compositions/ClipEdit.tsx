import { Fragment } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { parseMedia } from "@remotion/media-parser";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteTitulos } from "../fonts";

const clipSchema = z.object({
  // Ruta relativa a public/, por ejemplo "clips/toma1.mp4", o una URL https://
  archivo: z.string(),
  // Recorte en segundos. Si falta "fin", se usa hasta el final del clip.
  inicio: z.number().min(0).optional(),
  fin: z.number().positive().optional(),
  // Texto que aparece sobre el clip (subtítulo / zócalo).
  texto: z.string().optional(),
  silenciar: z.boolean().optional(),
});

export const clipEditSchema = z.object({
  clips: z.array(clipSchema),
  musica: z.string().nullable(),
  volumenMusica: z.number().min(0).max(1),
  duracionTransicion: z.number().min(0),
  textoFinal: z.string(),
});

type Props = z.infer<typeof clipEditSchema>;
type Clip = z.infer<typeof clipSchema>;

const CIERRE_SEGUNDOS = 2;

const resolver = (src: string) =>
  src.startsWith("http") ? src : staticFile(src);

const segundosDeClip = async (clip: Clip): Promise<number> => {
  const inicio = clip.inicio ?? 0;
  if (clip.fin !== undefined) {
    return clip.fin - inicio;
  }
  const { slowDurationInSeconds } = await parseMedia({
    src: resolver(clip.archivo),
    fields: { slowDurationInSeconds: true },
    acknowledgeRemotionLicense: true,
  });
  return slowDurationInSeconds - inicio;
};

const framesDeClip = (clip: Clip, fps: number) =>
  Math.max(1, Math.floor(((clip.fin ?? (clip.inicio ?? 0) + 3) - (clip.inicio ?? 0)) * fps));

// Calcula la duración total del video a partir de los clips.
export const calculateClipEditMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const fps = 30;
  const duraciones = await Promise.all(props.clips.map(segundosDeClip));
  // Completa "fin" en cada clip para que el componente sepa cuánto dura.
  const clips = props.clips.map((c, i) => ({
    ...c,
    inicio: c.inicio ?? 0,
    fin: (c.inicio ?? 0) + duraciones[i],
  }));
  const frames = clips.map((c) => framesDeClip(c, fps));
  const transicion = Math.round(props.duracionTransicion * fps);
  const solapamiento = transicion * Math.max(0, frames.length - 1);
  const total =
    frames.reduce((a, b) => a + b, 0) - solapamiento + CIERRE_SEGUNDOS * fps;

  return {
    durationInFrames: Math.max(total, fps),
    props: { ...props, clips },
  };
};

const Zocalo: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}
    >
      <div
        style={{
          opacity,
          backgroundColor: "rgba(0,0,0,0.55)",
          color: brand.colors.light,
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 58,
          padding: "18px 36px",
          borderRadius: 16,
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

export const ClipEdit: React.FC<Props> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const { clips, musica, volumenMusica, duracionTransicion, textoFinal } = props;
  const frames = clips.map((c) => framesDeClip(c, fps));
  const transicion = Math.round(duracionTransicion * fps);
  const cierre = CIERRE_SEGUNDOS * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {clips.map((clip, i) => (
          <Fragment key={i}>
            {i > 0 && transicion > 0 ? (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: transicion })}
              />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={frames[i]}>
              <OffthreadVideo
                src={resolver(clip.archivo)}
                trimBefore={Math.round((clip.inicio ?? 0) * fps)}
                muted={clip.silenciar ?? false}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {clip.texto ? <Zocalo texto={clip.texto} /> : null}
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
        <TransitionSeries.Sequence durationInFrames={cierre}>
          <AbsoluteFill
            style={{
              backgroundColor: brand.colors.primary,
              justifyContent: "center",
              alignItems: "center",
              color: brand.colors.light,
              fontSize: 110,
              fontWeight: 700,
              fontFamily: fuenteTitulos,
            }}
          >
            {textoFinal}
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {musica ? (
        <Sequence durationInFrames={durationInFrames}>
          <Audio
            src={resolver(musica)}
            volume={(f) =>
              volumenMusica *
              interpolate(f, [durationInFrames - fps, durationInFrames], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
