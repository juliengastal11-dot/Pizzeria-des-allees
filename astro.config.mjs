// @ts-check
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://pizzeria-des-allees.vercel.app",
  /*
   * Polices téléchargées au moment du build et servies par le site lui-même :
   * aucune requête vers Google Fonts chez le visiteur (RGPD).
   */
  fonts: [
    // Titres : équivalent libre de Waldenburg Light (police sous licence du DESIGN.md)
    {
      provider: fontProviders.fontsource(),
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      weights: ["300 400"],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["Times New Roman", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400 600"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
});
