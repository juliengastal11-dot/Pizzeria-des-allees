import { estPlaceholder, site } from "@/config/site";
import { openingHoursSpecification } from "@/lib/horaires";
import { getSiteUrl } from "@/lib/site-url";

/** Données structurées schema.org de type Restaurant (SEO local). */
export function restaurantJsonLd() {
  const url = getSiteUrl();
  const reel = (v: string) => (estPlaceholder(v) ? undefined : v);
  const horaires = openingHoursSpecification();

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}/#restaurant`,
    name: site.nom,
    url,
    image: [`${url}/opengraph-image.jpg`, `${url}${site.photos.galerie[0].src}`],
    logo: `${url}${site.logo.src}`,
    description: site.seo.description,
    servesCuisine: ["Pizza", "Cuisine méditerranéenne"],
    priceRange: site.seo.fourchettePrix,
    telephone: reel(site.telephone),
    email: reel(site.email),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adresse.rue,
      postalCode: site.adresse.codePostal,
      addressLocality: site.adresse.ville,
      addressRegion: "Occitanie",
      addressCountry: site.adresse.pays,
    },
    hasMap: site.liens.itineraire,
    acceptsReservations: site.liens.reserver,
    hasMenu: reel(site.liens.commander),
    paymentAccepted: site.paiements.join(", "),
    areaServed: site.livraison.communes.map((c) => ({ "@type": "City", name: c })),
    openingHoursSpecification: horaires.length ? horaires : undefined,
    potentialAction: [
      {
        "@type": "ReserveAction",
        target: { "@type": "EntryPoint", urlTemplate: site.liens.reserver, inLanguage: "fr" },
        result: { "@type": "FoodEstablishmentReservation", name: "Réserver une table" },
      },
      ...(reel(site.liens.commander)
        ? [
            {
              "@type": "OrderAction",
              target: { "@type": "EntryPoint", urlTemplate: site.liens.commander, inLanguage: "fr" },
            },
          ]
        : []),
    ],
    sameAs: [site.reseaux.instagram, site.reseaux.facebook].filter((l) => !estPlaceholder(l)),
  };

  // Échappe « < » pour éviter toute injection dans la balise <script>
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
