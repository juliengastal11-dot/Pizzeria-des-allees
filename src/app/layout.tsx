import type { Metadata, Viewport } from "next";
import { Besley, Figtree } from "next/font/google";
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
    <html lang="fr" className={`${besley.variable} ${figtree.variable}`}>
      <body className="min-h-svh bg-nuit text-calcaire">
        <a
          href="#contenu"
          className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-or px-5 py-3 font-semibold text-nuit transition-transform focus:translate-y-0"
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
