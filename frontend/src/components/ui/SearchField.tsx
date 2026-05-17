import { useRef, useEffect } from 'react';
import { SearchIcon, CloseIcon } from './icons';
import './SearchField.css';

interface SearchFieldTriggerProps {
  /** When provided, renders as a clickable trigger (no value/onChange) */
  onClick: () => void;
  placeholder?: string;
  value?: never;
  onChange?: never;
}

interface SearchFieldFullProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onClick?: never;
}

type SearchFieldProps = SearchFieldTriggerProps | SearchFieldFullProps;

export function SearchField(props: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!props.onClick) {
      inputRef.current?.focus();
    }
  }, [props.onClick]);

  if (props.onClick) {
    return (
      <button
        className="search-field"
        onClick={props.onClick}
        aria-label={props.placeholder ?? 'Поиск'}
      >
        <SearchIcon className="search-field__icon" />
        <span className="search-field__placeholder">
          {props.placeholder ?? 'поиск'}
        </span>
      </button>
    );
  }

  const { value, onChange, placeholder } = props;

  return (
    <div className="search-field search-field--full">
      <SearchIcon className="search-field__icon" />
      <input
        ref={inputRef}
        className="search-field__input"
        type="text"
        placeholder={placeholder ?? 'поиск'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="search-field__clear"
          onClick={() => onChange('')}
          aria-label="Очистить"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
