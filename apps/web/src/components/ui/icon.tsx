import type { SVGProps } from 'react';

/**
 * Ikon garis tipis (stroke 1.25) — sesuai arahan high-end-visual-design:
 * tidak memakai ikon tebal generik.
 */
const paths = {
  home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z',
  capture:
    'M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9ZM12 16.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z',
  chart: 'M4 20h16M7 16.5V11M12 16.5V6.5M17 16.5v-3.5',
  wati: 'M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h0a2 2 0 0 1-2-2V6.5ZM9 10h.01M12 10h.01M15 10h.01',
  arrow: 'M7 17 17 7M9 7h8v8',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  meter: 'M4.5 6.5h15v11h-15zM7.5 10h9v4h-9zM12 10v4',
  tag: 'M4 12.5V5a1 1 0 0 1 1-1h7.5L20 11.5 12.5 19 4 12.5ZM8.5 8.5h.01',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3ZM6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3',
  pencil: 'M15.5 5.5 18.5 8.5 9 18H6v-3l9.5-9.5ZM13.5 7.5l3 3',
  image: 'M4.5 5.5h15v13h-15zM4.5 15l4-4 4 4 2.5-2.5 4.5 4.5M15 9.5h.01',
  check: 'M5 12.5 10 17.5 19 7',
  retry: 'M5 12a7 7 0 1 0 2.05-4.95M5 5v3.5h3.5',
  bolt: 'M13 3 5.5 13.5H12L11 21l7.5-10.5H12L13 3Z',
  info: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 11v5M12 8h.01',
  alert: 'M12 4 3.5 19h17L12 4ZM12 10v4M12 16.5h.01',
  leaf: 'M5 19c0-8 5-13 14-14-1 9-6 14-14 14ZM5 19l7-7',
  store: 'M4 9.5 5.5 5h13L20 9.5M4 9.5V19h16V9.5M4 9.5c0 1.4 1.1 2.5 2.7 2.5S9.3 10.9 9.3 9.5c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.1 2.5 2.6 2.5S20 10.9 20 9.5M10 19v-4h4v4',
  crown: 'M4.5 17.5 3.5 8l5 4 3.5-6 3.5 6 5-4-1 9.5h-15Z',
  user: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20c.8-3.3 3.6-5.5 7-5.5s6.2 2.2 7 5.5',
  stop: 'M8 8h8v8H8z',
  close: 'M6 6l12 12M18 6 6 18',
  upload: 'M12 15V5M8 9l4-4 4 4M5 15v3.5h14V15',
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  ...rest
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}

