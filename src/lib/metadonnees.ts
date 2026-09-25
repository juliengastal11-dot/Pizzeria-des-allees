import type { Metadata } from "next";
import { site } from "@/config/site";

/** Image des partages (réseaux sociaux, messageries), décrite dans site.seo.image. */
export const imagePartage = {
  url: site.seo.image.src,
  width: site.seo.image.largeur,
  height: site.seo.image.hauteur,
  alt: site.seo.image.alt,
  type: "image/jpeg",
};

/**
 * Open Graph et Twitter complets pour une page. Next remplace ces objets en
 * entier d'un niveau à l'autre : chaque page les redonne, image comprise.
 */
export function partage({ titre, description, chemin }: { titre: string; description: string; chemin: string }): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: site.nom,
      title: titre,
      description,
      url: chemin,
      images: [imagePartage],
    },
    twitter: { card: "summary_large_image", title: titre, description, images: [imagePartage] },
  };
}
