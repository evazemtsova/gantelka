import './Button.css';

interface ButtonProps {
  variant?: 'filled' | 'outlined';
  /** Icon rendered on the left side of the text */
  icon?: React.ReactNode;
  /** Square icon-only button. Pass the icon as children. */
  iconOnly?: boolean;
  /** flex: 1 — use inside a flex row to fill remaining space */
  flex?: boolean;
  /** width: 100% — full width standalone button */
  fullWidth?: boolean;
  /** Height 64px — for hero CTAs (login, start-session) */
  size?: 'default' | 'lg';
  /** For filled variant: shows accent-dark background (done / active state) */
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  children?: React.ReactNode;
}

export function Button({
  variant = 'outlined',
  icon,
  iconOnly = false,
  flex = false,
  fullWidth = false,
  size = 'default',
  active = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  children,
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    iconOnly && 'btn--icon-only',
    flex && 'btn--flex',
    fullWidth && 'btn--full-width',
    size === 'lg' && 'btn--lg',
    active && 'btn--active',
    disabled && 'btn--disabled',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
