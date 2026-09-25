import type { ReactNode } from "react";

// Petites arches dessinées à la main (trait fin), une par point : le four, le marché, la salle.
const DESSINS: ReactNode[] = [
  // La pâte : la gueule du four sous sa voûte, une flamme, un filet de fumée
  <>
    <path d="M4.5 41.5C4.2 25 10.8 10.2 20.2 9.8C29.4 9.5 35.9 24.6 35.6 41.3" />
    <path d="M2.5 41.8C13 41.2 27 42.4 37.5 41.6" />
    <path d="M13.2 41.4V34.6C13 30.2 16.1 27.1 20 27.1C23.9 27.2 26.9 30.3 26.8 34.5V41.3" />
    <path d="M20.1 38.6C18.2 37.4 18 35.2 19.6 33C19.9 34.4 20.8 34.9 21.4 34.2C22.3 35.8 22 37.7 20.1 38.6Z" />
    <path d="M20.2 6.9C18.9 5.5 21.3 4.3 20 2.5" />
  </>,
  // Les produits : un rameau d'olivier et son olive sous une arche
  <>
    <path d="M7.2 44V20.5C7 12.8 12.9 6.6 20.1 6.5C27.3 6.6 33.1 12.9 32.9 20.6V43.8" />
    <path d="M4.8 44.1C15 43.6 25 44.5 35.2 43.9" />
    <path d="M13.5 39C17 34.5 21 28.5 26.8 22.4" />
    <path d="M16.6 34.6C14 34.1 12.2 31.9 12 29.6C14.5 30 16.3 32.1 16.6 34.6Z" />
    <path d="M21.4 28.8C21.2 26 22.7 23.4 25 22.4C25.4 25 24 27.6 21.4 28.8Z" />
    <path d="M25.2 24.2C27.6 24.9 29.9 24.2 31 22.4C28.8 21.5 26.4 22.3 25.2 24.2Z" />
    <path d="M17.9 33.2C18.9 33.7 19.7 33.6 20.3 33" />
    <ellipse cx="22.1" cy="35.2" rx="2.3" ry="3" transform="rotate(-28 22.1 35.2)" />
  </>,
  // La maison : une arcade, une ampoule qui pend, une table dressée
  <>
    <path d="M8.4 44V22C8.2 14.2 13.6 8.1 20 8C26.4 8.1 31.8 14.2 31.6 22V43.9" />
    <path d="M5.5 44C15.5 43.5 25 44.4 34.5 43.8" />
    <path d="M20 8V19.2" />
    <path d="M20 19.2C17.6 19.4 16.4 21.4 16.6 23.4C16.8 25.6 18.4 26.8 20 26.8C21.6 26.8 23.2 25.6 23.4 23.4C23.6 21.4 22.4 19.4 20 19.2Z" />
    <path d="M18.6 23.6C19.2 22.6 19.6 24.6 20.1 23.4C20.6 22.4 21 24.4 21.5 23.4" />
    <path d="M13.6 22.7L12.2 22.3M26.4 22.7L27.8 22.3M15.1 28.1L14.1 29.1M24.9 28.1L25.9 29.1" />
    <path d="M12.8 37.9C17.6 37.6 22.4 38.1 27.2 37.8" />
    <path d="M15.4 38L14.7 43.7M24.6 38L25.3 43.7" />
  </>,
];

export function IconeArche({ variante, className }: { variante: number; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {DESSINS[variante % DESSINS.length]}
    </svg>
  );
}
