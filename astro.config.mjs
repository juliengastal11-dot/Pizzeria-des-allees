// @ts-check
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://pizzeria-des-allees.vercel.app",
  /*
   * Polices téléchargées au moment du build et servies par le site lui-même :
   * aucune requête vers Google Fonts chez le visiteur (RGPD).
   */
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Cormorant Garamond",
      cssVariable: "--font-cormorant",
      weights: ["300 700"],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Lora",
      cssVariable: "--font-lora",
      weights: ["400 700"],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["Georgia", "serif"],
    },
  ],
});
