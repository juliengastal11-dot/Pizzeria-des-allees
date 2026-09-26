/**
 * Moteur de la carte de nuit : MapLibre GL + tuiles vectorielles OpenFreeMap.
 * Ce module n'est chargé qu'à l'approche de la section (import dynamique depuis CarteNuit),
 * avec ses feuilles de style : rien de tout cela ne pèse sur le premier affichage.
 */
import {
  Map as CarteGL,
  Marker,
  setWorkerUrl,
  type FilterSpecification,
  type GeoJSONSource,
  type IControl,
  type LngLatBoundsLike,
  type PaddingOptions,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./carte-nuit.css";
import { emprise, RESTAURANT, trajet, zoneLivraison, type Coordonnees, type Lieu } from "./geographie";
import { couleursPaletteCarte, EVENEMENT_PALETTE } from "@/lib/palette-essai";

export type CommuneCarte = { nom: string; lieu: Lieu };

export type OptionsCarte = {
  /** Élément qui reçoit la carte (vide, dimensionné par le panneau). */
  conteneur: HTMLElement;
  communes: readonly CommuneCarte[];
  /** Étiquette du restaurant, une entrée par ligne. */
  lignesRestaurant: readonly string[];
  /** Trace le contour de la zone de livraison (site.livraison.zoneDefinie). */
  zone: boolean;
  locale: Record<string, string>;
  libelleRecentrer: string;
  surChoix: (nom: string) => void;
  surPret: () => void;
  surEchec: () => void;
};

export type CarteNuitGL = {
  /** Met une commune en lumière et cadre le trajet depuis la pizzeria (null : toutes les communes). */
  choisir(nom: string | null): void;
  survoler(nom: string | null): void;
  detruire(): void;
};

const STYLE = "/map/style-nuit.json";
const AVANT_LIBELLES = "highway_name_other";
const VIDE: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

/*
 * Travailleur de MapLibre (décodage des tuiles). Le bundler publie les fichiers de maplibre-gl/dist
 * sous des noms hachés : le travailleur ne retrouve plus « ./maplibre-gl-shared.mjs ». On lui redonne
 * l'adresse exacte de ce fichier et on le lance depuis un blob (même origine ; une future CSP devra
 * autoriser `worker-src blob:`). Les deux fichiers viennent de node_modules : versions toujours alignées.
 */
let travailleurPret: Promise<void> | null = null;
function preparerTravailleur(): Promise<void> {
  travailleurPret ??= (async () => {
    // Adresses absolues : un module lancé depuis un blob ne sait pas résoudre « /_next/… »
    const absolue = (u: URL) => new URL(u.href, window.location.href).href;
    const travailleur = absolue(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url));
    const commun = absolue(new URL("maplibre-gl/dist/maplibre-gl-shared.mjs", import.meta.url));
    const reponse = await fetch(travailleur);
    if (!reponse.ok) throw new Error(`Travailleur MapLibre introuvable (${reponse.status})`);
    const source = (await reponse.text())
      .replaceAll("./maplibre-gl-shared.mjs", commun)
      .replace(/^\/\/# sourceMappingURL=.*$/m, "");
    setWorkerUrl(URL.createObjectURL(new Blob([source], { type: "text/javascript" })));
  })();
  return travailleurPret;
}

const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Marges autour des communes : l'arche en haut, les commandes et crédits en bas. */
function marges(largeur: number): PaddingOptions {
  return largeur < 640 ? { top: 64, bottom: 84, left: 44, right: 44 } : { top: 74, bottom: 68, left: 96, right: 96 };
}

function bornes(points: readonly Coordonnees[]): LngLatBoundsLike {
  const [o, s, e, n] = emprise(points);
  return [
    [o, s],
    [e, n],
  ];
}

type Commande = { classe: string; libelle: string; action: () => void };

/** Zoomer, dézoomer, revoir toutes les communes : une seule colonne de boutons de 44 px, aux couleurs du site. */
class Commandes implements IControl {
  private groupe: HTMLElement | null = null;
  constructor(private readonly liste: readonly Commande[]) {}
  onAdd() {
    const groupe = document.createElement("div");
    groupe.className = "maplibregl-ctrl maplibregl-ctrl-group";
    for (const { classe, libelle, action } of this.liste) {
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = classe;
      bouton.title = libelle;
      bouton.setAttribute("aria-label", libelle);
      const icone = document.createElement("span");
      icone.className = "maplibregl-ctrl-icon";
      icone.setAttribute("aria-hidden", "true");
      bouton.append(icone);
      bouton.addEventListener("click", action);
      groupe.append(bouton);
    }
    this.groupe = groupe;
    return groupe;
  }
  onRemove() {
    this.groupe?.remove();
    this.groupe = null;
  }
}

/** Point de lumière : halo, point, étiquette. Décoratif pour les lecteurs d'écran (la liste fait foi). */
function creerLumiere(nom: string, lieu: Pick<Lieu, "cote" | "lignes">, delaiMs: number, classe = ""): HTMLElement {
  const el = document.createElement("div");
  el.className = `cn-lieu cn-${lieu.cote} ${classe}`.trim();
  el.setAttribute("aria-hidden", "true");
  el.style.setProperty("--cn-delai", `${delaiMs}ms`);

  const corps = document.createElement("div");
  corps.className = "cn-corps";
  const aura = document.createElement("span");
  aura.className = "cn-aura";
  const point = document.createElement("span");
  point.className = "cn-point";
  const etiquette = document.createElement("span");
  etiquette.className = "cn-nom";
  for (const ligne of lieu.lignes ?? [nom]) {
    const span = document.createElement("span");
    span.textContent = ligne;
    etiquette.append(span);
  }
  corps.append(aura);
  if (classe.includes("cn-pizzeria")) {
    const onde = document.createElement("span");
    onde.className = "cn-onde";
    corps.append(onde);
  }
  corps.append(point, etiquette);
  el.append(corps);
  return el;
}

export async function creerCarte(o: OptionsCarte): Promise<CarteNuitGL> {
  await preparerTravailleur();
  const points = o.communes.map((c) => c.lieu.coord);
  const zone = bornes([RESTAURANT, ...points]);
  const reduit = mouvementReduit();

  // Lève une GPUInitializationError si WebGL 2 est indisponible : CarteNuit bascule alors sur le panneau de secours.
  const carte = new CarteGL({
    container: o.conteneur,
    style: STYLE,
    bounds: zone,
    fitBoundsOptions: { padding: marges(o.conteneur.clientWidth) },
    cooperativeGestures: true,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    rollEnabled: false,
    maxPitch: 0,
    minZoom: 8,
    maxZoom: 15.5,
    maxBounds: [
      [2.85, 43.1],
      [3.6, 43.58],
    ],
    renderWorldCopies: false,
    attributionControl: { compact: false },
    locale: o.locale,
    fadeDuration: reduit ? 0 : 250,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  });
  carte.touchZoomRotate.disableRotation();
  carte.keyboard.disableRotation();

  const toutVoir = () => {
    carte.fitBounds(zone, { padding: marges(o.conteneur.clientWidth), duration: 900 });
  };
  carte.addControl(
    new Commandes([
      { classe: "maplibregl-ctrl-zoom-in", libelle: o.locale["NavigationControl.ZoomIn"] ?? "+", action: () => carte.zoomIn() },
      { classe: "maplibregl-ctrl-zoom-out", libelle: o.locale["NavigationControl.ZoomOut"] ?? "−", action: () => carte.zoomOut() },
      { classe: "cn-recentrer", libelle: o.libelleRecentrer, action: toutVoir },
    ]),
    "bottom-left",
  );

  // Points de lumière : du plus proche au plus lointain de la pizzeria, en cascade rapide
  const tries = [...o.communes].sort(
    (a, b) =>
      Math.hypot(a.lieu.coord[0] - RESTAURANT[0], a.lieu.coord[1] - RESTAURANT[1]) -
      Math.hypot(b.lieu.coord[0] - RESTAURANT[0], b.lieu.coord[1] - RESTAURANT[1]),
  );
  const lumieres = new Map<string, HTMLElement>();
  const marqueurs: Marker[] = [];
  tries.forEach(({ nom, lieu }, rang) => {
    const el = creerLumiere(nom, lieu, 260 + rang * 90, "cn-cliquable");
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      o.surChoix(nom);
    });
    lumieres.set(nom, el);
    marqueurs.push(new Marker({ element: el, anchor: "center" }).setLngLat([...lieu.coord]).addTo(carte));
  });
  const siege = creerLumiere(o.lignesRestaurant.join(" "), { cote: "gauche", lignes: o.lignesRestaurant }, 60, "cn-pizzeria");
  marqueurs.push(new Marker({ element: siege, anchor: "center" }).setLngLat([...RESTAURANT]).addTo(carte));

  let pret = false;
  let visible = false;
  let allume = false;
  let choixEnAttente: string | null = null;
  let choixCourant: string | null = null;

  const allumer = () => {
    if (allume || !pret || !visible) return;
    allume = true;
    o.conteneur.setAttribute("data-allume", "");
    if (!o.zone) return;
    carte.setPaintProperty("zone-nuit", "fill-opacity", 0.55);
    carte.setPaintProperty("zone-fond", "fill-opacity", 0.05);
    carte.setPaintProperty("zone-lueur", "line-opacity", 0.18);
    carte.setPaintProperty("zone-contour", "line-opacity", 0.9);
  };

  // Les lumières s'allument quand la carte est vraiment à l'écran, pas pendant le préchargement
  const vue = new IntersectionObserver(
    ([entree]) => {
      if (entree?.isIntersecting) {
        visible = true;
        allumer();
      }
    },
    { threshold: 0.35 },
  );
  vue.observe(o.conteneur);

  const transition = { duration: reduit ? 0 : 900, delay: 0 };

  /** Contour de la zone de livraison, qui s'éclaire à l'allumage (seulement si la zone est arrêtée). */
  function ajouterZone() {
    const { halo, or, orClair, minuit } = couleursPaletteCarte();
    const contour = zoneLivraison(points);
    carte.addSource("zone", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [contour] } },
    });
    // Hors de la zone, la nuit est plus profonde : la zone livrée paraît éclairée
    carte.addSource("hors-zone", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [1.5, 42.5],
              [5, 42.5],
              [5, 44.2],
              [1.5, 44.2],
              [1.5, 42.5],
            ],
            [...contour].reverse(),
          ],
        },
      },
    });
    carte.addLayer(
      {
        id: "zone-nuit",
        type: "fill",
        source: "hors-zone",
        paint: { "fill-color": minuit, "fill-opacity": 0, "fill-opacity-transition": transition },
      },
      AVANT_LIBELLES,
    );
    carte.addLayer(
      {
        id: "zone-fond",
        type: "fill",
        source: "zone",
        paint: { "fill-color": or, "fill-opacity": 0, "fill-opacity-transition": transition },
      },
      AVANT_LIBELLES,
    );
    carte.addLayer(
      {
        id: "zone-lueur",
        type: "line",
        source: "zone",
        layout: { "line-join": "round" },
        paint: { "line-color": halo, "line-width": 12, "line-blur": 10, "line-opacity": 0, "line-opacity-transition": transition },
      },
      AVANT_LIBELLES,
    );
    carte.addLayer(
      {
        id: "zone-contour",
        type: "line",
        source: "zone",
        layout: { "line-join": "round" },
        paint: {
          "line-color": orClair,
          "line-width": 1.6,
          "line-dasharray": [2.4, 2.2],
          "line-opacity": 0,
          "line-opacity-transition": transition,
        },
      },
      AVANT_LIBELLES,
    );
  }

  carte.on("load", () => {
    // Pas de doublon : les communes livrées portent déjà leur étiquette lumineuse
    const noms = [...o.communes.map((c) => c.nom)];
    for (const id of ["place_village", "place_town", "place_city", "place_city_large"]) {
      const filtre = carte.getFilter(id);
      if (filtre) carte.setFilter(id, ["all", filtre, ["!", ["in", ["get", "name"], ["literal", noms]]]] as FilterSpecification);
    }

    if (o.zone) ajouterZone();

    const { halo } = couleursPaletteCarte();
    carte.addSource("trajet", { type: "geojson", data: VIDE });
    carte.addLayer({
      id: "trajet-lueur",
      type: "line",
      source: "trajet",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": halo, "line-width": 10, "line-blur": 8, "line-opacity": 0, "line-opacity-transition": { duration: reduit ? 0 : 450, delay: 0 } },
    });
    carte.addLayer({
      id: "trajet-points",
      type: "line",
      source: "trajet",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": halo,
        "line-width": 3.2,
        "line-dasharray": [0, 2.1],
        "line-opacity": 0,
        "line-opacity-transition": { duration: reduit ? 0 : 450, delay: 0 },
      },
    });

    pret = true;
    o.surPret();
    allumer();
    if (choixEnAttente !== null) appliquerChoix(choixEnAttente);
  });

  carte.on("error", (e) => {
    const message = String((e as { error?: { message?: string } }).error?.message ?? "");
    if (!pret && /worker|webgl|style/i.test(message)) o.surEchec();
  });
  carte.on("webglcontextlost", () => o.surEchec());

  // Essai de palettes (temporaire) : la carte est en WebGL, elle ne suit pas les jetons CSS toute seule.
  const surChangementPalette = () => {
    if (!pret) return;
    const { halo, or, orClair, minuit } = couleursPaletteCarte();
    if (carte.getLayer("zone-nuit")) carte.setPaintProperty("zone-nuit", "fill-color", minuit);
    if (carte.getLayer("zone-fond")) carte.setPaintProperty("zone-fond", "fill-color", or);
    if (carte.getLayer("zone-lueur")) carte.setPaintProperty("zone-lueur", "line-color", halo);
    if (carte.getLayer("zone-contour")) carte.setPaintProperty("zone-contour", "line-color", orClair);
    if (carte.getLayer("trajet-lueur")) carte.setPaintProperty("trajet-lueur", "line-color", halo);
    if (carte.getLayer("trajet-points")) carte.setPaintProperty("trajet-points", "line-color", halo);
  };
  window.addEventListener(EVENEMENT_PALETTE, surChangementPalette);

  // Largeur qui change (rotation, onglet réaffiché) : on recadre sans animation
  let largeur = o.conteneur.clientWidth;
  carte.on("resize", () => {
    const nouvelle = o.conteneur.clientWidth;
    if (!pret || nouvelle === 0 || nouvelle === largeur) return;
    largeur = nouvelle;
    const commune = o.communes.find((c) => c.nom === choixCourant);
    if (commune) carte.fitBounds(bornes([RESTAURANT, commune.lieu.coord]), { ...cadrageChoix(), duration: 0 });
    else carte.fitBounds(zone, { padding: marges(nouvelle), duration: 0 });
  });

  /** Cadrage du trajet pizzeria → commune : assez large pour garder un peu de contexte. */
  function cadrageChoix() {
    const large = o.conteneur.clientWidth >= 640;
    return {
      padding: large ? { top: 110, bottom: 100, left: 150, right: 150 } : { top: 92, bottom: 86, left: 78, right: 78 },
      maxZoom: 12.6,
    };
  }

  function appliquerChoix(nom: string | null) {
    choixCourant = nom;
    for (const [n, el] of lumieres) el.classList.toggle("est-choisi", n === nom);
    const commune = o.communes.find((c) => c.nom === nom);
    const trace = carte.getSource<GeoJSONSource>("trajet");
    if (!commune) {
      o.conteneur.removeAttribute("data-choix");
      carte.setPaintProperty("trajet-points", "line-opacity", 0);
      carte.setPaintProperty("trajet-lueur", "line-opacity", 0);
      return;
    }
    o.conteneur.setAttribute("data-choix", "");
    trace?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: trajet(commune.lieu.coord) } });
    carte.setPaintProperty("trajet-points", "line-opacity", 1);
    carte.setPaintProperty("trajet-lueur", "line-opacity", 0.3);
    carte.fitBounds(bornes([RESTAURANT, commune.lieu.coord]), { ...cadrageChoix(), duration: 1100 });
  }

  return {
    choisir(nom) {
      if (!pret) {
        choixEnAttente = nom;
        return;
      }
      if (nom === null && choixCourant !== null) toutVoir();
      appliquerChoix(nom);
    },
    survoler(nom) {
      for (const [n, el] of lumieres) el.classList.toggle("est-survole", n === nom);
    },
    detruire() {
      vue.disconnect();
      window.removeEventListener(EVENEMENT_PALETTE, surChangementPalette);
      for (const m of marqueurs) m.remove();
      carte.remove();
    },
  };
}
