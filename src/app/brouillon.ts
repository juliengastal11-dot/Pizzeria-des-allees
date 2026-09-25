import { estPlaceholder, site } from "@/config/site";

/**
 * Vrai tant que le site est un brouillon : domaine définitif encore inconnu
 * (placeholder dans site.urlSite) ou déploiement de prévisualisation Vercel.
 * Les moteurs de recherche sont alors priés de ne rien indexer (robots.txt et
 * balise meta robots). Renseigner site.urlSite suffit à lever l'interdiction.
 */
export function estBrouillon(): boolean {
  if (estPlaceholder(site.urlSite)) return true;
  const environnement = process.env.VERCEL_ENV;
  return environnement !== undefined && environnement !== "production";
}
