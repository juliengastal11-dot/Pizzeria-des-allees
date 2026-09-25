import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

/** Dernière révision des pages légales (voir « Dernière mise à jour » de la politique de confidentialité). */
const REVISION_LEGALE = new Date("2026-09-25");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const url = (chemin: string) => new URL(chemin, base).toString();

  return [
    {
      url: url("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [site.hero.poster, ...site.photos.galerie.map((photo) => photo.src)].map(url),
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
