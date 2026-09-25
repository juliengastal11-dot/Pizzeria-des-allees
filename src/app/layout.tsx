import type { Metadata, Viewport } from "next";
import { Besley, Figtree } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BarreMobile } from "@/components/layout/BarreMobile";
import { site } from "@/config/site";
import { restaurantJsonLd } from "@/lib/jsonld";
import { getSiteUrl } from "@/lib/site-url";

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
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.nom,
    title: site.seo.titre,
    description: site.seo.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.seo.titre, description: site.seo.description },
  formatDetection: { telephone: true, address: true },
  robots: { index: true, follow: true },
};

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
          Aller au contenu
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: restaurantJsonLd() }} />
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
