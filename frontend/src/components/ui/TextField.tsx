import './TextField.css';

interface TextFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'date';
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  multiline?: boolean;
  rows?: number;
  /** Passed to the underlying input for DnD or other integrations */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  multiline = false,
  rows,
  inputRef,
}: TextFieldProps) {
  if (multiline) {
    return (
      <textarea
        className="text-field text-field--multiline"
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      className="text-field"
      type={type}
      placeholder={placeholder}
      value={value}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
