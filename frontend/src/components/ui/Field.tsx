import type { ReactNode } from 'react';
import './Field.css';

interface FieldProps {
  label: string;
  /** Appends an «(optional)»-style muted span after the label text */
  optional?: string;
  children: ReactNode;
}

export function Field({ label, optional, children }: FieldProps) {
  return (
    <div className="field">
      <span className={`field__label${optional ? ' field__label--optional' : ''}`}>
        {label}
        {optional && <span> ({optional})</span>}
      </span>
      {children}
    </div>
  );
}
