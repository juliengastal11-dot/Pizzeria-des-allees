/** Petits badges des réseaux de carte, comme au comptoir : Visa, Mastercard, CB. */

export function LogoVisa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" role="img" aria-label="Visa" className={className}>
      <rect width="48" height="30" rx="5" fill="#1434CB" />
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="14"
        fill="#ffffff"
      >
        VISA
      </text>
    </svg>
  );
}

export function LogoMastercard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" role="img" aria-label="Mastercard" className={className}>
      <rect width="48" height="30" rx="5" fill="#f4f2ee" />
      <circle cx="20" cy="15" r="9" fill="#EB001B" />
      <circle cx="28" cy="15" r="9" fill="#F79E1B" />
      <path d="M24 8.3a9 9 0 0 1 0 13.4 9 9 0 0 1 0-13.4Z" fill="#FF5F00" />
    </svg>
  );
}

export function LogoCB({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" role="img" aria-label="CB" className={className}>
      <rect width="48" height="30" rx="5" fill="#0b2f5c" />
      <text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="13" fill="#ffffff">
        CB
      </text>
    </svg>
  );
}
