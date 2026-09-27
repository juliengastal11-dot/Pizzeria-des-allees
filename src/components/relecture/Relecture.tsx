"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import { Check, ClipboardCopy, ListChecks, PenLine, Sparkles, X } from "lucide-react";
import { index, libelleCle, normaliser, sectionDe } from "./blocs";
import { ATTR_BLOC, ATTR_IMAGE, ATTR_UI, decrire, etiqueter, selecteur, synchroniserApercus, texteOriginal, toutRetirer } from "./etiquetage";
import { ANIMATIONS } from "./animations";
import { charger, enregistrer, nombreDeRetours, versJson, AUCUN_RETOUR, type Decision, type Retours } from "./retours";
import styles from "./relecture.module.css";

type Mode = "modifier" | "naviguer";

type Cible =
  | { type: "texte"; el: HTMLElement; cle: string }
  | { type: "image"; el: HTMLElement; chemin: string }
  | { type: "animation"; el: HTMLElement; id: string }
  | { type: "remarque"; el: HTMLElement | null; id: string };

const DRAPEAU_AIDE = "relecture-aide-vue";

function lireDrapeau(cle: string) {
  try {
    return localStorage.getItem(cle) === "1";
  } catch {
    return false;
  }
}

function poserDrapeau(cle: string) {
  try {
    localStorage.setItem(cle, "1");
  } catch {
    // Sans stockage, l'aide reviendra à la prochaine visite : sans gravité
  }
}

/** Fait défiler jusqu'à un élément et le fait briller une fois. */
function montrer(el: Element, lenis: ReturnType<typeof useLenis>) {
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -Math.round(innerHeight / 3) });
  else el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.removeAttribute("data-relecture-eclair");
  requestAnimationFrame(() => {
    el.setAttribute("data-relecture-eclair", "");
    setTimeout(() => el.removeAttribute("data-relecture-eclair"), 1700);
  });
}

/**
 * Mode relecture (lien « ?relecture ») : le relecteur réécrit les textes, garde
 * ou supprime les animations, commente images et blocs. Rien ne change sur le
 * site en ligne ; ses retours restent dans son navigateur et se copient en JSON,
 * prêts à être collés tels quels dans Claude.
 */
