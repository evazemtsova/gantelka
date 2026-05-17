import './Button.css';

interface ButtonProps {
  variant?: 'filled' | 'outlined';
  /** Icon rendered on the left side of the text */
  icon?: React.ReactNode;
  /** Square icon-only button (50×50). Pass the icon as children. */
  iconOnly?: boolean;
  /** flex: 1 — use inside a flex row to fill remaining space */
  flex?: boolean;
  /** width: 100% — full width standalone button */
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function Button({
  variant = 'outlined',
  icon,
  iconOnly = false,
  flex = false,
  fullWidth = false,
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    iconOnly && 'btn--icon-only',
    flex && 'btn--flex',
    fullWidth && 'btn--full-width',
    disabled && 'btn--disabled',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
