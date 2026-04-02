import { useState } from 'react';
import { ChevronIcon } from './icons';
import './Dropdown.css';

interface Option<T> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  value: T | null;
  options: Option<T>[];
  placeholder: string;
  onChange: (value: T) => void;
}

export function Dropdown<T extends string>({ value, options, placeholder, onChange }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div className="dropdown">
      <button className="dropdown__trigger" onClick={() => setOpen((o) => !o)}>
        <span>{selectedLabel}</span>
        <ChevronIcon className={`dropdown__chevron${open ? ' dropdown__chevron--up' : ''}`} />
      </button>
      {open && (
        <ul className="dropdown__list">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                className="dropdown__item"
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