export function Relecture({ quitter }: { quitter: () => void }) {
  const [retours, setRetours] = useState<Retours>(charger);
  const [mode, setMode] = useState<Mode>("modifier");
  const [cible, setCible] = useState<Cible | null>(null);
  const [panneau, setPanneau] = useState<"aucun" | "liste" | "aide" | "secours">(() => (lireDrapeau(DRAPEAU_AIDE) ? "aucun" : "aide"));
  const [message, setMessage] = useState("");
  const [copie, setCopie] = useState(false);
  const [animees, setAnimees] = useState<HTMLElement[]>([]);
  const [hote, setHote] = useState<HTMLElement | null>(null);
  const observateur = useRef<MutationObserver | null>(null);
  const lenis = useLenis();

  // Couche de l'outil, hors de l'arbre du site (aucun parent transformé ne la décale)
  useEffect(() => {
    try {
      // Le mode reste actif d'une page à l'autre, même quand l'adresse perd « ?relecture »
      sessionStorage.setItem("relecture-active", "1");
    } catch {
      // Sans stockage, la relecture vaut pour cette page
    }
    const div = document.createElement("div");
    div.setAttribute(ATTR_UI, "");
    div.className = styles.racine;
    document.body.appendChild(div);
    const id = requestAnimationFrame(() => setHote(div));
    return () => {
      cancelAnimationFrame(id);
      div.remove();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-relecture", mode);
  }, [mode]);

  // Étiquetage de la page, puis à chaque changement du DOM (onglets, carrousel, FAQ, autre page)
  useEffect(() => {
    let attente = 0;
    const balayer = () => {
      attente = 0;
      etiqueter();
      const trouvees = [...document.querySelectorAll<HTMLElement>("[data-animation]")];
      setAnimees((avant) => (avant.length === trouvees.length && avant.every((el, i) => el === trouvees[i]) ? avant : trouvees));
      observateur.current?.takeRecords();
    };
    const obs = new MutationObserver((mutations) => {
      if (mutations.every((m) => (m.target instanceof Element ? m.target : m.target.parentElement)?.closest(`[${ATTR_UI}]`))) return;
      if (!attente) attente = window.setTimeout(balayer, 350);
    });
    observateur.current = obs;
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    attente = window.setTimeout(balayer, 0);
    return () => {
      obs.disconnect();
      clearTimeout(attente);
      toutRetirer();
      document.documentElement.removeAttribute("data-relecture");
    };
  }, []);

  // Les réécritures s'affichent partout où le texte apparaît ; les retours se gardent
  useEffect(() => {
    synchroniserApercus(retours.textes);
    observateur.current?.takeRecords();
    enregistrer(retours);
  }, [retours, animees]);

  // Modifier : un clic sur la page ouvre l'édition au lieu d'agir (liens, boutons, FAQ…)
  useEffect(() => {
    if (mode !== "modifier") return;
    const surClic = (e: MouseEvent) => {
      const touche = e.target instanceof Element ? e.target : null;
      if (!touche || touche.closest(`[${ATTR_UI}]`)) return;
      e.preventDefault();
      e.stopPropagation();
      const image = touche.closest<HTMLElement>(`[${ATTR_IMAGE}]`);
      const bloc = touche.closest<HTMLElement>(`[${ATTR_BLOC}]`);
      if (image && (!bloc || bloc.contains(image))) {
        setCible({ type: "image", el: image, chemin: image.getAttribute(ATTR_IMAGE) ?? "" });
      } else if (bloc) {
        setCible({ type: "texte", el: bloc, cle: bloc.getAttribute(ATTR_BLOC) ?? "" });
      } else if (touche instanceof HTMLElement && touche !== document.body && touche !== document.documentElement) {
        setCible({ type: "remarque", el: touche, id: `r${Date.now().toString(36)}` });
      }
      setPanneau((p) => (p === "aide" ? p : "aucun"));
    };
    window.addEventListener("click", surClic, true);
    return () => window.removeEventListener("click", surClic, true);
  }, [mode]);

  // L'élément en cours d'édition reste souligné
  useEffect(() => {
    const el = cible?.el;
    el?.setAttribute("data-relecture-cible", "");
    return () => el?.removeAttribute("data-relecture-cible");
  }, [cible]);

  const modifier = useCallback((maj: (r: Retours) => Retours) => setRetours((r) => maj(r)), []);

  const copier = async () => {
    const json = versJson(retours);
    try {
      await navigator.clipboard.writeText(json);
      setCopie(true);
      setMessage("Retours copiés : collez-les dans un message.");
      setTimeout(() => setCopie(false), 2500);
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setPanneau("secours");
    }
  };

  const sortir = () => {
    toutRetirer();
    quitter();
  };

  const n = nombreDeRetours(retours);
  if (!hote) return null;

  return createPortal(
    <>
      <Pastilles elements={animees} retours={retours} ouvrir={(el, id) => setCible({ type: "animation", el, id })} />

      {cible && <Editeur cible={cible} retours={retours} modifier={modifier} fermer={() => setCible(null)} />}

      {panneau === "aide" && (
        <Aide
          fermer={() => {
            poserDrapeau(DRAPEAU_AIDE);
            setPanneau("aucun");
          }}
        />
      )}
      {panneau === "liste" && (
        <Liste
          retours={retours}
          modifier={modifier}
          voir={(el) => montrer(el, lenis)}
          fermer={() => setPanneau("aucun")}
          aide={() => setPanneau("aide")}
          sortir={sortir}
        />
      )}
      {panneau === "secours" && <Secours json={versJson(retours)} fermer={() => setPanneau("aucun")} />}

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      <div className={styles.barre} role="toolbar" aria-label="Relecture du site">
        <span className={styles.marque}>
          <PenLine aria-hidden />
          <span className={styles.libelleLong}>Relecture</span>
        </span>
        <div className={styles.bascule} role="group" aria-label="Mode">
          <button type="button" aria-pressed={mode === "modifier"} onClick={() => setMode("modifier")}>
            Modifier
          </button>
          <button
            type="button"
            aria-pressed={mode === "naviguer"}
            onClick={() => {
              setMode("naviguer");
              setCible(null);
            }}
          >
            Naviguer
          </button>
        </div>
        <button
          type="button"
          className={styles.bouton}
          aria-expanded={panneau === "liste"}
          onClick={() => {
            setPanneau((p) => (p === "liste" ? "aucun" : "liste"));
            setCible(null);
          }}
        >
          <ListChecks aria-hidden />
          <span className={styles.libelleLong}>Retours</span>
          <span className={styles.compte} data-vide={n ? undefined : ""} aria-label={`${n} retour${n > 1 ? "s" : ""}`}>
            {n}
          </span>
        </button>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={copier} disabled={!n && !retours.prenom}>
          {copie ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}
          {copie ? "Copié" : "Copier"}
        </button>
      </div>
    </>,
    hote,
  );
}

/* ---------------------------------------------------------------------------
 * Carte d'édition, près du bloc (en bas de l'écran sur téléphone)
 * ------------------------------------------------------------------------- */

function usePlacement(el: HTMLElement | null, carte: React.RefObject<HTMLElement | null>) {
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    let image = 0;
    const placer = () => {
      image = 0;
      const boite = carte.current;
      if (!boite) return;
      if (!el || matchMedia("(max-width: 39.99rem)").matches) {
        setStyle({});
        return;
      }
      const r = el.getBoundingClientRect();
      const h = boite.offsetHeight;
      const w = boite.offsetWidth;
      const haut = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const bas = innerHeight - 80;
      let top = r.bottom + 12;
      if (top + h > bas) top = r.top - 12 - h;
      top = Math.min(Math.max(top, haut + 8), bas - h);
      const left = Math.min(Math.max(r.left, 12), innerWidth - w - 12);
      setStyle({ top, left });
    };
    const demander = () => {
      if (!image) image = requestAnimationFrame(placer);
    };
    placer();
    addEventListener("scroll", demander, { passive: true });
    addEventListener("resize", demander);
    return () => {
      cancelAnimationFrame(image);
      removeEventListener("scroll", demander);
      removeEventListener("resize", demander);
    };
  }, [el, carte]);

  return style;
}

