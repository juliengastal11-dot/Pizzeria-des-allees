import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// Bleu des Allées, comme le themeColor du layout
const BLEU_DES_ALLEES = "#051a4b";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.nom,
    // « La Pizzeria des Allées » → « Pizzeria des Allées » (tient sous l'icône)
    short_name: site.nom.replace(/^La\s+/, ""),
    description: site.seo.description,
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BLEU_DES_ALLEES,
    theme_color: BLEU_DES_ALLEES,
    categories: ["food"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
