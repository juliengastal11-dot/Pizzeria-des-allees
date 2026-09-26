import { Hero } from "@/components/sections/hero/Hero";
import { Histoire } from "@/components/sections/Histoire";
import { Carte } from "@/components/sections/Carte";
import { Livraison } from "@/components/sections/Livraison";
import { Salle } from "@/components/sections/Salle";
import { Infos } from "@/components/sections/Infos";
import { Fidelite } from "@/components/sections/Fidelite";
import { Faq } from "@/components/sections/Faq";

export default function Accueil() {
  return (
    <>
      <Hero />
      <Histoire />
      <Carte />
      <Livraison />
      <Salle />
      <Fidelite />
      <Infos />
      <Faq />
    </>
  );
}
