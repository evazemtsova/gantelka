import type { ReactNode } from 'react';
import './ScreenFooter.css';

interface ScreenFooterProps {
  children: ReactNode;
  column?: boolean;
}

export function ScreenFooter({ children, column = false }: ScreenFooterProps) {
  return (
    <div className={`screen-footer${column ? ' screen-footer--column' : ''}`}>
      {children}
    </div>
  );
}
