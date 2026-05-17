import type { ReactNode } from 'react';
import './Chip.css';

interface ChipProps {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function Chip({ selected = false, onClick, children }: ChipProps) {
  return (
    <button
      className={`chip${selected ? ' chip--selected' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
