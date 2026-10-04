/*
 * La devanture qui vit en boucle (convives, pizzaiolo), posée sur la photo du
 * haut de page, comme sur l'ancien site : rien ne se télécharge avant que la
 * page ait fini de charger (la photo s'affiche d'abord), ni en mouvement
 * réduit, ni en économie de données ou sur un réseau lent (la photo suffit).
 * En pause dès qu'elle sort de l'écran. Sur téléphone, le navigateur prend la
 * version 720p (sources de Hero.astro).
 */
import { reduit } from "./animations";

type Connexion = { saveData?: boolean; effectiveType?: string };

const video = document.querySelector<HTMLVideoElement>("[data-video-devanture]");
const connexion = (navigator as Navigator & { connection?: Connexion }).connection;
const reseauPermis = !connexion?.saveData && !/2g|3g/.test(connexion?.effectiveType ?? "");

if (video && !reduit && reseauPermis) {
  let aLEcran = false;
  let autorisee = false;
  const synchroniser = () => {
    if (aLEcran && autorisee) video.play().catch(() => {});
    else if (!video.paused) video.pause();
  };

  video.muted = true;
  // La photo reste dessous : la vidéo n'apparaît (en fondu) qu'une fois la lecture vraiment lancée
  video.addEventListener("playing", () => video.setAttribute("data-lecture", ""), { once: true });

  new IntersectionObserver(([entree]) => {
    aLEcran = !!entree?.isIntersecting;
    synchroniser();
  }).observe(video);

  // Après le chargement, au premier moment calme : la vidéo ne concurrence pas la photo
  const autoriser = () => {
    const plusTard = (f: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(f, { timeout: 2000 }) : setTimeout(f, 300));
    plusTard(() => {
      autorisee = true;
      synchroniser();
    });
  };
  if (document.readyState === "complete") autoriser();
  else window.addEventListener("load", autoriser, { once: true });
}
