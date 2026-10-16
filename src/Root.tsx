import { Composition, Still } from "remotion";
import { Portada, portadaSchema } from "./compositions/Portada";
import { Capitulo, calculateCapituloMetadata, capituloSchema } from "./compositions/Capitulo";
import { ReelPromo, reelPromoSchema } from "./compositions/ReelPromo";
import {
  ClipEdit,
  calculateClipEditMetadata,
  clipEditSchema,
} from "./compositions/ClipEdit";
import {
  ReelDialogo,
  calculateReelDialogoMetadata,
  reelDialogoSchema,
} from "./compositions/ReelDialogo";

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
          subtitulo: "Tradición que nos representa",
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

      {/* Reel de diálogo con uno mismo (Reel 1): placas, textos que flanquean, punch-in. Sin audio. */}
      <Composition
        id="ReelDialogo"
        component={ReelDialogo}
        schema={reelDialogoSchema}
        fps={FPS}
        width={1080}
        height={1920}
        durationInFrames={FPS * 10}
        calculateMetadata={calculateReelDialogoMetadata}
        defaultProps={{ formato: "horizontal", segmentos: [], textoFinal: "Boina Orejeada", duracionCierre: 1.5 }}
      />
      <Composition
        id="Capitulo"
        component={Capitulo}
        schema={capituloSchema}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={300}
        calculateMetadata={calculateCapituloMetadata}
        defaultProps={{ serie: "RAÍCES", capitulo: "Capítulo 1", titulo: "Balderrama", placaDespuesDe: 0, duracionPlaca: 1.5, tomas: [], pregunta: "", duracionCierre: 2.5 }}
      />
      <Still
        id="Portada"
        component={Portada}
        schema={portadaSchema}
        width={1080}
        height={1920}
        defaultProps={{
          fondo: "portada/raices-fondo.jpg",
          encuadre: "60% 50%",
          titulo: "RAÍCES",
          etiquetas: ["historias…", "leyendas…", "canciones…"],
          nota: "próximamente",
          variante: "polaroid",
        }}
      />
      <Still
        id="PortadaHorizontal"
        component={Portada}
        schema={portadaSchema}
        width={1920}
        height={1080}
        defaultProps={{
          fondo: "portada/raices-fondo.jpg",
          encuadre: "60% 50%",
          titulo: "RAÍCES",
          etiquetas: ["historias…", "leyendas…", "canciones…"],
          nota: "próximamente",
          variante: "tira",
        }}
      />
    </>
  );
};
