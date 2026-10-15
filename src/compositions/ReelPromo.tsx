import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { brand } from "../brand";
import { fuenteSegundaLinea, fuenteTitulos } from "../fonts";

export const reelPromoSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  llamadoAccion: z.string(),
});

// Aparición suave desde abajo (sin rebote: estilo sobrio).
const Entrada: React.FC<{
  children: React.ReactNode;
  style: React.CSSProperties;
}> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 200 } });
  const translateY = interpolate(progress, [0, 1], [60, 0]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "0 80px",
        opacity: progress,
        transform: `translateY(${translateY}px)`,
        ...style,
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
    <AbsoluteFill style={{ backgroundColor: brand.colors.claro }}>
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 36 }}
      >
        <Sequence layout="none">
          <Entrada style={{}}>
            <Img
              src={staticFile(brand.logo.transparente)}
              style={{ width: 300 }}
            />
          </Entrada>
        </Sequence>
        <Sequence from={Math.round(fps * 0.4)} layout="none">
          <Entrada
            style={{
              fontFamily: fuenteTitulos,
              fontWeight: 700,
              fontSize: 120,
              lineHeight: 0.95,
              color: brand.colors.azul,
            }}
          >
            {titulo}
          </Entrada>
        </Sequence>
        <Sequence from={Math.round(fps * 1.2)} layout="none">
          <Entrada
            style={{
              fontFamily: fuenteSegundaLinea,
              fontStyle: "italic",
              fontSize: 72,
              color: brand.colors.cuero,
            }}
          >
            {subtitulo}
          </Entrada>
        </Sequence>
      </AbsoluteFill>
      <Sequence from={fps * 4}>
        <AbsoluteFill
          style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}
        >
          <Entrada
            style={{
              backgroundColor: brand.colors.azul,
              borderRadius: 24,
              padding: "28px 48px",
              fontFamily: fuenteTitulos,
              fontWeight: 700,
              fontSize: 52,
              color: brand.colors.claro,
            }}
          >
            {llamadoAccion}
          </Entrada>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
