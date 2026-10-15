# Skillz

`editor-video` es la skill principal de este proyecto (propia, se edita aquí). Las otras 32 son de terceros que la complementan: no se editan aquí, se actualizan desde sus repositorios.

| Grupo | Skills | Origen (commit instalado) |
|---|---|---|
| Remotion oficial | remotion-* (12) | github.com/remotion-dev/skills (`7ba4dcf`) |
| Motion graphics HyperFrames | motion-graphics + hyperframes, hyperframes-animation, -creative, -core, -registry, -cli, media-use (dependencias) | github.com/heygen-com/hyperframes (`76222e4`, Apache-2.0) |
| Fundamentos de motion design | animation-principles, motion-art-direction, shot-composition, color-motion, logo-animation, motion-background, beat-sync-editing, after-effects, remotion-video | github.com/iart-ai/motion-design-skills (`3c129f7`, MIT) |
| Remotion motion graphics | remotion-motion-graphics | github.com/haidrrrry/claude-remotion-skill (`1dcbe5e`, MIT) |
| Corte | cut-video | github.com/louisedesadeleer/cut-video (`a5a87a6`, MIT) |
| Edición completa | video-use | github.com/browser-use/video-use (`43cfc56`, MIT) |

Cambios hechos al instalar:
- cut-video y video-use llevan `disable-model-invocation: true`: no se activan solas (competirían con editor-video). Se usan escribiendo /cut-video o /video-use.
- Se borraron vídeos, imágenes y demos que no usan las skills (banner, poster.html y tests de video-use).

Avisos:
- media-use (HyperFrames) envía estadísticas de uso anónimas. Para desactivarlo: `export DO_NOT_TRACK=1` en tu terminal.
- video-use necesita una clave de ElevenLabs para transcribir.
- Las funciones de voz de media-use usan APIs de HeyGen o Gemini solo si les das clave.
