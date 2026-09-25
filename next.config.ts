import type { NextConfig } from "next";

/*
 * En-têtes de sécurité, sans CSP : les fenêtres TheFork et Google Maps
 * (iframes chargées à la demande) doivent continuer à fonctionner.
 */
const securite = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

/*
 * Cache d'un an pour les vidéos et images de /public.
 * ⚠ Pour remplacer une image ou une vidéo, lui donner un NOUVEAU nom de fichier
 * (ex. salle-fresque-beziers-2.jpg) et mettre à jour src/config/site.ts :
 * sinon les visiteurs (et l'optimiseur d'images) gardent l'ancienne version.
 */
const cacheLong = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
const production = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    // Mobile d'abord : téléphones 390 px en 2x/3x, puis tablettes et grands écrans (pas de 3840)
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2560],
    imageSizes: [48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securite },
      // En développement, on garde le cache par défaut pour voir tout de suite une image remplacée
      ...(production
        ? [
            { source: "/video/:path*", headers: cacheLong },
            { source: "/images/:path*", headers: cacheLong },
          ]
        : []),
    ];
  },
};

export default nextConfig;
