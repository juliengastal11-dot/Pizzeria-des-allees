import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { estBrouillon } from "./brouillon";

export default function robots(): MetadataRoute.Robots {
  // Brouillon (domaine à venir, prévisualisation) : rien à indexer, pas de sitemap annoncé
  if (estBrouillon()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
