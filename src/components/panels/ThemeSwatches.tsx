import type { ThemeColors } from '../../types';

export function ThemeSwatches({ colors, onPick }: { colors: ThemeColors; onPick: (c: string) => void }) {
  const swatches: [string, string][] = [
    ['Primary', colors.primary],
    ['Accent', colors.accent],
    ['Text', colors.text],
    ['Light', colors.light],
    ['Background', colors.background],
  ];
  return (
    <div className={'pb-theme-swatches'}>
      {swatches.map(([name, color]) => (
        <button
          key={name}
          className={'pb-theme-swatch'}
          title={`${name}: ${color}`}
          style={{ background: color }}
          onClick={() => onPick(color)}
        />
      ))}
    </div>
  );
}
