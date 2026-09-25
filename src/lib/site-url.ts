import { estPlaceholder, site } from "@/config/site";

/**
 * URL publique du site. Tant que le domaine est un placeholder, on retombe sur
 * l'URL de production Vercel, puis sur localhost en développement.
 */
export function getSiteUrl(): string {
  if (!estPlaceholder(site.urlSite)) return site.urlSite;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
