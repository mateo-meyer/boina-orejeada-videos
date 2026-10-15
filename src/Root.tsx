import { Composition } from "remotion";
import { ReelPromo, reelPromoSchema } from "./compositions/ReelPromo";
import {
  ClipEdit,
  calculateClipEditMetadata,
  clipEditSchema,
} from "./compositions/ClipEdit";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reel vertical 9:16 con textos animados (no necesita archivos). */}
      <Composition
        id="ReelPromo"
        component={ReelPromo}
        schema={reelPromoSchema}
        durationInFrames={FPS * 8}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          titulo: "Boina Orejeada",
          subtitulo: "Tradición criolla, hecha a mano",
          llamadoAccion: "Comprá en la tienda online",
        }}
      />

      {/* Edición automática: une clips de public/clips, recorta, agrega textos y música. */}
      <Composition
        id="ClipEdit"
        component={ClipEdit}
        schema={clipEditSchema}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={FPS * 10}
        calculateMetadata={calculateClipEditMetadata}
        defaultProps={{
          clips: [],
          musica: null,
          volumenMusica: 0.3,
          duracionTransicion: 0.4,
          textoFinal: "Boina Orejeada",
        }}
      />
    </>
  );
};
