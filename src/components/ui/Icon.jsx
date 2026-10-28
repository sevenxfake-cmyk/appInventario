import React from 'react';

// Iconos SVG ligeros, sin instalar librerías adicionales.
const drawings = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  product: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="M3 7v10l9 5 9-5V7M12 12v10" /></>,
  category: <><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></>,
  supplier: <><path d="M3 9h11v9H3zM14 12h4l3 3v3h-7z" /><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M3 6h11v3" /></>,
  kardex: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
  alert: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  money: <><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9h19" /><circle cx="16" cy="14" r="2" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="M5 5l14 14M19 5 5 19" /></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5" /></>,
  check: <><path d="m4 12 5 5L20 6" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>
};

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {drawings[name] || drawings.dashboard}
    </svg>
  );
}