function Editeur({ cible, retours, modifier, fermer }: { cible: Cible; retours: Retours; modifier: (maj: (r: Retours) => Retours) => void; fermer: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const style = usePlacement(cible.el, ref);
  const section = cible.el ? sectionDe(cible.el).nom : "Page";

  useEffect(() => {
    const echap = (e: KeyboardEvent) => e.key === "Escape" && fermer();
    addEventListener("keydown", echap);
    ref.current?.querySelector<HTMLElement>("textarea, button[aria-pressed]")?.focus({ preventScroll: true });
    return () => removeEventListener("keydown", echap);
  }, [fermer]);

  const contenu = (() => {
    switch (cible.type) {
      case "texte":
        return <EditionTexte key={cible.cle} cible={cible} section={section} retours={retours} modifier={modifier} fermer={fermer} />;
      case "image":
        return <EditionImage key={cible.chemin} cible={cible} section={section} retours={retours} modifier={modifier} fermer={fermer} />;
      case "animation":
        return <EditionAnimation key={cible.id} id={cible.id} section={section} retours={retours} modifier={modifier} fermer={fermer} />;
      case "remarque":
        return <EditionRemarque key={cible.id} cible={cible} section={section} retours={retours} modifier={modifier} fermer={fermer} />;
    }
  })();

  return (
    <div ref={ref} className={styles.carte} style={style} role="dialog" aria-label="Relecture : modifier ce bloc">
      {contenu}
    </div>
  );
}

type PropsEdition = { section: string; retours: Retours; modifier: (maj: (r: Retours) => Retours) => void; fermer: () => void };

function Entete({ surtitre, titre, fermer }: { surtitre: string; titre?: string; fermer: () => void }) {
  return (
    <div className={styles.entete}>
      <div>
        <p className={styles.surtitre}>{surtitre}</p>
        {titre && <p className={styles.titre}>{titre}</p>}
      </div>
      <button type="button" className={styles.fermer} onClick={fermer} aria-label="Fermer">
        <X aria-hidden />
      </button>
    </div>
  );
}

/** Ctrl + Entrée (⌘ + Entrée sur Mac) valide, comme un envoi de message. */
const raccourci = (valider: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    valider();
  }
};

