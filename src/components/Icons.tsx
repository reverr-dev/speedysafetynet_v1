/**
 * Inline SVG icons.
 *
 * Deliberately not an icon library: a dependency would add a package to
 * install and kilobytes to ship for the dozen glyphs this site actually uses.
 * These inherit `currentColor` so they theme automatically.
 */

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

export const PhoneIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const MailIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

export const PinIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const CheckIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className} strokeWidth={2.6}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const BadgeCheckIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export const SearchIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const BasketIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const MenuIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export const CloseIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const TrashIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export const PlusIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ArrowRightIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** WhatsApp glyph — filled, not stroked, so it needs its own definition. */
export const WhatsAppIcon = ({ size = 20, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
    focusable={false}
  >
    <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.3.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10Z" />
  </svg>
);

// ── Service icons ────────────────────────────────────────────────────────

export const ShieldIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const BirdIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M16 7h.01" />
    <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
    <path d="m20 7 2 .5-2 .5" />
    <path d="M10 18v3M14 17.75V21" />
  </svg>
);

export const SportsIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

export const ShadeIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 2v3M4.2 6.2l2.1 2.1M2 14h3M19 14h3M17.7 8.3l2.1-2.1" />
    <path d="M3 20h18" />
    <path d="M6 20a6 6 0 0 1 12 0" />
  </svg>
);

export const GrassIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 20V9M12 20c0-4-3-7-6-8M12 20c0-4 3-7 6-8" />
    <path d="M3 20h18" />
  </svg>
);

export const WallIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v6M15 9v6M9 15v6" />
  </svg>
);

/** Maps a service's declared icon name to its component. */
export const SERVICE_ICONS = {
  shield: ShieldIcon,
  bird: BirdIcon,
  sports: SportsIcon,
  shade: ShadeIcon,
  grass: GrassIcon,
  wall: WallIcon,
} as const;
