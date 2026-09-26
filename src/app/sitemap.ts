import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

/** Dates fixes tenues dans la configuration (et non la date de la requête) : un vrai signal pour les moteurs. */
const REVISION_ACCUEIL = new Date(site.seo.derniereMiseAJour);
const REVISION_LEGALE = new Date(site.legal.miseAJour);

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const url = (chemin: string) => new URL(chemin, base).toString();

  return [
    {
      url: url("/"),
      lastModified: REVISION_ACCUEIL,
      changeFrequency: "weekly",
      priority: 1,
      images: [site.seo.image.src, site.hero.vues[0].poster, ...site.photos.galerie.map((photo) => photo.src)].map(url),
    },
    {
      url: url("/mentions-legales"),
      lastModified: REVISION_LEGALE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: url("/confidentialite"),
      lastModified: REVISION_LEGALE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
