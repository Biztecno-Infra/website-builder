import type { Breakpoint } from '../types';

/**
 * Resolves a value across breakpoints with tablet-first mobile fallback.
 * mobile falls back to tablet, tablet falls back to desktop.
 */
export function resolveResponsive<T>(
  breakpoint: Breakpoint,
  desktop: T,
  tablet: T | undefined,
  mobile: T | undefined,
): T {
  if (breakpoint === 'mobile') return mobile ?? tablet ?? desktop;
  if (breakpoint === 'tablet') return tablet ?? desktop;
  return desktop;
}

// Returns true when a breakpoint-specific override exists for any property.
export function isBreakpointOverridden(
  breakpoint: Breakpoint,
  tabletVal: unknown,
  mobileVal: unknown,
): boolean {
  return (
    (breakpoint === 'tablet' && tabletVal !== undefined) ||
    (breakpoint === 'mobile' && mobileVal !== undefined)
  );
}
