import { estPlaceholder, site } from "@/config/site";
import { openingHoursSpecification } from "@/lib/horaires";
import { enumererOu, remplir } from "@/lib/textes";
import { getSiteUrl } from "@/lib/site-url";

/** Données structurées schema.org de type Restaurant (SEO local). */
export function restaurantJsonLd() {
  const url = getSiteUrl();
  const reel = (v: string) => (estPlaceholder(v) ? undefined : v);
  const horaires = openingHoursSpecification();
  const reseaux = [site.reseaux.instagram, site.reseaux.facebook].filter((l) => !estPlaceholder(l));

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}/#restaurant`,
    name: site.nom,
    url,
    image: [`${url}${site.seo.image.src}`, `${url}${site.photos.galerie[0].src}`],
    logo: `${url}${site.logo.src}`,
    description: site.seo.description,
    servesCuisine: [...site.seo.cuisines],
    priceRange: site.seo.fourchettePrix,
    telephone: reel(site.telephone),
    email: reel(site.email),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adresse.rue,
      postalCode: site.adresse.codePostal,
      addressLocality: site.adresse.ville,
      addressRegion: site.adresse.region,
      addressCountry: site.adresse.pays,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.adresse.geo.latitude,
      longitude: site.adresse.geo.longitude,
    },
    hasMap: site.liens.carte,
    acceptsReservations: site.liens.reserver,
    hasMenu: reel(site.liens.commander),
    paymentAccepted: site.paiements.join(", "),
    areaServed: site.livraison.communes.map((c) => ({ "@type": "City", name: c })),
    openingHoursSpecification: horaires.length ? horaires : undefined,
    potentialAction: [
      {
        "@type": "ReserveAction",
        target: { "@type": "EntryPoint", urlTemplate: site.liens.reserver, inLanguage: "fr" },
        result: { "@type": "FoodEstablishmentReservation", name: site.textes.actions.reserver },
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
    // Omis tant qu'aucun réseau n'est renseigné (pas de tableau vide publié)
    sameAs: reseaux.length ? reseaux : undefined,
  };

  // Échappe « < » pour éviter toute injection dans la balise <script>
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Données structurées schema.org de type FAQPage (SEO), à partir de `site.textes.faq.items`.
 * Les jetons ({communes}, {salle}, {terrasse}) sont résolus ici comme dans `Faq.tsx`, pour que
 * le texte des données structurées soit identique à celui affiché (l'accordéon garde tout dans
 * le HTML initial : rien ici n'est un contenu caché qui n'existerait pas ailleurs sur la page).
 */
export function faqJsonLd() {
  const jetons = { communes: enumererOu(site.livraison.communes), ...site.couverts };
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.textes.faq.items.map(({ question, reponse }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: remplir(reponse, jetons) },
    })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
