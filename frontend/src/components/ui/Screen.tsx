import type { ReactNode } from 'react';
import './Screen.css';

interface ScreenProps {
  children: ReactNode;
  /** Switches to space-between layout for screens with a sticky footer */
  withFooter?: boolean;
  /** Removes padding — for screens that manage their own spacing */
  noPadding?: boolean;
}

export function Screen({ children, withFooter = false, noPadding = false }: ScreenProps) {
  const classes = [
    'screen',
    withFooter && 'screen--with-footer',
    noPadding && 'screen--no-padding',
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}
