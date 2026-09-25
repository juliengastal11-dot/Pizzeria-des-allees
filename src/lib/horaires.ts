import { JOURS, site, type Creneau, type Jour } from "@/config/site";

const LIBELLES: Record<Jour, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

export function libelleJour(jour: Jour): string {
  return LIBELLES[jour];
}

/** "18:30" -> "18 h 30", "12:00" -> "12 h" */
export function formatHeure(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)} h` : `${Number(h)} h ${m}`;
}

export function formatCreneaux(creneaux: readonly Creneau[]): string {
  if (creneaux.length === 0) return "Fermé";
  return creneaux.map((c) => `${formatHeure(c.ouverture)} – ${formatHeure(c.fermeture)}`).join(" · ");
}

export function horairesDuJour(jour: Jour): readonly Creneau[] {
  return site.horaires.semaine[jour];
}

/** Jour et minute courants à Béziers (Europe/Paris), quel que soit le fuseau du visiteur. */
export function maintenantABeziers(date = new Date()): { jour: Jour; minutes: number } {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const jour = get("weekday").toLowerCase() as Jour;
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  return { jour, minutes };
}

function enMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export type Statut =
  | { ouvert: true; jusqua: string }
  | { ouvert: false; prochaine: { jour: Jour; heure: string } | null };

/** Statut d'ouverture à l'instant donné (à n'appeler que côté client, après le montage). */
export function statutOuverture(date = new Date()): Statut {
  const { jour, minutes } = maintenantABeziers(date);
  for (const c of horairesDuJour(jour)) {
    const debut = enMinutes(c.ouverture);
    let fin = enMinutes(c.fermeture);
    if (fin <= debut) fin += 24 * 60;
    if (minutes >= debut && minutes < fin) return { ouvert: true, jusqua: formatHeure(c.fermeture) };
  }
  const idx = JOURS.indexOf(jour);
  for (let i = 0; i < 7; i++) {
    const j = JOURS[(idx + i) % 7];
    const prochain = horairesDuJour(j).find((c) => i > 0 || enMinutes(c.ouverture) > minutes);
    if (prochain) return { ouvert: false, prochaine: { jour: j, heure: formatHeure(prochain.ouverture) } };
  }
  return { ouvert: false, prochaine: null };
}

/** Horaires au format schema.org (vide tant que les horaires sont à confirmer). */
export function openingHoursSpecification() {
  if (site.horaires.aConfirmer) return [];
  const map: Record<Jour, string> = {
    lundi: "Monday",
    mardi: "Tuesday",
    mercredi: "Wednesday",
    jeudi: "Thursday",
    vendredi: "Friday",
    samedi: "Saturday",
    dimanche: "Sunday",
  };
  return JOURS.flatMap((j) =>
    horairesDuJour(j).map((c) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${map[j]}`,
      opens: c.ouverture,
      closes: c.fermeture,
    })),
  );
}
