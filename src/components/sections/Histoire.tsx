import { Plafond } from "@/components/sections/salle/Plafond";
import { SalonDesCadres } from "./histoire/SalonDesCadres";

/**
 * Notre histoire : sous la même voûte d'ampoules que la salle, le manifeste
 * qui s'allume mot à mot, et le mur de cadres où les pizzas sont exposées en
 * portraits rétroéclairés, entre des ardoises qui s'écrivent à la main.
 */
export function Histoire() {
  return (
    <section id="histoire" aria-labelledby="histoire-titre" className="relative isolate overflow-clip bg-minuit pb-24 pt-28 md:pb-32 md:pt-36">
      <Plafond />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SalonDesCadres />
      </div>
    </section>
  );
}
