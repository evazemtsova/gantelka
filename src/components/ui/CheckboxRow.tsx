import './CheckboxRow.css';

interface CheckboxRowProps {
  name: string;
  meta: string;
  checked: boolean;
  onClick: () => void;
}

export function CheckboxRow({ name, meta, checked, onClick }: CheckboxRowProps) {
  return (
    <li className="checkbox-row" onClick={onClick}>
      <div className="checkbox-row__info">
        <span className="checkbox-row__name">{name}</span>
        <span className="checkbox-row__meta">{meta}</span>
      </div>
      <div className="checkbox-row__box">
        {checked && (
          <svg viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M1 6l5 5L15 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </li>
  );
}
