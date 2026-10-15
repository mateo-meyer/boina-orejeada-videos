// Identidad visual de Boina Orejeada, según la Ficha de marca (octubre 2026).
export const brand = {
  name: "Boina Orejeada",
  lema: "Tradición que nos representa",
  colors: {
    azul: "#2D3050", // Azul boina: acento principal, fondos fuertes, títulos sobre claro
    claro: "#FBF7F1", // Fondo del logo: portadas y placas con logo
    crema: "#EFE6D6", // Fondo de placas de contenido
    carbon: "#1C1A17", // Negro carbón: textos
    marron: "#6B4A2F", // Marrón tierra: fondos y acentos
    cuero: "#9C6B3E", // Detalles, subtítulos
    cueroClaro: "#D9B48A", // Textos chicos o segunda línea sobre azul
    verde: "#5E5E3F", // Verde seco: acento ocasional
  },
  // Logos en public/logo. Sobre fondos oscuros usar siempre "sobreAzul".
  logo: {
    original: "logo/logo-original.png",
    transparente: "logo/logo-transparente.png",
    sobreAzul: "logo/logo-sobre-azul.png",
  },
} as const;
