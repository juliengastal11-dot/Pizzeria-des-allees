/*
 * La devanture qui vit en boucle (convives, pizzaiolo), posée sur la photo du
 * haut de page : rien ne se télécharge avant que la page ait fini de charger
 * (la photo s'affiche d'abord), ni en mouvement réduit, ni en économie de
 * données ou sur un réseau lent (la photo suffit : voir mouvement.ts). Elle
 * ne démarre qu'une fois l'entrée animée du haut de page terminée, pour ne
 * pas jouer sous un zoom ou un masque en mouvement, et se met en pause dès
 * qu'elle sort de l'écran. Sur téléphone, le navigateur prend la version 720p
 * (sources de Hero.astro).
 */
import { introTerminee } from "./animations";
import { videoActive } from "./mouvement";

const video = document.querySelector<HTMLVideoElement>("[data-video-devanture]");

if (video && videoActive) {
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

  const pageChargee = new Promise<void>((resolu) => {
    if (document.readyState === "complete") resolu();
    else addEventListener("load", () => resolu(), { once: true });
  });
  pageChargee.then(() => {
    // Le téléchargement commence pendant l'entrée animée, pour que la lecture démarre dès qu'elle finit
    video.preload = "auto";
    video.load();
  });
  // Pas d'attente de « canplay » : Safari sur iPhone ne précharge rien tant que play() n'est pas appelé.
  // La vidéo reste invisible jusqu'à « playing » (voir plus haut), donc un démarrage tardif ne se voit pas.
  Promise.all([pageChargee, Promise.race([introTerminee, new Promise((r) => setTimeout(r, 6000))])]).then(() => {
    autorisee = true;
    synchroniser();
  });
}
