import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteTitulos as fontFamily } from "../fonts";

export const reelPromoSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  llamadoAccion: z.string(),
});

const Entrada: React.FC<{ children: React.ReactNode; size: number }> = ({
  children,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 200 } });
  const translateY = interpolate(progress, [0, 1], [60, 0]);

  return (
    <div
      style={{
        fontFamily,
        fontSize: size,
        fontWeight: 700,
        color: brand.colors.text,
        textAlign: "center",
        padding: "0 80px",
        opacity: progress,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const ReelPromo: React.FC<z.infer<typeof reelPromoSchema>> = ({
  titulo,
  subtitulo,
  llamadoAccion,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.background }}>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 40 }}
      >
        <Sequence layout="none">
          <Entrada size={120}>{titulo}</Entrada>
        </Sequence>
        <Sequence from={Math.round(fps * 0.8)} layout="none">
          <Entrada size={60}>{subtitulo}</Entrada>
        </Sequence>
      </AbsoluteFill>
      <Sequence from={fps * 4}>
        <AbsoluteFill
          style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}
        >
          <div
            style={{
              backgroundColor: brand.colors.primary,
              borderRadius: 24,
              padding: "28px 48px",
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: 52,
                color: brand.colors.light,
              }}
            >
              {llamadoAccion}
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
