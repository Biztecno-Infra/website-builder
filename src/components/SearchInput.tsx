import { Icon } from './Icon';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'modal';
  iconPosition?: 'left' | 'right';
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  variant = 'default',
  iconPosition = 'left',
}: Props) {
  const icon = <Icon id="search" size={14} className={'pb-blocks-search-icon'} />;

  return (
    <div className={['pb-blocks-search-inner', 'pb-flex-row', variant === 'modal' && 'pb-blocks-search-inner--modal'].filter(Boolean).join(' ')}>
      {iconPosition === 'left' && icon}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {iconPosition === 'right' && icon}
    </div>
  );
}
