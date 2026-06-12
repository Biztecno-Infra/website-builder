import * as icons from '../icons';

function normalizeSvg(svg: string, size: number): string {
  return svg
    .replace(/\bwidth="[^"]*"/, `width="${size}"`)
    .replace(/\bheight="[^"]*"/, `height="${size}"`)
    .replace(/\bstroke="([^"]*)"/g, (m, v) => v === 'none' ? m : 'stroke="currentColor"')
    .replace(/\bfill="([^"]*)"/g, (m, v) => v === 'none' ? m : 'fill="currentColor"');
}

const ICONS: Record<string, string> = { ...icons };

interface IconProps {
  id: string;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
}

export function Icon({ id, size = 16, color, className, title }: IconProps) {
  const raw = ICONS[id];

  if (!raw) {
    return (
      <span
        className={className}
        title={title ?? String(id)}
        style={{ display: 'inline-flex', width: size, height: size,
          background: 'rgba(0,110,117,0.12)', borderRadius: 3, flexShrink: 0 }}
      />
    );
  }

  return (
    <span
      className={className}
      title={title ?? String(id)}
      style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0, ...(color ? { color } : {}) }}
      dangerouslySetInnerHTML={{ __html: normalizeSvg(raw, size) }}
    />
  );
}

export function registerIcons(extra: Record<string, string>) {
  Object.assign(ICONS, extra);
}

export type IconId = keyof typeof icons;