function EditionTexte({ cible, section, retours, modifier, fermer }: PropsEdition & { cible: Extract<Cible, { type: "texte" }> }) {
  const existant = retours.textes[cible.cle];
  const modele = index().parCle.get(cible.cle)?.valeur;
  // « avant » = le texte exact de la config (apostrophes, espaces insécables), sauf pour un texte à trous
  const original = existant?.avant ?? (modele && !/\{\w+\}/.test(modele) ? modele : texteOriginal(cible.el));
  const [texte, setTexte] = useState(existant?.apres ?? original);
  const [remarque, setRemarque] = useState(existant?.remarque ?? "");
  const [avecRemarque, setAvecRemarque] = useState(Boolean(existant?.remarque));
  const endroits = document.querySelectorAll(`[${ATTR_BLOC}="${CSS.escape(cible.cle)}"]`).length;

  const valider = () => {
    modifier((r) => {
      const textes = { ...r.textes };
      if (normaliser(texte) === normaliser(original) && !remarque.trim()) delete textes[cible.cle];
      else textes[cible.cle] = { cle: cible.cle, section, avant: original, apres: texte.trim(), remarque };
      return { ...r, textes };
    });
    fermer();
  };

  const retablir = () => {
    modifier((r) => {
      const textes = { ...r.textes };
      delete textes[cible.cle];
      return { ...r, textes };
    });
    fermer();
  };

  return (
    <>
      <Entete surtitre={`${section} · ${libelleCle(cible.cle)}`} fermer={fermer} />
      {existant && <p className={styles.origine}>Texte d’origine : « {original} »</p>}
      <textarea className={styles.champ} value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={raccourci(valider)} aria-label="Nouveau texte" rows={4} />
      {endroits > 1 && <p className={styles.note}>Ce texte apparaît {endroits} fois sur le site : ils changeront ensemble.</p>}
      {modele && /\{\w+\}/.test(modele) && <p className={styles.note}>Les chiffres et les noms de ce texte sont remplis automatiquement : changez les mots autour.</p>}
      {avecRemarque ? (
        <>
          <label className={styles.etiquette} htmlFor="relecture-remarque">
            Remarque (facultatif)
          </label>
          <textarea
            id="relecture-remarque"
            className={`${styles.champ} ${styles.petitChamp}`}
            value={remarque}
            onChange={(e) => setRemarque(e.target.value)}
            onKeyDown={raccourci(valider)}
          />
        </>
      ) : (
        <button type="button" className={styles.lien} onClick={() => setAvecRemarque(true)}>
          Ajouter une remarque
        </button>
      )}
      <div className={styles.actions}>
        {existant && (
          <button type="button" className={`${styles.bouton} ${styles.gauche} ${styles.danger}`} onClick={retablir}>
            Rétablir
          </button>
        )}
        <button type="button" className={styles.bouton} onClick={fermer}>
          Annuler
        </button>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={valider}>
          Valider
        </button>
      </div>
    </>
  );
}

