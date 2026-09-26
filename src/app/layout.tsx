import type { Metadata, Viewport } from "next";
import {
  Besley,
  Bricolage_Grotesque,
  Caveat,
  Cormorant_Garamond,
  DM_Mono,
  Figtree,
  Fraunces,
  Instrument_Serif,
  Playfair_Display,
  Raleway,
} from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarreMobile } from "@/components/layout/BarreMobile";
import { site } from "@/config/site";
import { faqJsonLd, restaurantJsonLd } from "@/lib/jsonld";
import { partage } from "@/lib/metadonnees";
import { getSiteUrl } from "@/lib/site-url";
import { estBrouillon } from "./brouillon";

// Besley : une Clarendon, la lettre des devantures peintes et des étiquettes de vin.
const besley = Besley({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-besley",
  display: "swap",
});

// Figtree : ronde et nette, lisible au soleil sur un téléphone.
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

/*
 * Polices des palettes typographiques d'essai (bandeau en haut du site, voir BandeauEssai
 * et globals.css). Jamais préchargées : le navigateur ne les télécharge que si une palette
 * qui s'en sert est choisie (ou pour l'aperçu « Aa » de son bouton).
 */
// (next/font n'accepte que des options écrites en toutes lettres : pas d'objet partagé.)

// Éditorial : Playfair Display (titres) et Raleway (texte)
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});
const raleway = Raleway({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-raleway",
  display: "swap",
  preload: false,
});

// Gravure : Cormorant Garamond (titres) et Raleway
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

// Ardoise : Fraunces aux terminaisons arrondies (axe SOFT) et Caveat, une écriture à la craie
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

// Comptoir : Bricolage Grotesque, Instrument Serif en italique, DM Mono comme un ticket de commande
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
  preload: false,
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
  preload: false,
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
  preload: false,
});

const variablesPolices = [besley, figtree, playfair, raleway, cormorant, fraunces, caveat, bricolage, instrumentSerif, dmMono]
  .map((police) => police.variable)
  .join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.seo.titre,
    template: `%s · ${site.nom}`,
  },
  description: site.seo.description,
  keywords: [...site.seo.motsCles],
  applicationName: site.nom,
  alternates: { canonical: "/" },
  ...partage({ titre: site.seo.titre, description: site.seo.description, chemin: "/" }),
  formatDetection: { telephone: true, address: true },
  // Brouillon (domaine à venir ou prévisualisation) : noindex, levé dès que site.urlSite est renseigné
  robots: estBrouillon()
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : { index: true, follow: true },
};

/*
 * Sans JavaScript, les états de départ des animations (posés en style en ligne
 * par Motion) ne seraient jamais levés : on les neutralise pour que tout se lise.
 */
const SANS_JS = "[style*='opacity:0']{opacity:1!important;transform:none!important}";

export const viewport: Viewport = {
  themeColor: "#051a4b",
  colorScheme: "dark",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={variablesPolices} suppressHydrationWarning>
      <body className="min-h-svh bg-nuit text-calcaire">
        {/* Palettes d'essai choisies dans ce navigateur (voir BandeauEssai) : posées avant la première peinture. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,p=localStorage.getItem("palette-essai"),t=localStorage.getItem("typo-essai");if(p)d.dataset.palette=p;if(t)d.dataset.typo=t;}catch(e){}`,
          }}
        />
        <a
          href="#contenu"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-or px-5 py-3 font-semibold text-encre transition-transform focus:translate-y-0"
        >
          {site.navigation.allerAuContenu}
        </a>
        <noscript>
          <style>{SANS_JS}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: restaurantJsonLd() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />
        <Providers>
          <Header />
          <main id="contenu" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <BarreMobile />
        </Providers>
      </body>
    </html>
  );
}
