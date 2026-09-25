/**
 * Séparateur « ligne de l'Orb » : deux sinusoïdes douces, dessinées à la main
 * (style Haikei), avec un filet de reflet. `haut` = couleur de la section du
 * dessus, `bas` = couleur de la section du dessous.
 */
export function OrbVague({
  haut,
  bas,
  reflet = "var(--color-or-clair)",
  inverse = false,
  className,
}: {
  haut: string;
  bas: string;
  reflet?: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className={`relative -mb-px w-full overflow-hidden leading-none ${className ?? ""}`} style={{ background: haut }}>
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className={`block h-[clamp(2.75rem,5vw,5.5rem)] w-full ${inverse ? "-scale-x-100" : ""}`}
      >
        <path
          d="M0 46 C 160 20, 330 22, 480 44 S 800 74, 980 50 S 1300 18, 1440 40 L1440 90 L0 90 Z"
          fill={bas}
        />
        <path
          d="M0 58 C 170 36, 330 38, 480 56 S 800 84, 980 62 S 1300 32, 1440 52"
          fill="none"
          stroke={reflet}
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeDasharray="2 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
