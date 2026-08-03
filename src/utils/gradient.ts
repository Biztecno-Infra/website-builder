import type { ElementBackground } from '../types';

/** Builds the comma-joined "<color> <pos>%" stop list for a gradient background.
 *  Falls back to the legacy two-stop from/to shape when `stops` isn't set. */
export function gradientStopsCss(bg: Pick<ElementBackground, 'from' | 'to' | 'stops'>): string {
  const stops = bg.stops && bg.stops.length >= 2
    ? [...bg.stops].sort((a, b) => a.position - b.position)
    : [{ color: bg.from || '#006e75', position: 0 }, { color: bg.to || '#0b978e', position: 100 }];
  return stops.map(s => `${s.color} ${s.position}%`).join(',');
}