function EditionImage({ cible, section, retours, modifier, fermer }: PropsEdition & { cible: Extract<Cible, { type: "image" }> }) {
  const existant = retours.images[cible.chemin];
  const [remarque, setRemarque] = useState(existant?.remarque ?? "");
  const apercu = cible.el instanceof HTMLImageElement ? cible.el.currentSrc || cible.el.src : cible.el instanceof HTMLVideoElement ? cible.el.poster : "";

  const valider = () => {
    modifier((r) => {
      const images = { ...r.images };
      if (!remarque.trim()) delete images[cible.chemin];
      else images[cible.chemin] = { chemin: cible.chemin, cles: index().fichiers.get(cible.chemin) ?? [], section, remarque };
      return { ...r, images };
    });
    fermer();
  };

  return (
    <>
      <Entete surtitre={`${section} · Image`} fermer={fermer} />
      {apercu && (
        // eslint-disable-next-line @next/next/no-img-element -- vignette de l'image déjà chargée par la page
        <img className={styles.vignette} src={apercu} alt="" />
      )}
      <p className={styles.fichier}>{cible.chemin}</p>
      <textarea
        className={styles.champ}
        value={remarque}
        onChange={(e) => setRemarque(e.target.value)}
        onKeyDown={raccourci(valider)}
        placeholder="Que faut-il changer ? (remplacer la photo, la recadrer, l’éclaircir…)"
        aria-label="Remarque sur l’image"
      />
      <div className={styles.actions}>
        {existant && (
          <button
            type="button"
            className={`${styles.bouton} ${styles.gauche} ${styles.danger}`}
            onClick={() => {
              setRemarque("");
              modifier((r) => {
                const images = { ...r.images };
                delete images[cible.chemin];
                return { ...r, images };
              });
              fermer();
            }}
          >
            Retirer
          </button>
        )}
        <button type="button" className={styles.bouton} onClick={fermer}>
          Annuler
        </button>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={valider}>
          Valider
        </button>
      </div>
    </>
  );
}

function EditionAnimation({ id, section, retours, modifier, fermer }: PropsEdition & { id: string }) {
  const existant = retours.animations[id];
  const fiche = ANIMATIONS[id];
  const [decision, setDecision] = useState<Decision | null>(existant?.decision ?? null);
  const [remarque, setRemarque] = useState(existant?.remarque ?? "");

  const valider = () => {
    modifier((r) => {
      const animations = { ...r.animations };
      if (!decision && !remarque.trim()) delete animations[id];
      else animations[id] = { id, decision, remarque };
      return { ...r, animations };
    });
    fermer();
  };

  return (
    <>
      <Entete surtitre={`${section} · Animation`} titre={fiche?.nom ?? id} fermer={fermer} />
      {fiche?.description && <p className={styles.note}>{fiche.description}</p>}
      <div className={styles.choix} role="group" aria-label="Votre choix">
        {(["garder", "supprimer"] as const).map((choix) => (
          <button key={choix} type="button" data-choix={choix} aria-pressed={decision === choix} onClick={() => setDecision(decision === choix ? null : choix)}>
            {choix === "garder" ? "Garder" : "Supprimer"}
          </button>
        ))}
      </div>
      <label className={styles.etiquette} htmlFor="relecture-remarque-animation">
        Une précision ? (facultatif)
      </label>
      <textarea
        id="relecture-remarque-animation"
        className={`${styles.champ} ${styles.petitChamp}`}
        value={remarque}
        onChange={(e) => setRemarque(e.target.value)}
        onKeyDown={raccourci(valider)}
        placeholder="Plus lente, plus discrète, seulement sur ordinateur…"
      />
      <div className={styles.actions}>
        <button type="button" className={styles.bouton} onClick={fermer}>
          Annuler
        </button>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={valider}>
          Valider
        </button>
      </div>
    </>
  );
}

function EditionRemarque({ cible, section, retours, modifier, fermer }: PropsEdition & { cible: Extract<Cible, { type: "remarque" }> }) {
  const existante = retours.remarques.find((m) => m.id === cible.id);
  const [remarque, setRemarque] = useState(existante?.remarque ?? "");
  const description = existante?.cible ?? (cible.el ? decrire(cible.el) : "");

  const valider = () => {
    modifier((r) => {
      const autres = r.remarques.filter((m) => m.id !== cible.id);
      if (!remarque.trim()) return { ...r, remarques: autres };
      const fiche = { id: cible.id, section: existante?.section ?? section, cible: description, selecteur: existante?.selecteur ?? (cible.el ? selecteur(cible.el) : ""), remarque };
      return { ...r, remarques: [...autres, fiche] };
    });
    fermer();
  };

  return (
    <>
      <Entete surtitre={`${section} · Remarque`} titre={description} fermer={fermer} />
      <textarea
        className={styles.champ}
        value={remarque}
        onChange={(e) => setRemarque(e.target.value)}
        onKeyDown={raccourci(valider)}
        placeholder="Qu’aimeriez-vous changer ici ?"
        aria-label="Votre remarque"
      />
      <div className={styles.actions}>
        {existante && (
          <button
            type="button"
            className={`${styles.bouton} ${styles.gauche} ${styles.danger}`}
            onClick={() => {
              modifier((r) => ({ ...r, remarques: r.remarques.filter((m) => m.id !== cible.id) }));
              fermer();
            }}
          >
            Supprimer
          </button>
        )}
        <button type="button" className={styles.bouton} onClick={fermer}>
          Annuler
        </button>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={valider}>
          Valider
        </button>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Étiquettes des animations, posées sur la page et qui suivent le défilement.
 * Une seule par animation à l'écran (la lumière des boutons est partout), et
 * jamais deux l'une sur l'autre : la suivante se range dessous.
 * ------------------------------------------------------------------------- */

function Pastilles({ elements, retours, ouvrir }: { elements: HTMLElement[]; retours: Retours; ouvrir: (el: HTMLElement, id: string) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let image = 0;
    const placer = () => {
      image = 0;
      const haut = (document.querySelector("header")?.getBoundingClientRect().bottom ?? 0) + 8;
      const bas = innerHeight - 90;
      const montrees = new Set<string>();
      const posees: { x: number; y: number; l: number; h: number }[] = [];
      elements.forEach((el, i) => {
        const b = refs.current[i];
        if (!b) return;
        const id = el.dataset.animation ?? "";
        const r = el.getBoundingClientRect();
        const visible = el.isConnected && r.width > 0 && r.height > 0 && r.bottom > haut + 30 && r.top < bas && !montrees.has(id);
        b.hidden = !visible;
        if (!visible) return;
        const l = b.offsetWidth;
        const h = b.offsetHeight;
        const x = Math.min(Math.max(r.left + 10, 8), innerWidth - l - 8);
        let y = Math.max(r.top + 10, haut);
        for (let essai = 0; essai < 16; essai++) {
          const gene = posees.find((p) => x < p.x + p.l + 4 && p.x < x + l + 4 && y < p.y + p.h + 4 && p.y < y + h + 4);
          if (!gene) break;
          y = gene.y + gene.h + 6;
        }
        if (y > bas - h) {
          b.hidden = true;
          return;
        }
        montrees.add(id);
        posees.push({ x, y, l, h });
        b.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      });
    };
    const demander = () => {
      if (!image) image = requestAnimationFrame(placer);
    };
    placer();
    addEventListener("scroll", demander, { passive: true });
    addEventListener("resize", demander);
    const minuterie = setInterval(demander, 800);
    return () => {
      cancelAnimationFrame(image);
      clearInterval(minuterie);
      removeEventListener("scroll", demander);
      removeEventListener("resize", demander);
    };
  }, [elements]);

  return elements.map((el, i) => {
    const id = el.dataset.animation ?? "";
    return (
      <button
        key={`${id}-${i}`}
        ref={(b) => {
          refs.current[i] = b;
        }}
        type="button"
        hidden
        className={styles.pastille}
        data-decision={retours.animations[id]?.decision ?? undefined}
        onClick={() => ouvrir(el, id)}
        title={ANIMATIONS[id]?.description}
      >
        <Sparkles aria-hidden />
        <span>{ANIMATIONS[id]?.court ?? id}</span>
      </button>
    );
  });
}

/* ---------------------------------------------------------------------------
 * Panneaux ancrés au-dessus de la barre
 * ------------------------------------------------------------------------- */

function Aide({ fermer }: { fermer: () => void }) {
  return (
    <section className={`${styles.carte} ${styles.ancree}`} aria-label="Comment relire le site">
      <Entete surtitre="Mode relecture" titre="Rien de ce que vous faites ici ne change le vrai site." fermer={fermer} />
      <ol className={styles.etapes}>
        <li>Touchez un texte pour le réécrire.</li>
        <li>Touchez une image pour laisser une remarque.</li>
        <li>Les étiquettes « Animation » permettent de garder ou de supprimer chaque animation.</li>
        <li>Ailleurs, touchez pour proposer un changement.</li>
        <li>« Naviguer » rend le site normal (ouvrir la FAQ, les onglets…), « Modifier » revient à la relecture.</li>
        <li>Quand vous avez fini : « Copier », puis collez vos retours dans un message.</li>
      </ol>
      <p className={styles.note}>Vos retours restent dans ce navigateur : vous pouvez fermer la page et revenir plus tard avec le même lien.</p>
      <div className={styles.actions}>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={fermer}>
          Compris
        </button>
      </div>
    </section>
  );
}

function Liste({
  retours,
  modifier,
  voir,
  fermer,
  aide,
  sortir,
}: {
  retours: Retours;
  modifier: (maj: (r: Retours) => Retours) => void;
  voir: (el: Element) => void;
  fermer: () => void;
  aide: () => void;
  sortir: () => void;
}) {
  const [confirmer, setConfirmer] = useState(false);
  const textes = Object.values(retours.textes);
  const images = Object.values(retours.images);
  const animations = Object.values(retours.animations).filter((a) => a.decision || a.remarque.trim());
  const vide = !textes.length && !images.length && !animations.length && !retours.remarques.length;

  const trouver = (selecteurCss: string) => {
    try {
      return document.querySelector(selecteurCss);
    } catch {
      return null;
    }
  };

  const Voir = ({ el }: { el: Element | null }) =>
    el ? (
      <button type="button" onClick={() => voir(el)}>
        Voir
      </button>
    ) : null;

  return (
    <section className={`${styles.carte} ${styles.ancree}`} aria-label="Mes retours">
      <Entete surtitre="Mes retours" titre={vide ? undefined : "Tout ce qui partira avec « Copier »"} fermer={fermer} />
      {vide && <p className={styles.vide}>Aucun retour pour l’instant. Touchez un texte, une image ou une étiquette « Animation ».</p>}

      {textes.length > 0 && (
        <div className={styles.groupe}>
          <h3>Textes</h3>
          {textes.map((t) => (
            <div key={t.cle} className={styles.retour}>
              <p className={styles.surtitre}>
                {t.section} · {libelleCle(t.cle)}
              </p>
              <p className={styles.avant}>{t.avant}</p>
              <p>{t.apres}</p>
              {t.remarque.trim() && <p className={styles.note}>{t.remarque}</p>}
              <div className={styles.boutonsRetour}>
                <Voir el={document.querySelector(`[${ATTR_BLOC}="${CSS.escape(t.cle)}"]`)} />
                <button type="button" className={styles.danger} onClick={() => modifier((r) => ({ ...r, textes: Object.fromEntries(Object.entries(r.textes).filter(([c]) => c !== t.cle)) }))}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {animations.length > 0 && (
        <div className={styles.groupe}>
          <h3>Animations</h3>
          {animations.map((a) => (
            <div key={a.id} className={styles.retour}>
              <p className={`${styles.surtitre} ${a.decision === "supprimer" ? styles.danger : ""}`}>
                {a.decision === "supprimer" ? "À supprimer" : a.decision === "garder" ? "À garder" : "Remarque"}
              </p>
              <p>{ANIMATIONS[a.id]?.nom ?? a.id}</p>
              {a.remarque.trim() && <p className={styles.note}>{a.remarque}</p>}
              <div className={styles.boutonsRetour}>
                <Voir el={document.querySelector(`[data-animation="${CSS.escape(a.id)}"]`)} />
                <button type="button" className={styles.danger} onClick={() => modifier((r) => ({ ...r, animations: Object.fromEntries(Object.entries(r.animations).filter(([c]) => c !== a.id)) }))}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.groupe}>
          <h3>Images</h3>
          {images.map((i) => (
            <div key={i.chemin} className={styles.retour}>
              <p className={styles.surtitre}>{i.section}</p>
              <p className={styles.fichier}>{i.chemin}</p>
              <p>{i.remarque}</p>
              <div className={styles.boutonsRetour}>
                <Voir el={document.querySelector(`[${ATTR_IMAGE}="${CSS.escape(i.chemin)}"]`)} />
                <button type="button" className={styles.danger} onClick={() => modifier((r) => ({ ...r, images: Object.fromEntries(Object.entries(r.images).filter(([c]) => c !== i.chemin)) }))}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {retours.remarques.length > 0 && (
        <div className={styles.groupe}>
          <h3>Remarques</h3>
          {retours.remarques.map((m) => (
            <div key={m.id} className={styles.retour}>
              <p className={styles.surtitre}>{m.section}</p>
              <p className={styles.note}>{m.cible}</p>
              <p>{m.remarque}</p>
              <div className={styles.boutonsRetour}>
                <Voir el={m.selecteur ? trouver(m.selecteur) : null} />
                <button type="button" className={styles.danger} onClick={() => modifier((r) => ({ ...r, remarques: r.remarques.filter((x) => x.id !== m.id) }))}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className={styles.etiquette} htmlFor="relecture-generale">
        Remarque générale
      </label>
      <textarea
        id="relecture-generale"
        className={`${styles.champ} ${styles.petitChamp}`}
        value={retours.generale}
        onChange={(e) => modifier((r) => ({ ...r, generale: e.target.value }))}
        placeholder="Une impression d’ensemble, une idée…"
      />
      <label className={styles.etiquette} htmlFor="relecture-prenom">
        Votre prénom (facultatif)
      </label>
      <input
        id="relecture-prenom"
        className={`${styles.champ} ${styles.petitChamp}`}
        style={{ minHeight: 0 }}
        value={retours.prenom}
        onChange={(e) => modifier((r) => ({ ...r, prenom: e.target.value }))}
        autoComplete="given-name"
      />

      <div className={styles.actions}>
        {confirmer ? (
          <>
            <span className={styles.gauche}>Tout effacer ?</span>
            <button type="button" className={styles.bouton} onClick={() => setConfirmer(false)}>
              Non
            </button>
            <button
              type="button"
              className={`${styles.bouton} ${styles.danger}`}
              onClick={() => {
                modifier(() => AUCUN_RETOUR);
                setConfirmer(false);
              }}
            >
              Oui, tout effacer
            </button>
          </>
        ) : (
          <>
            <button type="button" className={`${styles.bouton} ${styles.gauche}`} onClick={aide}>
              Aide
            </button>
            {!vide && (
              <button type="button" className={`${styles.bouton} ${styles.danger}`} onClick={() => setConfirmer(true)}>
                Tout effacer
              </button>
            )}
            <button type="button" className={styles.bouton} onClick={sortir}>
              Quitter la relecture
            </button>
          </>
        )}
      </div>
    </section>
  );
}

/** Presse-papiers refusé (certains navigateurs) : le texte à copier à la main, ou le fichier. */
function Secours({ json, fermer }: { json: string; fermer: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const telecharger = () => {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "relecture-pizzeria-des-allees.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className={`${styles.carte} ${styles.ancree}`} aria-label="Copier les retours à la main">
      <Entete surtitre="Copie manuelle" titre="Le navigateur a refusé la copie : sélectionnez tout, puis copiez." fermer={fermer} />
      <textarea ref={ref} className={`${styles.champ} ${styles.json}`} readOnly value={json} aria-label="Vos retours" />
      <div className={styles.actions}>
        <button type="button" className={styles.bouton} onClick={telecharger}>
          Télécharger le fichier
        </button>
        <button type="button" className={`${styles.bouton} ${styles.principal}`} onClick={fermer}>
          Fermer
        </button>
      </div>
    </section>
  );
}
